# danny-skill 学习闭环设计

**日期：** 2026-04-29  
**状态：** 草案  
**目标：** 为 danny-skill 建立完整的知识学习闭环，把现有的记录、蒸馏、复盘能力扩展为 capture、interrogate、stabilize、retain、correct、re-distill 的连贯系统。

---

## 1. 背景

当前仓库已经具备几类与学习和知识沉淀直接相关的 skill：

- `inspiration-box`：捕获灵感和想法
- `knowledge-distill`：蒸馏稳定知识
- `self-improvement`：记录错误、纠正和成功模式
- `research-to-implementation`：把研究转成工程提案

这套能力已经覆盖了收集、归档和部分反思，但仍有三个明显缺口：

1. **理解压测缺口**：缺少一个专门把“我好像懂了”压测成“我真的能定义、区分、举反例、解释原因”的 skill。
2. **记忆巩固缺口**：缺少把知识转成检索练习和间隔复习的 skill。
3. **规则修正缺口**：`self-improvement` 已记录事件，但还没有显式区分“旧规则”“冲突证据”“修正规则”和“适用边界”。

结果是：仓库已经能“存知识”，但还不够像一个“学习系统”。

---

## 2. 设计目标

1. **建立完整学习闭环**：从原始输入到理解、蒸馏、巩固、纠偏、回流，形成清晰链路。
2. **保持 skill-library-first**：继续以小而专一、可组合的 skill 为主，而不是堆成一个大而全的总技能。
3. **明确职责边界**：每个 skill 只负责闭环中的一层，不与相邻 skill 抢职责。
4. **引入可操作方法论**：把苏格拉底式追问、柏拉图式概念区分、波普尔式证伪、现代学习科学的 retrieval practice 和 spaced repetition 转成模板、字段和流程护栏。
5. **兼容现有知识库模型**：继续遵守 `.danny/knowledge-base/` 的 `capture -> workspace -> evidence -> distilled` 存储模型。

---

## 3. 非目标

- 不新建一个覆盖全部学习活动的巨型 `learning-system` skill。
- 不把哲学思想作为抽象口号写入 skill，而是只保留可执行动作。
- 不在这一轮实现复杂的调度系统、数据库或独立复习应用。
- 不重写当前知识库存储目录结构。

---

## 4. 闭环架构

建议正式定义 danny-skill 的学习与知识闭环为：

```text
capture
-> interrogate
-> stabilize
-> retain
-> correct
-> re-distill
```

对应 skill 关系：

```text
inspiration-box
-> socratic-learning
-> knowledge-distill
-> retrieval-and-spacing
-> self-improvement
-> knowledge-distill
```

语义说明：

- `capture`：先记录想法、问题、材料和直觉。
- `interrogate`：通过定义追问、边界测试、反例和原因链重建确认是否真正理解。
- `stabilize`：将通过压力测试的内容蒸馏成结构化知识。
- `retain`：通过检索练习和间隔复习提升保留率与迁移能力。
- `correct`：通过错误、反例和用户纠正修正规则边界。
- `re-distill`：把经验证的修正规则再提升为稳定知识。

---

## 5. Skill 边界设计

### 5.1 `inspiration-box`

**职责**
- 捕获原始想法、问题、材料片段和直觉
- 在需要时将原始想法提升为可验证的 `hypothesis`

**输出位置**
- `<project-knowledge-base>/inbox/inspiration/`
- `<project-knowledge-base>/ideas/`

**不负责**
- 直接产出稳定知识
- 证明想法已经成立

**新增状态**

```text
raw -> tagged -> hypothesis -> developed -> archived
```

### 5.2 `socratic-learning`（新增）

**职责**
- 压测一个概念、文章、框架或方法是否被真正理解
- 强制回答“它是什么”“它不是什么”“它为什么成立”“它的边界和反例是什么”

**输出**
- 一份 `Socratic Stress Test` 结果
- 后续跳转建议：`distill`、`learn`、`retrieval`

