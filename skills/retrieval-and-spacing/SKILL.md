---
name: retrieval-and-spacing
description: "Use when turning learned knowledge into retrieval questions, spaced review prompts, and memory-strengthening practice"
trigger: "/danny-review"
triggers: [review, recall, remember, quiz me, retrieval practice, spaced repetition, spaced review]
adapter: universal
version: "1.0"
domain: common
tags: [learning, memory, retrieval, review, spaced-repetition]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Retrieval And Spacing Skill

## 用途
把已经学过、蒸馏过的知识转成主动提取练习，而不是停留在“看过”和“记了笔记”。

## 适用场景
- 刚学完一个概念或框架
- 刚完成一次蒸馏
- 需要提高记忆保留率
- 需要检查自己是否真的记得住
- 需要把知识迁移到新场景

## 核心原则
- 先提问，再看答案
- 优先回忆，不优先重读
- 卡片从蒸馏后的知识生成，不从原文直接生成
- 回忆失败时，必要时反向更新知识条目
- 问题要覆盖定义、区分、边界、机制、应用

## 题型

### 1. Definition
它是什么？

### 2. Contrast
它和最容易混淆的概念有什么区别？

### 3. Boundary
什么情况下它不成立？

### 4. Mechanism
它为什么成立？

### 5. Application
在新情境中怎么用？

## 复习节奏
- D+1
- D+3
- D+7
- D+14

## 输出模板

```markdown
## Card
**Source**: {{distilled_entry_or_learning_record}}
**Type**: definition | contrast | boundary | mechanism | application
**Prompt**: {{question}}
**Expected answer**: {{short_answer}}
**Confusable with**: {{similar_concept_if_any}}
**Failure signal**: {{what_confusion_looks_like}}
**Next review**: {{YYYY-MM-DD}}
```

## 生成规则
- 每条知识至少生成 3 张卡
- 至少覆盖 definition、contrast、application
- 如果知识有明显边界，再补 boundary card
- 如果知识有明确原因链，再补 mechanism card

## 失败处理
- 如果回答不出定义，回到 `socratic-learning`
- 如果混淆相邻概念，更新 `knowledge-distill`
- 如果应用失败，记录到 `self-improvement`
- 如果知识本身不稳定，不要继续加卡，先修正文档
