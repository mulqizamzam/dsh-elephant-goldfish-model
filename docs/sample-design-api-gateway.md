# Design: API Gateway with Rate Limiting

## Problem Statement

Our microservices currently lack a unified entry point for authentication and traffic management. Each service implements its own auth logic inconsistently, leading to security gaps and duplicated effort. Client applications must manage credentials against multiple endpoints. This design introduces a centralized API gateway to solve these problems.

**Current state:** No gateway exists. Auth is scattered across 5+ services with inconsistent JWT handling.
**User impact:** Clients struggle with multi-endpoint auth; security audits reveal credential leakage risks.
**Success metrics:** p99 latency < 50ms, 99.9% availability, < 0.1% legitimate 429 error rate.

## Goals & Non-Goals

**Goals:**
- Centralized JWT authentication for all microservice traffic
- Per-API-key rate limiting (configurable, not hardcoded)
- Request routing based on path prefix to correct backend service
- Structured request logging for observability

**Non-Goals:**
- OAuth2 / OpenID Connect delegation (out of scope for v1)
- Request transformation or payload modification
- Service-to-service mTLS authentication
- GraphQL support

## Requirements

- Support JWT authentication (HS256 algorithm, shared secret via env config)
- Configurable rate limit per API key (default target: 1000 req/min, tunable via config)
- Route requests to correct microservice based on URL path prefix
- Return HTTP 429 when rate limit exceeded
- Log all requests to CloudWatch with structured JSON format

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| NGINX ingress controller + lua-resty-limit-traffic | Adds infrastructure complexity; our K8s setup doesn't support custom nginx configs easily. Better to keep logic in-app for faster iteration. |
| AWS ALB with Lambda@Edge auth | Managed service lock-in; higher cost at scale ($200+/mo vs ~$20 for self-hosted). Only viable if we're fully on AWS already. |
| Envoy proxy | Overkill for current traffic volume (~500 RPS peak); steep learning curve for the team. Revisit if we hit 10K+ RPS. |
| Sidecar pattern (Istio/Linkerd) | Requires service mesh adoption across all services — too big a change for v1. Future consideration. |

## Architecture

The gateway is a Node.js service using **Express** (decision pre-made: team familiarity, ecosystem maturity). It will:
1. Validate JWT tokens using `jsonwebtoken` library v9.x (algorithm whitelisted to HS256 only)
2. Check rate limit using `redis` client v4.x with sliding window counter
3. Forward requests to backend services via HTTP (using `node-fetch`)
4. Aggregate responses and return to client

**Technology decisions (pre-determined):**
- Framework: Express 4.x
- JWT library: `jsonwebtoken` v9.x
- Redis client: `ioredis` v5.x
- Config source: Environment variables (AWS Secrets Manager for production secrets)
- Logging: Pino logger with CloudWatch transport

## Data Flow

```
Client → [Gateway] → JWT validate → Rate limit check → Route to service → Response
                 ↑              ↑
            Redis           Redis
         (rate count)    (token cache)
```

## Target Scope & File Boundary

Files to create:
- `src/gateway/server.ts` — Express app bootstrap, health check
- `src/middleware/auth.ts` — JWT validation middleware
- `src/middleware/rate-limit.ts` — Redis-backed rate limiter
- `src/middleware/logger.ts` — Structured request logging
- `src/types/index.ts` — TypeScript type definitions
- `src/config/index.ts` — Configuration loader (env vars)
- `tests/gateway.spec.ts` — Main test suite
- `tests/middleware/auth.spec.ts` — Auth middleware tests
- `tests/middleware/rate-limit.spec.ts` — Rate limiter tests

No existing files will be modified.

## Test Plan

**Happy path:**
- Valid JWT + within rate limit → 200 from backend
- Health check endpoint returns 200 `{status: "ok"}`

**Edge cases:**
- Expired JWT → 401 with `{"error": "token_expired"}`
- Invalid signature → 401 with `{"error": "invalid_signature"}`
- Rate limit exceeded → 429 with `{"error": "rate_limited", "retryAfter": <seconds>}`
- Redis unavailable → 503 with `{"error": "service_unavailable"}` (no fallback auth — fail closed)
- Unknown path → 404 from gateway (not forwarded)

**Integration:**
- End-to-end request through full middleware chain
- Concurrent rate limit counter accuracy (100 simultaneous requests)

## Implementation Plan

### Phase 1: Skeleton & Authentication (Days 1-2)
1.1 Initialize Express project with TypeScript, install dependencies (express, jsonwebtoken, ioredis, pino)
1.2 Create `src/config/index.ts` — load env vars with validation schema (zod)
1.3 Create `src/gateway/server.ts` — boot Express, register middleware, add `/health` endpoint
1.4 Create `src/middleware/auth.ts` — implement JWT validation middleware using jsonwebtoken
1.5 Write tests in `tests/middleware/auth.spec.ts` — cover valid, expired, invalid, missing token
1.6 Verify: `npm test` passes, `/health` returns 200

### Phase 2: Rate Limiting (Days 3-4)
2.1 Create `src/middleware/rate-limit.ts` — sliding window rate limiter using Redis INCR/EXPIRE
2.2 Create `src/types/index.ts` — RateLimitConfig, GatewayLog interfaces
2.3 Write tests in `tests/middleware/rate-limit.spec.ts` — cover within limit, exceeded, Redis failure
2.4 Wire rate-limit middleware into server between auth and router
2.5 Verify: rate-limited request returns 429 with correct Retry-After header

### Phase 3: Routing & Logging (Day 5)
3.1 Create `src/middleware/logger.ts` — Pino middleware with structured CloudWatch-ready output
3.2 Implement proxy router — match path prefix to backend service URL from config
3.3 Forward requests using node-fetch with timeout (5s) and response aggregation
3.4 Write integration tests in `tests/gateway.spec.ts`
3.5 Verify: end-to-end request flows through auth → rate-limit → route → log

### Phase 4: Hardening (Day 6-7)
4.1 Load test with k6 targeting 1000 concurrent users
4.2 Add graceful shutdown handler (Redis connection cleanup)
4.3 Add Prometheus metrics export (/metrics endpoint)
4.4 Document deployment steps and runbook
4.5 Final test suite pass + manual smoke test

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Redis single point of failure | High | Fail-closed: if Redis unreachable, return 503 immediately (don't auth). Add Redis Sentinel/Cluster for prod. |
| JWT secret rotation breaks active tokens | Medium | Support dual-key validation during rotation window (old + new key both accepted for 24h). |
| No fallback if Redis is down | High | Already addressed: fail-closed 503 behavior. Client should implement exponential backoff. |
| Express middleware order bug causes auth bypass | Medium | Add integration test verifying auth middleware runs before every route. Use Helmet for security headers. |
| Rate limit counter drift under high concurrency | Low | Use Redis Lua scripts for atomic INCR+EXPIRE. Add monitoring on counter accuracy. |

## Rollout & Rollback

**Strategy:** Blue-green deployment via Kubernetes.
- Deploy gateway as new Deployment alongside existing services (no changes needed there)
- Switch ALB listener from direct service routes to gateway
- Monitor error rate and p99 latency for 30 minutes
- Rollback trigger: error rate > 1% or p99 latency > 200ms → revert ALB listener

**Session migration:** Not applicable — stateless gateway, no session storage.