**不负责**
- 长期知识归档
- 直接产出团队最佳实践

### 5.3 `knowledge-distill`

**职责**
- 把已具备清晰度的内容沉淀为结构化知识
- 标注定义、边界、反例、证据和知识强度

**输出位置**
- `<project-knowledge-base>/distilled/`

**不负责**
- 处理原始混乱输入
- 代替理解压测

### 5.4 `retrieval-and-spacing`（新增）

**职责**
- 把已学习、已蒸馏的知识转成检索问题与间隔复习提示
- 覆盖定义、区分、边界、机制和应用五类记忆负载

**输出**
- review cards
- review prompts

**不负责**
- 判定知识真伪
- 修正知识本身

### 5.5 `self-improvement`

**职责**
- 把错误、纠正、失败案例和成功模式转成 evidence 级认知更新
- 明确“旧规则”“冲突证据”“修正规则”和“适用边界”

**输出位置**
- `<project-knowledge-base>/learnings/`

**不负责**
- 把单次经验直接提升为 stable knowledge

### 5.6 `research-to-implementation`

**职责**
- 处理论文、研究报告、开源实现和业务适配
- 在需要时为 learning loop 提供研究材料、候选解释和实施建议

**与闭环的关系**
- 可以前接 `inspiration-box`
- 可以后接 `socratic-learning` 或 `knowledge-distill`
- 不是学习闭环本身的中心 skill

---

## 6. 方法论映射

本设计只吸收可操作部分，不搬运形而上学设定。

| 来源 | 吸收的动作 | 落地位置 |
| --- | --- | --- |
| 苏格拉底 | 连续追问、暴露矛盾、定义检验 | `socratic-learning` |
| 柏拉图 | 概念区分、相邻概念比较、边界澄清 | `socratic-learning`, `knowledge-distill` |
| 亚里士多德 | 原因链、前提-结论关系 | `socratic-learning`, `knowledge-distill`, `research-to-implementation` |
| 培根 | 观察、归类、排除干扰解释 | `research-to-implementation`, `self-improvement` |
| 皮尔士 | 从异常现象生成候选解释 | `inspiration-box`, `research-to-implementation` |
| 波普尔 | 证伪、边界、暂存规则 | `self-improvement` |
| 学习科学 | retrieval practice、spacing、self-explanation | `retrieval-and-spacing`, `socratic-learning` |

---

## 7. 数据与强度模型

目录层保持现有知识库模型：

```text
capture -> workspace -> evidence -> distilled
```

但每条内容再引入认知成熟度：

```text
raw -> hypothesis -> tested -> stable
```

含义：

- `raw`：未整理原始输入
- `hypothesis`：已形成待验证假设
- `tested`：经过一定压力测试、经验或研究支撑
- `stable`：可作为复用知识条目

目录层表示**存储位置**，强度层表示**认知成熟度**。两者不要混为一谈。

---

## 8. 新增 Skill 设计

### 8.1 `socratic-learning`

**建议 frontmatter**

```yaml
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
```

**核心输出模板**

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

**硬护栏**
- 不先给标准答案，先暴露当前理解
- 不接受纯复述原文
- 每个重要概念至少要有一个反例或失败边界
- 如果原因链说不通，判定为“尚未真正理解”

### 8.2 `retrieval-and-spacing`

**建议 frontmatter**

```yaml
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
```

**卡片模板**

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

**生成规则**
- 每条知识至少生成 3 张卡
- 至少覆盖 `definition`
- 优先补 `contrast` 和 `application`
- 有边界就补 `boundary`
- 有原因链就补 `mechanism`

**建议复习节奏**
- `D+1`
- `D+3`
- `D+7`
- `D+14`

**失败处理**
- 如果回答不出定义，回到 `socratic-learning`
- 如果混淆相邻概念，更新 `knowledge-distill`
- 如果应用失败，记录到 `self-improvement`

