---
name: socratic-learning
description: "Use when learning a concept, article, framework, or method through structured questioning, definition testing, boundary checks, and explanation-by-reasoning"
trigger: "/danny-understand"
triggers: [socratic, learn deeply, understand, explain, concept, definition, why, boundary, counterexample]
adapter: universal
version: "1.0"
domain: common
tags: [learning, socratic, reasoning, concepts, explanation]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Socratic Learning Skill

## 用途
通过连续追问、定义检验、边界测试和反例压力测试，帮助用户真正学懂一个概念、文章、框架或方法。

## 适用场景
- 用户说“帮我真正理解这个概念”
- 读完材料但不确定是否真的懂了
- 容易把相近概念混淆
- 需要把知识讲给别人听
- 需要把输入转成稳定知识资产

## 核心原则
- 先暴露当前理解，再给标准化解释
- 不接受纯复述原文
- 每个重要概念至少要有一个反例或失败边界
- 能说明“为什么成立”才算理解
- 如果原因链说不通，判定为“尚未真正理解”

## 流程

### 步骤 1：暴露当前模型
先写：
- 一句话理解
- 一个例子
- 一个最相近概念
- 一个仍不确定的问题

### 步骤 2：定义追问
至少回答：
1. 它是什么？
2. 它不是什么？
3. 它和最接近概念的区别是什么？
4. 它成立依赖哪些前提？

### 步骤 3：边界测试
必须提供：
- 一个典型正例
- 一个容易混淆的近似例
- 一个明确反例
- 一个极端场景

### 步骤 4：原因链重建
用自己的话说明：
- 为什么它成立
- 中间机制是什么
- 如果拿掉关键前提会怎样
- 最容易被误用在哪里

### 步骤 5：输出稳定产物
根据结果选择：
- 写入 `<project-knowledge-base>/distilled/`
- 写入 `<project-knowledge-base>/learnings/`
- 生成 retrieval questions

## 输出模板

```markdown
## 学习对象
{{concept_or_article}}

### 当前理解
- 一句话理解:
- 例子:
- 最相近概念:
- 仍不确定:

### Socratic Stress Test
- 它是什么:
- 它不是什么:
- 相邻概念区别:
- 必要前提:
- 正例:
- 近似例:
- 反例:
- 极端场景:
- 为什么成立:
- 去掉关键前提后会怎样:

### 重建解释
{{one_paragraph_explanation_in_own_words}}

### 当前边界
- 适用:
- 不适用:
- 高风险误用:

### 下一步
- [ ] distill
- [ ] learn
- [ ] retrieval
```

## 护栏
- 不要一上来输出完整答案，除非用户明确要求直接讲解
- 不要把“能举例”误判为“已理解”
- 不要只给正面定义，必须补边界和反例
- 不要把未经压力测试的内容直接蒸馏成稳定知识
