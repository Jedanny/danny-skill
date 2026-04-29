---
name: knowledge-distill
description: "Use when distilling reusable knowledge from discussions, decisions, lessons learned, best practices, or AI interactions"
trigger: "/danny-distill"
triggers: [distill, knowledge, documentation, decision, lesson, learning, best-practice]
adapter: universal
version: "1.0"
domain: common
tags: [knowledge, distillation, learning, documentation, team]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Knowledge Distill Skill

## 用途
团队知识蒸馏技能，从 AI 交互、讨论和文档中提取、沉淀可复用的知识资产。

## 适用场景
- 完成重要讨论后，需要沉淀结论
- 发现有效的解决方案或最佳实践
- 从错误中学习，需要记录教训
- 将隐式知识转化为显式文档
- 构建团队知识库

## 知识分类

### 1. 概念与定义 (Concepts)
- 新学到的概念解释
- 技术术语定义
- 架构设计原则

### 2. 最佳实践 (Best Practices)
- 验证有效的开发方法
- 代码模式与规范
- 工具使用技巧

### 3. 决策记录 (Decisions)
- 技术选型决策
- 架构变更记录
- 问题解决方案

### 4. 教训与坑点 (Lessons Learned)
- 犯过的错误
- 已验证的不可行方案
- 已知限制与注意事项

## Distillation Gates

### Concept Gate
如果这是一个概念，必须回答：
- 它是什么？
- 它不是什么？
- 它和相邻概念怎么区分？
- 反例是什么？
- 适用边界是什么？

### Practice Gate
如果这是一个实践，必须回答：
- 这做法为什么有效？
- 在什么条件下有效？
- 失效条件是什么？
- 证据来自哪里？

### Decision Gate
如果这是一个决策，必须回答：
- 为什么选这个而不是另一个？
- 被拒绝的替代方案是什么？
- 哪些约束迫使这个选择成立？

## 输出格式

### 知识条目模板

```markdown
## [标题]

**类型**: concepts | best-practices | decisions | lessons
**强度**: tentative | tested | stable
**来源**: <原始讨论/文档链接>
**日期**: YYYY-MM-DD
**贡献者**: <人员>

### 一句话定义
<一句话说清>

### 它不是什么
- ...
- ...

### 相邻概念区分
- 与 A 的区别: ...
- 与 B 的区别: ...

### 为什么成立
<原因链或机制解释>

### 适用边界
- 场景1
- 场景2

### 反例 / 失败条件
- 反例:
- 失效条件:

### 来源证据
- 来源1
- 来源2

### 可复用规则
- 规则1
- 规则2

### 应用场景
- 场景1
- 场景2

### 相关知识
- [[关联知识链接]]

### 标签
#标签1 #标签2
```

## 流程

### 步骤 1：识别知识
- 判断讨论中是否有值得沉淀的内容
- 区分事实性信息和经验性知识
- 确认知识的可复用性
- 先判断内容是否已经通过适当的 Gate，而不是把原始想法直接入库

### 步骤 2：分类提取
根据知识类型选择合适的模板：
- **概念**: 定义 + 非定义 + 相邻概念区分 + 边界 + 反例
- **实践**: 做法 + 原理 + 适用条件 + 失效条件 + 证据
- **决策**: 背景 + 选项 + 选择 + 理由 + 被拒绝方案 + 约束
- **教训**: 问题 + 原因 + 解决方案 + 预防措施 + 边界

### 步骤 3：结构化存储
- 保存到 `<project-knowledge-base>/distilled/` 目录
- 按领域/类型自动分类
- 生成索引便于检索
- 用 `tentative | tested | stable` 标注当前知识强度

### 步骤 4：关联标注
- 标注相关知识条目
- 建立知识图谱连接
- 识别知识缺口

## 知识存储结构

```
<project-knowledge-base>/distilled/
├── concepts/           # 概念定义
├── best-practices/     # 最佳实践
├── decisions/          # 决策记录
└── lessons/            # 教训总结
```

仓库相关知识使用 `<project-knowledge-base>/distilled/`。跨项目通用知识使用 `<global-knowledge-base>/distilled/`。

遵守所在项目定义的知识存储模型：蒸馏条目应链接回来源 workspace 或 evidence；临时任务状态未经审阅和重写，不要复制到这里。

默认只蒸馏已经足够清晰的内容。未经验证的原始想法、只凭单次印象得出的结论、或没有边界与证据的“看起来有道理”的说法，不应直接进入 `distilled/`。

## 可选衔接

### 与 self-improvement 技能配合
知识蒸馏与自我改进形成闭环：
1. self-improvement 记录错误和教训
2. knowledge-distill 从中提取可复用的知识
3. 知识被整合到项目规范和技能中

### 与 skills 创建配合
当发现的知识足够完整时：
1. 评估是否可以转化为 skill
2. 提取核心流程为 skill.yaml
3. 补充详细说明为 skill.md

## 质量检查清单

- [ ] 知识有明确的适用场景
- [ ] 内容准确、可验证
- [ ] 已说明“它不是什么”或失效边界
- [ ] 已补充反例、失败条件或被拒绝方案
- [ ] 表述清晰、无歧义
- [ ] 包含足够的上下文
- [ ] 关联到相关知识
- [ ] 标注了来源和日期
- [ ] 明确当前强度：`tentative`、`tested` 或 `stable`
