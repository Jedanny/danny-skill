---
name: coding-guardrails
description: Use when writing, fixing, refactoring, or reviewing code where assumptions, scope creep, overengineering, or unverifiable changes could cause avoidable mistakes
version: "1.0"
triggers: [coding, refactor, bugfix, simplify, assumptions, verification, surgical-change, overengineering]
tags: [coding, quality, refactoring, verification, simplicity]
supported_tools: [claude-code, codex, cursor]
---

# Coding Guardrails

## 用途

减少 coding agent 在实现、调试、重构和评审中的常见错误。这个 skill 是改代码前的紧凑行为护栏。

参考来源：forrestchang/andrej-karpathy-skills, https://github.com/forrestchang/andrej-karpathy-skills

改编示例和许可说明见 `references/examples.md`。

## 核心规则

### 1. 先想清楚再编码 (Think Before Coding)

- 编辑前先识别真实目标。
- 范围不清时，先说明假设。
- 只有歧义会阻碍安全推进时才提问；否则说明假设并继续。
- 修 bug 时，只要可行，先复现或定位失败行为。

### 2. 简单优先 (Simplicity First)

- 优先选择满足请求的最小实现。
- 避免投机性功能、配置开关和一次性抽象。
- 先复用项目已有模式，再考虑新增层。
- 如果更简单的设计能解决问题，就选简单设计。

### 3. 外科手术式修改 (Surgical Changes)

- 只改任务必需的文件和行。
- 不做顺手重构。
- 除非问题本身相关，否则保留注释、命名和格式。
- 每一行修改都应对应用户请求、失败测试或已记录的验证需要。

### 4. 目标驱动执行 (Goal-Driven Execution)

- 声称完成前，先定义什么算完成。
- 针对变更行为运行定向测试。
- 触及共享行为时，运行更广验证。
- 汇报证据，不做信心表演。

## 何时提问

遇到以下情况时，问一个简短问题：

- 请求有多个合理产品含义。
- 安全、隐私、数据删除或不可逆行为不明确。
- 变更会超出请求范围。
- 必需凭据、文件或环境不可用。

明显可逆的下一步不要提问。

## 检查清单

### 编辑前

- 最小有用改动是什么？
- 应该遵循哪个既有模式？
- 什么证据能证明改动有效？
- 哪些内容应保持不动？

### 最终回复前

- 已运行相关测试或诊断。
- 未修改无关文件。
- 没有残留临时调试代码。
- 已清楚说明已知缺口。

## 可选衔接

- 当任务来自论文、开源方案或可行性分析时，可先使用 `research-to-implementation`。
- 当代码或 prompt 需要可度量迭代优化时，可使用 `autoresearch-loop`。
- 当错误或用户纠正暴露出重复失败模式时，可使用 `self-improvement`。
