# danny-skill

danny-skill 是一个跨 AI 编码工具的团队技能库。仓库优先维护可分享、可复用的 `SKILL.md` 技能资产，并为后续 CLI 安装、校验、打包和同步预留扩展点。

## 支持工具

- Claude Code
- OpenAI Codex
- Cursor
- OpenCode

## 核心约定

- `skills/` 是唯一技能源目录。
- 每个技能使用 `skills/<skill-name>/SKILL.md`。
- 技能目录使用 kebab-case，例如 `skills/knowledge-distill/`。
- 插件目录只保存分发元数据或安装说明，不复制技能正文。
- 当前阶段优先稳定技能库；完整 CLI 后续放入 `packages/cli/`。

## 安装

```bash
pnpm install
pnpm test
```

默认安装使用软链接，便于一个仓库同时复用到多个工具：

```bash
./scripts/install.sh --tool claude-code --yes
./scripts/install.sh --tool codex --yes
./scripts/install.sh --tool cursor --yes
./scripts/install.sh --tool opencode --yes
```

在 macOS/Linux 下使用 symlink；在 Windows Git Bash/MSYS/Cygwin 环境下脚本会尝试创建目录 junction。若目标目录已有旧的复制版技能，使用 `--replace` 替换为链接：

```bash
./scripts/install.sh --tool all --replace --yes
```

如果目标环境不支持软链接，可显式使用复制模式：

```bash
./scripts/install.sh --tool codex --mode copy --yes
```

Claude Code 和 Codex 官方项目级技能可分别链接到 `.claude/skills/` 和 `.agents/skills/`。Cursor 官方项目规则和命令可链接到 `.cursor/rules/` 与 `.cursor/commands/`：

```bash
./scripts/install.sh --tool claude-code --scope project --yes
./scripts/install.sh --tool codex --scope project --yes
./scripts/install.sh --tool cursor --scope project --yes
```

安全预览安装路径：

```bash
./scripts/install.sh --tool codex --dry-run --yes
```

## 当前技能

| Skill | Trigger | Description |
| --- | --- | --- |
| `inspiration-box` | `/danny-idea` | 灵感收集与管理 |
| `knowledge-distill` | `/danny-distill` | 团队知识蒸馏 |
| `self-improvement` | `/danny-learn` | 错误、反馈和经验记录 |
| `design-style` | 自动触发 | 参考 58 套网站设计系统生成 UI 风格 |
| `autoresearch-loop` | 自动触发 | 用 eval 驱动的实验循环优化 skill、prompt 和 workflow |
| `research-to-implementation` | 自动触发 | 从论文/开源方案研究到业务适配和编码交接 |
| `coding-guardrails` | 自动触发 | 编码、修复、重构、评审时的简洁/验证/最小变更护栏 |

## 技能能力边界

| Skill | 适合处理 | 不适合处理 | 主要产物 |
| --- | --- | --- | --- |
| [`inspiration-box`](skills/inspiration-box/SKILL.md) | 捕获产品点子、技术想法、流程改进和探索性灵感 | 已经需要严谨验证、代码实现或团队决策的事项 | `docs/knowledge-base/project/inbox/inspiration/` 和 `docs/knowledge-base/project/ideas/` 下的灵感与想法记录 |
| [`knowledge-distill`](skills/knowledge-distill/SKILL.md) | 从讨论、决策、经验和 AI 交互中提炼可复用知识 | 原始随手记录、未经验证的想法、运行态日志直接归档 | `docs/knowledge-base/project/distilled/` 下的概念、最佳实践、决策和教训 |
| [`self-improvement`](skills/self-improvement/SKILL.md) | 记录错误、用户纠正、成功模式和重复问题 | 普通知识整理、产品创意收集或没有具体事件的泛泛总结 | `docs/knowledge-base/project/learnings/` 下的错误、纠正、成功和模式记录 |
| [`design-style`](skills/design-style/SKILL.md) | 生成 UI/网站设计、匹配品牌风格、选择视觉系统 | 非视觉任务、后端逻辑、没有 UI 输出需求的纯文档任务 | 基于 `references/designs/` 设计令牌和 `assets/preview.html` 的风格选择或 UI 生成指导 |
| [`autoresearch-loop`](skills/autoresearch-loop/SKILL.md) | 用 baseline、eval、单点 mutation 和 keep-or-revert 优化 skill、prompt 或 workflow | 没有稳定目标文件、没有可测 eval、只想做开放式头脑风暴的任务 | `docs/knowledge-base/project/experiments/autoresearch/` 下的实验结果和 changelog |
| [`research-to-implementation`](skills/research-to-implementation/SKILL.md) | 将论文、技术报告、算法或开源项目转成业务适配和编码交接方案 | 只做论文摘要、只看 GitHub star、没有业务问题或验证指标的技术调研 | `docs/knowledge-base/project/research/YYYY-MM-DD-topic/` 下的研究矩阵、开源评估、业务适配和实施提案 |
| [`coding-guardrails`](skills/coding-guardrails/SKILL.md) | 编码、修复、重构和评审时约束最小变更、验证和避免过度设计 | 替代具体实现技能、替代测试、替代需求澄清 | 实施前后的检查清单、风险约束和验证要求 |

