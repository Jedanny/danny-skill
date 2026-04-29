---
name: using-danny
description: Use when starting work with danny-skill, choosing which danny skill to use, or installing and activating danny skills across Claude Code, Codex, Cursor, and OpenCode
trigger: "/using-danny"
triggers: [danny, using-danny, danny-skill, skill-selection, setup, install, onboarding]
version: "1.0"
tags: [danny-skill, onboarding, skill-routing, setup]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Using Danny

## 用途

作为 danny-skill 的入口 skill，帮助用户或 Agent 选择合适的 danny skill、理解安装/触发方式，并把知识库路径占位符映射到当前项目。

每个 skill 都可以独立使用。不要把组合示例当作强制流程，也不要在完成一个 skill 后默认推荐下一个 skill；只有用户目标明确需要时才建议组合使用。

## 快速入口

| 工具 | 显式调用 |
| --- | --- |
| Claude Code standalone | `/using-danny` |
| Claude Code plugin | `/danny-skill:using-danny` |
| Codex | `$using-danny` |
| Cursor | 通过 `.cursor/rules/using-danny.mdc` 适配 |

项目 alias:

```text
/using-danny
```

## 选择哪个 skill

| 用户目标 | 可用 skill |
| --- | --- |
| 捕获灵感、产品点子、技术想法 | `inspiration-box` |
| 学懂概念、文章、框架或方法 | `socratic-learning` |
| 把已学知识转成检索练习和复习节奏 | `retrieval-and-spacing` |
| 从论文、技术报告、开源项目走到实施方案 | `research-to-implementation` |
| 编码、修复、重构、评审前约束范围和验证 | `coding-guardrails` |
| 用 eval 优化 skill、prompt、workflow | `autoresearch-loop` |
| 记录错误、用户纠正、成功模式 | `self-improvement` |
| 固化讨论结论、决策、最佳实践 | `knowledge-distill` |
| 生成 UI/网站/品牌视觉风格 | `design-style` |

## 安装和激活

Claude Code 项目级：

```bash
danny-skill install --tool claude-code --scope project --profile standard --mode copy
danny-skill alias generate --tool claude-code
```

Codex 项目级：

```bash
danny-skill install --tool codex --scope project --profile standard --mode copy
```

Cursor 项目级：

```bash
danny-skill install --tool cursor --scope project --profile standard --mode copy
danny-skill alias generate --tool cursor
```

完整开发软链接：

```bash
danny-skill install --tool claude-code --scope project --profile full --mode link
danny-skill install --tool codex --scope project --profile full --mode link
```

## 知识库占位符

可分发 skill 使用占位符，不绑定某个仓库路径：

```text
<project-knowledge-base>
<global-knowledge-base>
```

宿主项目负责把占位符映射到实际路径。初始化时用实际项目级和系统级/全局级知识目录替换下面两个参数：

```text
<project-knowledge-base> -> `.danny/knowledge-base/`（本仓库默认映射）
<global-knowledge-base>  -> `~/.danny/knowledge-base/`（本仓库默认映射）
```

初始化项目知识库：

```bash
danny-skill config paths set --project <project-knowledge-base> --system <global-knowledge-base>
danny-skill knowledge init --project
```

## 使用原则

- 先判断用户目标，再选择最小合适 skill。
- 不确定是否需要复杂流程时，优先用单个 skill。
- 只有任务确实跨越多个阶段时，才组合多个 skill。
- 记录型 skill 写入 `<project-knowledge-base>` 或 `<global-knowledge-base>` 前，先判断 scope。
- `socratic-learning` 默认不直接持久化长期知识，而是把结果交给 `knowledge-distill` 或 `self-improvement`。
- `retrieval-and-spacing` 默认从 `<project-knowledge-base>/distilled/` 与 `<project-knowledge-base>/learnings/` 读取知识，再生成 review cards / review prompts。
- 需要让后续 Agent 复用经验时，优先更新 `self-improvement` 的 `PATTERNS.md` 索引。

## 常见组合

研究到落地：

```text
research-to-implementation -> coding-guardrails
```

学习闭环：

```text
inspiration-box -> socratic-learning -> knowledge-distill -> retrieval-and-spacing -> self-improvement -> knowledge-distill
```

错误到改进：

```text
self-improvement -> knowledge-distill
```

灵感到方案：

```text
inspiration-box -> research-to-implementation
```
