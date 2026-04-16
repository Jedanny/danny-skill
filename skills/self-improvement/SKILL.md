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

## 用途
自我进化技能，记录错误、反馈和经验教训，实现 AI 持续自我改进。

## 适用场景
- 命令或操作意外失败时
- 用户纠正 AI 的错误时
- 发现有效的解决方案时
- 遇到已知的错误模式时
- 需要更新认知时

## 核心概念

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

## 学习存储结构

```
<project-knowledge-base>/learnings/
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

仓库相关学习记录使用 `<project-knowledge-base>/learnings/`。跨项目通用模式使用 `<global-knowledge-base>/learnings/`。

遵守所在项目定义的知识存储模型：learning records 属于 evidence。这里保存具体事件和预防说明，不保存本地日志或临时任务进度。

## Agent 应用协议

记录的内容必须能被后续 Agent 快速检索、压缩进上下文并转化为行动约束。不要只保存长篇复盘。

### 检索顺序

1. 先读 `<project-knowledge-base>/learnings/patterns/PATTERNS.md`，获取高频规则和关键词索引。
2. 根据当前任务关键词、工具、语言、错误信息和用户纠正，检索 `errors/`、`corrections/`、`successes/` 中相关条目。
3. 若项目级没有相关记录，再查 `<global-knowledge-base>/learnings/`。
4. 只把相关、可执行的结论带回当前任务上下文，不要整篇复制历史记录。

### 应用规则

- 命中 `correction` 时，优先遵守用户纠正，除非当前项目证据明确冲突。
- 命中 `error` 时，先检查是否存在同类失败条件，再执行预防动作。
- 命中 `success` 时，只在上下文相似时复用成功做法。
- 命中 `pattern` 时，把它作为默认行为约束，并在本次任务中验证是否仍然适用。
- 应用后如发现规则失效，追加新记录或更新 `PATTERNS.md`。

### `PATTERNS.md` 索引格式

```markdown
# Learning Patterns

## Agent 使用入口

- 任务关键词: package-manager, nodejs
  - 规则: 优先使用 pnpm。
  - 来源: corrections/2026-03-25-npm-vs-pnpm.md
  - 适用: Node.js 项目依赖安装、测试、脚本执行。
  - 例外: 项目明确锁定 npm/yarn。
```

## 学习条目格式

```markdown
---
type: error | correction | success | pattern
status: active | superseded | archived
scope: project | global
applies_to: [tool, language, workflow]
trigger_patterns: [keyword, error-message, user-correction]
confidence: low | medium | high
last_verified: YYYY-MM-DD
---

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

### Agent 应用
- **触发条件**: {{什么任务/错误/用户表述应该召回这条记录}}
- **默认动作**: {{Agent 下次应该怎么做}}
- **例外情况**: {{什么时候不要套用}}

### 下次行动
- [ ] {{行动项}}
```

## 流程

### 步骤 1：捕获 (Capture)

当遇到以下情况时触发记录：
1. 命令执行失败
2. 用户说"不对"、"不是这样"
3. 找到有效解决方案
4. 发现重复出现的问题

### 步骤 2：记录 (Record)

自动或手动记录到 `<project-knowledge-base>/learnings/` 目录：
- 文件名格式：`{{时间戳}}-{{类型}}-{{简短描述}}.md`
- 包含完整上下文和解决方案

### 步骤 3：反思 (Reflect)

定期（月/周）回顾学习记录：
1. 识别重复模式
2. 提取可复用模式到 `patterns/PATTERNS.md`
3. 更新最佳实践

### 步骤 4：应用 (Apply)

在后续工作中：
1. 执行任务前按“检索顺序”检查相关学习。
2. 遇到类似问题时引用已有学习，并说明采用了哪条规则。
3. 验证学习有效性；如果不适用，更新或废弃对应记录。

## 可选衔接

### 与 knowledge-distill 配合
- 重复出现的模式 → 提炼为团队知识
- 验证有效的经验 → 沉淀到知识库

### 与 inspiration-box 配合
- 灵感实现过程中的学习
- 方案探索的教训

## 质量检查清单

- [ ] 记录包含足够的上下文
- [ ] 原因分析清晰
- [ ] 有明确的行动项
- [ ] 包含 Agent 应用规则：触发条件、默认动作、例外情况
- [ ] 定期回顾和更新
- [ ] 模式被正确识别

## 快速命令

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