---

## 9. 现有 Skill 升级

### 9.1 `knowledge-distill`

新增知识强度字段：

```yaml
strength: tentative | tested | stable
```

新增模板字段：

```markdown
### 一句话定义
### 它不是什么
### 相邻概念区分
### 为什么成立
### 适用边界
### 反例 / 失败条件
### 来源证据
### 可复用规则
```

新增 gate：

```text
Concept Gate
Practice Gate
Decision Gate
```

### 9.2 `self-improvement`

新增 `Falsification Loop`：

```markdown
### Prior Rule
### Disconfirming Evidence
### Revised Rule
### Boundary
### Verification Plan
```

目标：让学习记录从“事件日志”升级为“规则修正器”。

### 9.3 `inspiration-box`

新增 `hypothesis` 状态与模板：

```markdown
### Hypothesis
如果我们做 X，在 Y 场景下，可能改善 Z。

### Why this may be true
### Alternative explanations
### Smallest useful test
```

目标：让灵感在进入研究或学习前，先成为可验证对象。

---

## 10. README 与文档改动

README 建议新增一节：

```markdown
## 学习与知识闭环

danny-skill 不把“总结”视为学习终点，而把知识学习拆成六步：

1. capture：记录原始想法、问题、材料和直觉
2. interrogate：通过追问、定义测试和反例检查确认是否真正理解
3. stabilize：把通过压力测试的内容蒸馏成稳定知识
4. retain：通过检索练习和间隔复现提高保留率
5. correct：通过错误、反例和用户纠正修正规则边界
6. re-distill：把经验证的修正规则重新沉淀为稳定知识
```

并补充组合关系：

```text
inspiration-box
-> socratic-learning
-> knowledge-distill
-> retrieval-and-spacing
-> self-improvement
-> knowledge-distill
```

能力边界表新增：
- `socratic-learning`
- `retrieval-and-spacing`

并调整：
- `knowledge-distill`
- `self-improvement`
- `inspiration-box`

---

## 11. 实施顺序

建议分两批：

### 第一批：主干闭环
1. 新增 `socratic-learning`
2. 升级 `knowledge-distill`
3. 升级 `self-improvement`

### 第二批：巩固与入口
1. 新增 `retrieval-and-spacing`
2. 升级 `inspiration-box`
3. 更新 README、能力边界表和组合使用说明

原因：如果没有先把“问透”和“纠偏”做好，复习系统会强化半成品知识。

---

## 12. 验收标准

本设计完成后，应能回答以下问题：

1. 学完一个概念后，是否必须说明“它不是什么”？
2. 一条知识是否必须带边界、反例或失败条件？
3. 一条学习记录是否必须显式写出旧规则和修正规则？
4. 一条蒸馏知识是否区分 `tentative`、`tested`、`stable`？
5. 一条已蒸馏知识是否能自然生成 3 种以上检索题？
6. 灵感是否能在进入研究前先被提升为 hypothesis？

如果这些问题都能被模板和护栏强制覆盖，则说明学习闭环设计成立。

---

## 13. 风险与取舍

### 风险
- skill 数量增加后，README 和边界文档必须同步，否则会造成发现路径混乱
- `retrieval-and-spacing` 若设计过重，可能偏向工具系统而不是 skill
- `knowledge-distill` 与 `socratic-learning` 的边界如果写不清，容易重叠

### 取舍
- 选择新增两个专职 skill，而不是做一个总技能
- 选择简单复习节奏，而不是先做复杂调度
- 选择把方法论写成模板字段和护栏，而不是抽象哲学宣言

---

## 14. 推荐范围冻结

本轮设计建议冻结为：

```text
新增:
- socratic-learning
- retrieval-and-spacing

升级:
- knowledge-distill
- self-improvement
- inspiration-box

文档同步:
- README 学习闭环总览
- 能力边界表
- 组合使用说明
```
