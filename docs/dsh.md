# DeepSeek Harness Integration

This document describes how the Elephant-Goldfish Model (EGM) plugin works
inside DeepSeek Harness (DSH).

## 安装

将插件目录添加到 DSH profile 中：

```sh
dsh plugin --profile <profile-name> add ./dsh-elephant-goldfish-model
```

或者在 `~/.dsh/profiles/<name>/cordis.patch.yml` 中添加：

```yaml
- insert:
    - id: dsh-elephant-goldfish-model-skills
      name: '@deepseek-ai/dsh-skill-filesystem'
      config:
        providerName: dsh-elephant-goldfish-model
        includeDefaultRoots: false
        bundledSkillDir: "<plugin-root>/skills"
        watch: true
```

## 可用 Skills

安装后，以下 EGM skills 可通过 `skill` 工具加载：

| Skill | 用途 |
|-------|------|
| `egm-brainstorm` | 头脑风暴，探索想法的可能性 |
| `egm-draft` | 起草设计文档 |
| `egm-review` | Goldfish 评审设计文档 |
| `egm-review-loop` | 多轮迭代评审循环 |
| `egm-resolve` | 解决评审中发现的问题 |
| `egm-drift-report` | 检查代码与设计文档的偏差 |
| `egm-bootstrap` | 为仓库生成 EGM 兼容的 README |
| `egm-lite` | 轻量级 EGM 工作流 |

## Subagent 使用

EGM 的 Goldfish 评审需要独立上下文的子代理。在 DSH 中使用 `subagent` 工具：

```javascript
// 示例：派生一个 zoom-out 评审员
subagent({
  description: "EGM zoom-out review",
  prompt: "Read agents/zoom_out.md first, then review this design..."
})
```

每个 persona 定义在 `agents/<name>.md` 中，其 frontmatter `name` 字段标识角色类型。

## 与 Claude Code 的区别

| 特性 | Claude Code | DeepSeek Harness |
|------|-------------|------------------|
| 子代理工具 | `Agent` | `subagent` |
| Plugin root 变量 | `${CLAUDE_PLUGIN_ROOT}` | 无（路径由 bundler 解析） |
| Skill 加载 | 内置 | `dsh-skill-filesystem` provider |
| Artifact 目录 | `CLAUDE.md` 中配置 | 使用工作目录 |

## 资源路径

Skills 在执行时通过相对路径访问以下共享资源：

- `agents/<persona>.md` — Goldfish 评审员角色定义
- `resources/document_standards/` — 文档标准模板
- `resources/execution_instructions.md` — 执行约束指南
- `assets/icon.svg` — 插件图标

这些路径相对于插件根目录，由 `bundledSkillDir` 配置自动解析。
