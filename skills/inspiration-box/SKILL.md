---
name: inspiration-box
description: "Use when capturing, organizing, developing, or transforming product ideas, technical ideas, brainstorms, and creative inspiration"
trigger: "/danny-idea"
triggers: [idea, inspiration, brainstorm, capture, creativity, product, concept]
adapter: universal
version: "1.0"
domain: common
tags: [inspiration, idea, creativity, brainstorm, capture]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Inspiration Box Skill

## Purpose
灵感收集与管理技能，用于快速捕获、转化的团队创意资产。

## When to Use
- 头脑风暴时记录想法
- 突然想到的产品点子
- 技术方案的初步构想
- 用户需求的灵感闪现
- 任何需要暂时保存的创意

## Core Concepts

### 1. 灵感生命周期

```
[捕获] → [整理] → [发展] → [转化]
   ↓         ↓         ↓         ↓
  快速记录   分类标签   完善细节   变成任务/技能
```

### 2. 灵感状态

| 状态 | 描述 |
|------|------|
| raw | 刚捕获的原始想法 |
| tagged | 已分类打标 |
| developed | 已发展完善 |
| archived | 已归档或转化 |

## Process

### Step 1: 快速捕获 (Capture)

当灵感出现时，以最快速度记录核心：
- 一句话描述核心想法
- 最多 3 个关键词
- 来源场景（可选）

**输出格式：**
```markdown
## {{灵感标题}}

**核心**: {{一句话描述}}
**关键词**: #tag1 #tag2 #tag3
**来源**: {{场景/对话/文档}}
**时间**: {{YYYY-MM-DD HH:mm}}
**状态**: raw
```

### Step 2: 快速分类 (Tag)

根据灵感类型选择分类：
- **feature**: 产品功能点子
- **tech**: 技术方案构想
- **process**: 流程优化建议
- **fix**: 问题修复思路
- **exploration**: 探索性尝试

### Step 3: 发展完善 (Develop)

当需要发展灵感时：
1. 补充背景和动机
2. 列出可能的实现路径
3. 评估资源和风险
4. 识别依赖和前置条件

### Step 4: 转化行动 (Transform)

根据灵感价值选择转化方式：
- **→ Task**: 拆解为可执行任务
- **→ Skill**: 发展为团队技能
- **→ Doc**: 沉淀为文档
- **→ Archive**: 暂时归档

## Inspiration Storage Structure

```
docs/knowledge-base/project/
├── inbox/inspiration/  # 收件箱（新捕获）
└── ideas/
    ├── feature/        # 功能点子
    ├── tech/           # 技术构想
    ├── process/        # 流程优化
    └── exploration/    # 探索性尝试
```

Use `docs/knowledge-base/project/` for repository-specific ideas. Use `~/.danny-skill/knowledge-base/` for global ideas that should apply across projects.

## Integration

### 与 knowledge-distill 配合
灵感是知识的源泉：
1. 灵感经过验证和发展后
2. 通过 /distill 转化为可复用的知识
3. 进入团队知识库

### 与 self-improvement 配合
自我进化记录灵感来源：
- 灵感的实现过程
- 成功/失败的经验
- 迭代改进的记录

## Quality Checklist

- [ ] 核心想法清晰，一句话能说清
- [ ] 至少 1 个标签分类
- [ ] 有来源记录便于追溯
- [ ] 定期回顾整理（建议每周）

## Quick Commands

| 命令 | 功能 |
|------|------|
| `/idea {{想法}}` | 快速捕获灵感到收件箱 |
| `/idea list` | 查看所有灵感 |
| `/idea list --tag feature` | 按标签筛选 |
| `/idea develop {{id}}` | 发展指定灵感 |
| `/idea transform {{id}}` | 转化灵感为其他形式 |

## Examples

### 快速捕获
```
/idea 用户登录后应该显示一个引导 tour
#tags: #ux #onboarding #feature
```

### 查看列表
```
/idea list --status raw --limit 10
```

### 转化为任务
```
/idea transform abc123 --to task
```
