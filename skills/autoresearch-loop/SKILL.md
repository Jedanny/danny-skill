---
name: autoresearch-loop
description: Use when improving a skill, prompt, workflow, or agent behavior through repeated eval-driven experiments with keep-or-revert decisions
version: "1.0"
triggers: [autoresearch, eval, experiment, prompt-optimization, skill-optimization, benchmark, self-improvement]
tags: [autoresearch, evaluation, prompt-optimization, skills, self-improvement]
supported_tools: [claude-code, codex]
---

# Autoresearch Loop

## 用途

用 eval 驱动的研究循环优化 skill、prompt、workflow 或 agent 行为。这个 skill 面向可度量迭代，不用于普通笔记或开放式头脑风暴。

流程参考 autoresearch 风格的 prompt 优化：先建立 baseline，运行 eval，只做一个 mutation，再复测，并基于证据 keep-or-revert。

参考来源：

- Karpathy autoresearch: https://github.com/karpathy/autoresearch
- openclaw-autoresearch: https://github.com/zning1994/openclaw-autoresearch
- 花叔方法论文章: https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w

## 适用场景

- 某个 skill 或 prompt 在真实任务中表现不稳定。
- workflow 需要可度量改进，而不是凭感觉手工改。
- 可以定义 pass/fail 规则、benchmark 分数或清晰的质量 rubric。
- 修改共享 agent 指令前，需要一份可复现实验记录。

如果没有稳定目标文件、没有可度量 eval，或没有足够时间完成至少一次 baseline 和一次 retest，不要使用这个 skill。

## 核心循环

1. **选择目标**：只选一个目标，通常是 `skills/<name>/SKILL.md`、`prompts/<name>.md` 或 `AGENTS.md`。
2. **定义 eval**：编辑前先编写或选择 eval case。格式见 `references/eval-format.md`。
3. **运行 baseline**：对未修改目标运行 eval，并记录结果。
4. **分析失败点**：识别一个具体行为缺口，避免大范围重写。
5. **做一个 mutation**：只改一条指令、一个示例、一个 trigger 或一个约束。
6. **复测**：运行同一组 eval。
7. **Keep-or-revert**：只有指标提升且没有回归时才保留，否则回退。
8. **写 changelog**：记录假设、mutation、指标变化和决策。
9. **预算内重复**：达到 `max_experiments`、全部通过或没有有价值的下一步时停止。

## Eval 类型

确定性检查优先使用 **rule evals**：

- `regex`
- `contains`
- `not_contains`
- `banned_phrases`
- `word_count`

需要判断时再使用 **LLM evals**：

- agent 是否遵守 baseline-first 纪律？
- 是否使用了正确 skill？
- 是否避免了无依据结论？
- 是否保留了要求的输出格式？

能用 rule evals 时优先使用 rule evals。只有行为无法确定性检查时，再补充 LLM evals。

## Skill 质量棘轮 (Skill Quality Ratchet)

当目标是单个 `SKILL.md` 或一组 skills 时，使用这个模式。

阶段：

1. **盘点**：列出目标 skills，并验证引用文件存在。
2. **Baseline 评分**：编辑前用 `references/skill-quality-rubric.md` 给每个 skill 打分。
3. **选择最弱维度**：当前轮只优化得分最低的维度。
4. **单资产 mutation**：每次实验只编辑一个 `SKILL.md`。
5. **独立评估**：由独立 evaluator 按 `references/evaluator-protocol.md` 评分。
6. **Human in the loop**：按 `references/hitl-review-template.md` 展示 diff、分数变化、eval 输出和风险说明。
7. **Keep-or-revert**：只保留被确认的改进，其他回退。
8. **汇总**：输出所有被优化 skills 的 before/after 表。

限制：

- 每个活跃实验最多优化一个 skill。
- 每个 skill 最多运行三轮 mutation，除非用户明确提高预算。
- 修改者不能是唯一评分者。
- 优先看真实 prompt 输出质量，不追求纸面格式完美。

## 实验日志

日志存放在：

```text
.danny-skill/knowledge-base/experiments/autoresearch/<target-name>/
├── results.tsv
└── changelog.md
```

遵守 `docs/knowledge-base/storage-model.md`：实验记录是 evidence，不是临时 agent 草稿。运行态进度放在 `.omx/`；这里仅写 baseline、metric、mutation 和 keep-or-revert 证据。

`results.tsv` 字段：

```text
timestamp	experiment	target	metric	baseline	candidate	decision	notes
```

`changelog.md` 条目：

```markdown
## YYYY-MM-DD experiment-name

- Target: skills/example/SKILL.md
- Objective: 需要改进的行为
- Baseline: mutation 前的分数或失败点
- Mutation: 具体修改
- Candidate: mutation 后的分数或失败点
- Decision: keep | revert
- Notes: 结果为什么重要
```

## 护栏

- 没有 baseline，就不做 mutation。
- 没有 eval，就不声称优化成功。
- 每次实验只做一个 mutation。
- 实验期间不要编辑无关文件。
- 如果一个改动提升了某个 eval 但破坏了另一个必需 eval，不要保留。
- 如果 eval 本身有问题，先修 eval，重新跑 baseline，再继续。
- 条件允许时，把保留的 mutation 和 eval/log 变更分开提交。

## 可选衔接

- 可用 `self-improvement` 记录重复失败模式或用户纠正。
- 可用 `knowledge-distill` 将稳定发现沉淀为团队知识。
- 当优化目标是 UI 视觉输出质量时，可使用 `design-style`。
