---
name: self-improvement
description: "Use when recording errors, user corrections, successful solutions, repeated patterns, or feedback for future improvement"
trigger: "/danny-learn"
triggers: [learn, error, correction, feedback, success, pattern, retrospective]
adapter: universal
version: "1.0"
domain: common
tags: [self-improvement, learning, errors, feedback, memory]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Self-Improvement Skill

## Purpose
自我进化技能，记录错误、反馈和经验教训，实现 AI 持续自我改进。

## When to Use
- 命令或操作意外失败时
- 用户纠正 AI 的错误时
- 发现有效的解决方案时
- 遇到已知的错误模式时
- 需要更新认知时

## Core Concepts

### 1. 学习循环

```
[捕获] → [记录] → [反思] → [应用]
   ↓        ↓        ↓        ↓
 错误/反馈  保存到   分析原因   下次避免
           learnings
```

### 2. 学习类型

| 类型 | 触发场景 | 记录内容 |
|------|---------|---------|
| error | 命令执行失败 | 错误类型、原因、解决方案 |
| correction | 用户纠正 | 正确做法、错误原因 |
| success | 有效方案 | 成功模式、可复用经验 |
| pattern | 重复问题 | 模式识别、预防措施 |

## Learning Storage Structure

```
.danny-skill/knowledge-base/learnings/
├── errors/              # 错误记录
│   ├── {{timestamp}}-{{error-type}}.md
├── corrections/        # 纠正记录
│   ├── {{timestamp}}-{{topic}}.md
├── successes/         # 成功经验
│   ├── {{timestamp}}-{{topic}}.md
├── patterns/          # 模式识别
│   └── PATTERNS.md    # 模式索引
└── REVIEW.md          # 定期回顾
```

Use `.danny-skill/knowledge-base/learnings/` for repository-specific learnings. Use `~/.danny-skill/knowledge-base/learnings/` for global patterns that should apply across projects.

Follow `docs/knowledge-base/storage-model.md`: learning records are evidence. Store concrete events and prevention notes here, not raw `.omx` logs or temporary task progress.

## Learning Entry Format

```markdown
## {{学习标题}}

**类型**: error | correction | success | pattern
**日期**: {{YYYY-MM-DD HH:mm}}
**上下文**: {{触发场景}}

### 事件描述
{{发生了什么}}

### 原因分析
{{为什么会发生}}

### 经验/解决方案
{{如何解决/避免}}

### 相关标签
#{{tag1}} #{{tag2}}

### 下次行动
- [ ] {{行动项}}
```

## Process

### Step 1: 捕获 (Capture)

当遇到以下情况时触发记录：
1. 命令执行失败
2. 用户说"不对"、"不是这样"
3. 找到有效解决方案
4. 发现重复出现的问题

### Step 2: 记录 (Record)

自动或手动记录到 `.danny-skill/knowledge-base/learnings/` 目录：
- 文件名格式：`{{时间戳}}-{{类型}}-{{简短描述}}.md`
- 包含完整上下文和解决方案

### Step 3: 反思 (Reflect)

定期（月/周）回顾学习记录：
1. 识别重复模式
2. 提取可复用模式到 `patterns/`
3. 更新最佳实践

### Step 4: 应用 (Apply)

在后续工作中：
1. 执行任务前检查相关学习
2. 遇到类似问题引用已有学习
3. 验证学习有效性并更新

## Integration

### 与 knowledge-distill 配合
- 重复出现的模式 → 提炼为团队知识
- 验证有效的经验 → 沉淀到知识库

### 与 inspiration-box 配合
- 灵感实现过程中的学习
- 方案探索的教训

## Quality Checklist

- [ ] 记录包含足够的上下文
- [ ] 原因分析清晰
- [ ] 有明确的行动项
- [ ] 定期回顾和更新
- [ ] 模式被正确识别

## Quick Commands

| 命令 | 功能 |
|------|------|
| `/learn` | 查看所有学习记录 |
| `/learn --type error` | 查看错误记录 |
| `/learn --recent 5` | 查看最近 5 条 |
| `/learn add {{内容}}` | 添加新学习 |
| `/learn review` | 触发回顾流程 |

## Examples

### 错误记录
```
/learn add error: npm install 在中国镜像站失败，需要使用淘宝镜像
```

### 纠正记录
```
/learn add correction: 用户纠正 - 应该用 pnpm install 不是 npm install
```

### 成功记录
```
/learn add success: 使用 uv pip install 比 pip install 快 3 倍
```