知识资产统一遵守 [`docs/knowledge-base/storage-model.md`](docs/knowledge-base/storage-model.md)：`capture -> workspace -> evidence -> distilled`。`.omx/` 只保存运行态、编排态和本地日志，不直接作为知识库内容提交。

## 知识存储 Scope

同一个 skill 同时支持项目级和全局级知识，不拆成两套 skill。触发词表达动作，scope 表达存放位置。

默认写入当前项目：

```text
/danny-idea ...      -> docs/knowledge-base/project/...
/danny-distill ...   -> docs/knowledge-base/project/...
/danny-learn ...     -> docs/knowledge-base/project/...
```

显式写入全局或双写：

```text
/danny-idea --global ...
/danny-distill --global ...
/danny-learn --global ...
/danny-distill --both ...
```

| Scope | 存储位置 | 适用内容 |
| --- | --- | --- |
| `--project` | `docs/knowledge-base/project/` | 和本仓库代码、目录、安装脚本、skill 组成、项目决策有关的内容。默认值。 |
| `--global` | `~/.danny-skill/knowledge-base/` | 脱离当前仓库也成立、可复用于其他项目或团队工作流的内容。 |
| `--both` | 两边都写 | 项目里保留本仓库决策或事实，全局里存去项目化后的通用原则。 |

自然语言也可以触发 scope 判断：

| 用户说法 | Scope |
| --- | --- |
| “记录到当前项目”、“这个项目里记一下”、“本仓库适用” | `--project` |
| “固化到全局”、“以后所有项目都用”、“个人知识库记一下”、“团队通用方法论” | `--global` |
| “项目留一份，全局也沉淀”、“固化成方法论但保留项目记录” | `--both` |

全局知识必须先去项目化：不要包含本地私有路径、一次性任务状态、仓库专有实现细节或 `.omx/` 运行日志。

## 参考来源

| Skill | 参考链接 |
| --- | --- |
| `design-style` | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) |
| `autoresearch-loop` | [karpathy/autoresearch](https://github.com/karpathy/autoresearch), [zning1994/openclaw-autoresearch](https://github.com/zning1994/openclaw-autoresearch), [花叔方法论文章](https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w) |
| `research-to-implementation` | [花叔方法论文章](https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w) |
| `coding-guardrails` | [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) |
| `inspiration-box` | 项目自研工作流，见 [`skills/inspiration-box/SKILL.md`](skills/inspiration-box/SKILL.md) |
| `knowledge-distill` | 项目自研工作流，见 [`skills/knowledge-distill/SKILL.md`](skills/knowledge-distill/SKILL.md) |
| `self-improvement` | 项目自研工作流，见 [`skills/self-improvement/SKILL.md`](skills/self-improvement/SKILL.md) |

## 目录结构

```text
danny-skill/
├── skills/             # 标准 SKILL.md 技能
├── commands/           # 可复用命令文档
├── prompts/            # 提示词模板
├── hooks/              # 会话 hook
├── .claude-plugin/     # Claude Code plugin metadata
├── .codex/             # Codex 安装说明
├── .cursor-plugin/     # Cursor plugin metadata
├── .opencode/          # OpenCode 安装说明
├── docs/               # 设计、计划和学习记录
├── tests/              # Jest 结构和安装测试
├── tools/              # 预留轻量工具脚本
└── packages/cli/       # 预留 CLI 包
```

## 开发

```bash
pnpm test
pnpm run validate
pnpm exec tsc --noEmit
```

新增技能时，创建 `skills/<skill-name>/SKILL.md`，填写 `name`、`description`、`version`、`tags`、`supported_tools` 等 frontmatter，并运行 `pnpm test`。

更多贡献规范见 `CONTRIBUTING.md`。Codex/oh-my-codex 项目运行约定见 `AGENTS.md`。
