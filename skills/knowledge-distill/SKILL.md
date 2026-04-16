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

## 输出格式

### 知识条目模板

```markdown
## [标题]

**类型**: concepts | best-practices | decisions | lessons
**来源**: <原始讨论/文档链接>
**日期**: YYYY-MM-DD
**贡献者**: <人员>

### 摘要
<3句话内的核心要点>

### 详细说明
<完整的知识内容>

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

### 步骤 2：分类提取
根据知识类型选择合适的模板：
- **概念**: 简洁定义 + 详细解释 + 示例
- **实践**: 做法 + 适用条件 + 效果
- **决策**: 背景 + 选项 + 选择 + 理由
- **教训**: 问题 + 原因 + 解决方案 + 预防措施

### 步骤 3：结构化存储
- 保存到 `.danny-skill/knowledge-base/distilled/` 目录
- 按领域/类型自动分类
- 生成索引便于检索

### 步骤 4：关联标注
- 标注相关知识条目
- 建立知识图谱连接
- 识别知识缺口

## 知识存储结构

```
.danny-skill/knowledge-base/distilled/
├── concepts/           # 概念定义
├── best-practices/     # 最佳实践
├── decisions/          # 决策记录
└── lessons/            # 教训总结
```

仓库相关知识使用 `.danny-skill/knowledge-base/distilled/`。跨项目通用知识使用 `~/.danny-skill/knowledge-base/distilled/`。

遵守 `docs/knowledge-base/storage-model.md`：蒸馏条目应链接回来源 workspace 或 evidence；临时任务状态未经审阅和重写，不要复制到这里。

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
- [ ] 表述清晰、无歧义
- [ ] 包含足够的上下文
- [ ] 关联到相关知识
- [ ] 标注了来源和日期
