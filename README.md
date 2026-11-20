# dsh-elephant-goldfish-model

DeepSeek Harness 插件：将 Google 的 [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) 设计评审工作流带入 DSH。

## 概述

**大象**持有项目上下文并起草规范。**金鱼**评审员在没有之前对话的情况下审查草稿，帮助暴露未说明的假设和盲点。**你**做出架构权衡并在实施前批准规范。

- 🐘 **设计阶段**：用大象思维发展想法、起草设计方案
- 🐟 **评审阶段**：用金鱼视角 fresh eyes 审查设计和代码
- 🔍 **偏差检测**：检查代码是否偏离设计文档

## 安装

```sh
# 将插件添加到 DSH profile
dsh plugin --profile web add ./dsh-elephant-goldfish-model

# 验证安装
dsh --profile web --dump-config | grep elephant-goldfish
```

## 使用方法

安装后，通过 `skill` 工具调用各 EGM skills：

```
skill("egm-brainstorm")   # 头脑风暴想法
skill("egm-draft")        # 起草设计文档
skill("egm-review")       # Goldfish 评审
skill("egm-review-loop")  # 多轮迭代评审
skill("egm-resolve")      # 解决评审问题
skill("egm-drift-report") # 检查代码偏差
skill("egm-bootstrap")    # 生成仓库 README
skill("egm-lite")         # 轻量级工作流
```

## 插件结构

```
dsh-elephant-goldfish-model/
├── package.json              # DSH bundle 元数据
├── index.mjs                 # 入口点
├── cordis.patch.yml          # Cordis 配置注入（注册 skill-filesystem）
├── skills/                   # EGM skills（8个）
│   ├── egm-bootstrap/
│   ├── egm-brainstorm/
│   ├── egm-draft/
│   ├── egm-drift-report/
│   ├── egm-lite/
│   ├── egm-resolve/
│   ├── egm-review/
│   └── egm-review-loop/
├── agents/                   # Goldfish 评审员 persona 定义
├── resources/                # 文档标准和执行指令
├── assets/                   # 插件图标
└── docs/
    └── dsh.md               # DSH 集成指南
```

## 技术细节

- **DSH 版本要求**: `0.2.1-rc.2`
- **Node.js 要求**: `>=22.5.0`
- **License**: Apache-2.0（继承自上游 EGM）
- **Skill Provider**: 使用 `@deepseek-ai/dsh-skill-filesystem` 的 `bundledSkillDir` 机制，在 rank 600 注册

## 与原生的区别

此插件是上游 [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) 的 DSH 适配层：

1. 复用了上游所有 skills、agents personas 和 resources
2. 通过 `cordis.patch.yml` 注册 `dsh-skill-filesystem` provider
3. 替换了 `${CLAUDE_PLUGIN_ROOT}` 等 Claude Code 特定引用
4. 添加了 DSH 子代理工具 (`subagent`) 的适配说明

上游由 Google LLC 开发，本适配层由 DeepSeek Harness 社区维护。

## 许可证

Apache-2.0 — 与上游 EGM 保持一致。
