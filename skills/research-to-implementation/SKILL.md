---
name: research-to-implementation
description: Use when turning papers, technical reports, or research ideas into open-source comparisons, business-fit analysis, implementation proposals, and coding handoff plans
version: "1.0"
triggers: [paper, research, arxiv, literature, open-source, implementation, business-fit, feasibility, prototype]
tags: [research, papers, open-source, implementation, product, engineering]
supported_tools: [claude-code, codex]
---

# Research To Implementation

## 用途

将研究方向转化为工程决策和编码交接。这个 skill 覆盖 paper search、paper analysis、open source evaluation、business fit、implementation proposal 和 coding handoff。

当用户想判断某篇论文、算法、架构、模型、benchmark 或开源项目能否改进自己的产品、工作流或工程效率时，使用这个 skill。

## 流程

1. **界定研究问题**：定义业务问题、指标、约束和非目标。
2. **执行 paper search**：查找候选论文或技术报告，并用明确的纳入/排除标准过滤。
3. **进行 paper analysis**：把方法翻译成工程语言：输入、输出、假设、模块、成本、数据需求和可复用思路。
4. **进行 open source evaluation**：搜索实现方案，比较 license、维护健康度、API 适配、文档、测试、安全姿态和改造成本。
5. **评估 business fit**：发散它能改进用户业务、运营、产品或开发工作流的哪些位置。
6. **编写 implementation proposal**：定义 MVP 范围、架构、风险、验证指标和回滚路径。
7. **创建 coding handoff**：只有 implementation proposal 包含小而可验证的切片后，才交接给计划、TDD 或编码。

## 决策门

### 决策门 1：研究是否足够？

当关键结论依赖单一弱来源、论文缺少可复现细节，或开源生态不清楚时，继续研究。

当 paper analysis 已识别具体机制，并找到至少一条可行实现路径时，可以向前推进。

### 决策门 2：Adopt、Adapt、Reject 或 Research More

使用这组决策词：

- **Adopt**：用现有开源方案，尽量少改。
- **Adapt**：复用概念或代码，但按本地约束改造。
- **Reject**：当前不值得继续投入。
- **Research More**：关键不确定性阻碍负责任决策。

### 决策门 3：Coding Handoff

implementation proposal 未说明以下内容前，不开始编码：

- 目标用户或内部工作流
- 精确 MVP 行为
- 可能触及的文件/模块
- 验证命令或成功指标
- fallback 或 rollback 方案

## 输出工作区

每个研究主题使用这个结构：

```text
.danny-skill/knowledge-base/research/YYYY-MM-DD-topic/
├── research-brief.md
├── paper-matrix.md
├── paper-notes/
├── open-source-candidates.md
├── business-fit.md
├── implementation-proposal.md
└── decision.md
```

仓库相关研究使用 `.danny-skill/knowledge-base/research/`。跨项目通用研究模式使用 `~/.danny-skill/knowledge-base/research/`。

遵守 `docs/knowledge-base/storage-model.md`：research 目录是 workspace。这里保存 source notes、comparisons、business fit 和 decisions；不要放临时 `.omx` 模式状态，除非已沉淀为 durable artifact。

## 模板

优先使用参考模板，不要临时发明新结构：

- `references/paper-analysis-template.md`
- `references/open-source-evaluation-template.md`
- `references/business-fit-template.md`
- `references/implementation-proposal-template.md`

`assets/research-workspace.example.md` 提供了完整 research-to-coding trace 的紧凑示例。

## 可选衔接

- 对尚未验证的早期想法，可使用 `inspiration-box`。
- 候选实现需要 eval 驱动实验时，可使用 `autoresearch-loop`。
- 结论已验证且可复用后，可使用 `knowledge-distill`。
- 研究过程暴露重复错误、失败假设或用户纠正时，可使用 `self-improvement`。

## 护栏

- 不要只总结论文而不提取工程含义。
- 未检查 license 和维护健康度前，不要推荐开源项目。
- 除非用户明确接受风险，不要只基于一篇论文开始实现。
- 不要把“有 GitHub stars”当成适配证据。
- 不要跳过 business fit；技术新颖性不等于业务价值。
