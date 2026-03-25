# danny-skill 项目设计文档

**日期：** 2026-03-25
**状态：** 已批准

---

## 1. 项目概述

**项目名称：** danny-skill
**定位：** 团队 AI 技能共享中心

**核心使命：**
- 将团队专业知识转化为可复用的 AI 资产
- 跨工具复用（Claude Code、Cursor、OpenCode、Codex、Codebuddy）
- 便于团队知识沉淀和快速接入

**目标用户：** 小型开发团队（<10人）

---

## 2. 核心架构

### 2.1 目录结构

```
danny-skill/
├── assets/                    # AI 资产（声明式定义，与工具无关）
│   ├── skills/                # 技能（.yaml 元数据 + .md 实现）
│   ├── commands/               # 命令集
│   ├── prompts/               # 提示词模板
│   ├── workflows/             # 工作流编排
│   └── agents/                # Agent 配置模板
├── adapters/                   # 工具适配层
│   ├── claude-code/           # Claude Code 适配器
│   ├── cursor/                # Cursor 适配器
│   ├── opencode/              # OpenCode 适配器
│   ├── codex/                 # Codex 适配器
│   └── codebuddy/             # Codebuddy 适配器
├── lib/                        # 共享工具库
├── scripts/                    # 安装脚本
├── docs/                       # 文档
└── package.json
```

### 2.2 核心设计原则

1. **声明式资产定义** - 资产使用 YAML/JSON 描述元数据，Markdown 描述内容，与工具实现解耦
2. **适配器模式** - 各工具通过适配器接入，资产本身不关心工具差异
3. **领域分类 + 标签系统** - 按用途领域分类，通过标签灵活组织和检索
4. **易于扩展** - 新增工具只需新增适配器，不影响已有资产

---

## 3. 资产定义规范

### 3.1 Skills（技能）

```yaml
# assets/skills/<domain>/<skill-name>.yaml
name: <skill-name>
version: "1.0"
domain: <frontend|backend|devops|quality|docs|common>
tags: [<tag1>, <tag2>]
description: "技能描述"
trigger: "/<command>"          # 触发方式
adapter: "<adapter-name>|universal"  # 适配器要求
requires: [<dependency-skill>] # 依赖的其他技能
```

### 3.2 Commands（命令）

```yaml
# assets/commands/<domain>/<command-name>.yaml
name: <command-name>
domain: <domain>
tags: []
description: "命令描述"
command: "<shell-command>"
```

### 3.3 Prompts（提示词）

```yaml
# assets/prompts/<domain>/<prompt-name>.yaml
name: <prompt-name>
domain: <domain>
tags: []
description: "提示词描述"
template: |
  <prompt-template-content>
variables: [<var1>, <var2>]
```

### 3.4 Workflows（工作流）

```yaml
# assets/workflows/<domain>/<workflow-name>.yaml
name: <workflow-name>
domain: <domain>
tags: []
description: "工作流描述"
steps:
  - name: <step1>
    type: skill|command|prompt
    ref: <reference>
  - name: <step2>
    type: skill|command|prompt
    ref: <reference>
```

---

## 4. 领域分类

```
assets/skills/
├── frontend/          # 前端开发（React、Vue、移动端等）
├── backend/           # 后端开发（Node、Python、Go等）
├── devops/            # 部署、运维、监控
├── quality/           # 测试、代码质量
├── docs/              # 文档生成
└── common/            # 通用技能
```

---

## 5. 安装方式

### 5.1 一键安装

```bash
curl -fsSL <install-script-url> | sh
```

自动检测已安装的工具，将资产链接到对应配置目录。

### 5.2 手动安装

提供 `install.sh` 脚本，支持选择性安装：
- 选择要安装的资产
- 选择目标工具适配器
- 自定义安装路径

---

## 6. 示例资产（首批）

### 6.1 Skills
- `skills/common/read-code` - 代码阅读理解
- `skills/frontend/react-best-practices` - React 最佳实践

### 6.2 Commands
- `commands/common/project-init` - 项目初始化
- `commands/devops/deploy` - 部署命令

### 6.3 Prompts
- `prompts/docs/api-doc-template` - API 文档模板

---

## 7. 优先实现计划

**第一阶段（MVP）：**
1. 项目基础结构搭建
2. Claude Code 适配器实现
3. 3-5 个示例资产
4. 基础安装脚本

**第二阶段（扩展）：**
1. 其他工具适配器
2. 标签检索系统
3. 更多示例资产

---

## 8. 技术选型

- **语言：** Shell + TypeScript（适配器）
- **包管理：** npm
- **测试：** Shell 脚本测试 + TypeScript 测试
