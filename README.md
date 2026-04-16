# danny-skill

danny-skill 是一个跨 AI 编码工具的团队技能库。仓库优先维护可分享、可复用的 `SKILL.md` 技能资产，并为后续 CLI 安装、校验、打包和同步预留扩展点。

## 支持工具

| 等级 | 工具 | 支持方式 |
| --- | --- | --- |
| Tier 1 | Claude Code | 原生 `SKILL.md`，支持用户级和项目级 `.claude/skills/`。 |
| Tier 1 | OpenAI Codex | 原生 `SKILL.md`，支持用户级和项目级 `.agents/skills/`。 |
| Tier 2 | Cursor | 通过 `.cursor/rules/` 和 `.cursor/commands/` 适配，不等同于原生 skill runtime。 |
| Tier 3 | OpenCode | 通过 plugin/link 兼容路径适配，后续可补更完整的 plugin shim。 |

## 核心约定

- `skills/` 是唯一技能源目录。
- 每个技能使用 `skills/<skill-name>/SKILL.md`。
- 技能目录使用 kebab-case，例如 `skills/knowledge-distill/`。
- Claude Code / Codex 原生触发以 `name` 和 `description` 为准。
- `trigger` 是本项目保留的推荐别名/未来 CLI 命令元数据，不会自动变成 Claude Code 或 Codex 的原生命令。
- `triggers` 表示自然语言和关键词触发提示，用于跨工具发现、README 和后续 CLI 生成。
- skill 正文使用中文为主；frontmatter `description` 保持英文 `Use when...`，以兼容 Claude Code / Codex 的技能发现。
- 命令、路径、配置键、技术术语和外部项目名保持原文。
- 插件目录只保存分发元数据或安装说明，不复制技能正文。
- 当前阶段优先稳定技能库；CLI 位于 `packages/cli/`，采用 Node 入口 + Rust N-API core 的渐进实现。

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

当前 shell installer 安装完整 skill 目录，相当于 `full` profile。更细的安装 profile 由 `packages/cli` 提供：

| Profile | 计划用途 |
| --- | --- |
| `minimal` | 只分发 `SKILL.md` 和必要配置，适合轻量同步或手工安装。 |
| `standard` | 分发 `SKILL.md`、小型 `references/` 和 `assets/`，适合大多数团队共享。 |
| `full` | 分发完整 skill 目录，包括大型设计参考和 preview 资源；这是当前 `scripts/install.sh` 的行为。 |

CLI 当前负责 profile 选择、路径映射、知识库初始化、Cursor project rules/commands 适配，以及 Claude Code/Cursor alias wrapper 生成。当前 shell 脚本继续作为跨工具 full-directory 安装器。

```bash
pnpm cli validate
pnpm cli install --tool codex --scope project --profile standard --mode copy
pnpm cli install --tool cursor --scope project --profile standard --mode copy
pnpm cli knowledge init --project
pnpm cli alias generate --tool claude-code
```

`minimal` 和 `standard` profile 会筛选文件，因此只支持 `--mode copy`。`full` profile 支持 `--mode copy` 或 `--mode link`。

## 当前技能与触发方式

| Skill | Claude Code standalone | Claude Code plugin | Codex | Project alias | Description |
| --- | --- | --- | --- | --- | --- |
| `use-danny` | `/use-danny` | `/danny-skill:use-danny` | `$use-danny` | `/use-danny` | danny-skill 入口、安装、选型和知识库映射 |
| `inspiration-box` | `/inspiration-box` | `/danny-skill:inspiration-box` | `$inspiration-box` | `/danny-idea` | 灵感收集与管理 |
| `knowledge-distill` | `/knowledge-distill` | `/danny-skill:knowledge-distill` | `$knowledge-distill` | `/danny-distill` | 团队知识蒸馏 |
| `self-improvement` | `/self-improvement` | `/danny-skill:self-improvement` | `$self-improvement` | `/danny-learn` | 错误、反馈和经验记录 |
| `design-style` | `/design-style` | `/danny-skill:design-style` | `$design-style` | 自动触发 | 参考 58 套网站设计系统生成 UI 风格 |
| `autoresearch-loop` | `/autoresearch-loop` | `/danny-skill:autoresearch-loop` | `$autoresearch-loop` | 自动触发 | 用 eval 驱动的实验循环优化 skill、prompt 和 workflow |
| `research-to-implementation` | `/research-to-implementation` | `/danny-skill:research-to-implementation` | `$research-to-implementation` | 自动触发 | 从论文/开源方案研究到业务适配和编码交接 |
| `coding-guardrails` | `/coding-guardrails` | `/danny-skill:coding-guardrails` | `$coding-guardrails` | 自动触发 | 编码、修复、重构、评审时的简洁/验证/最小变更护栏 |

说明：

- Claude Code standalone 指通过 `~/.claude/skills/` 或项目 `.claude/skills/` 安装后的原生 slash 命令。
- Claude Code plugin 指通过 `.claude-plugin/plugin.json` 作为插件加载后的 namespaced slash 命令。
- Codex 显式调用使用 `$skill-name`；也可以让 Codex 根据 `description` 隐式选择 skill。
- Project alias 是本仓库约定，不是 Claude Code / Codex 官方自动识别字段；后续 CLI 可以据此生成命令包装。

## 可选组合方式

每个 skill 都可以独立使用。下面只是复杂任务的一种组合示例，不要求按顺序执行，也不要求在完成一个 skill 后自动推荐下一个 skill。

复杂任务可以按需组合：

```text
inspiration-box
  -> research-to-implementation
  -> coding-guardrails
  -> autoresearch-loop
  -> self-improvement
  -> knowledge-distill
```

使用建议：

| 阶段 | 使用方式 |
| --- | --- |
| 有想法但还不确定价值 | 可用 `inspiration-box` 放入 `inbox/` 或 `ideas/`。 |
| 需要验证论文、开源项目或方案价值 | 用 `research-to-implementation` 形成研究矩阵、业务适配和实施提案。 |
| 已进入编码、修复、重构或评审 | 用 `coding-guardrails` 限制范围、明确验证方式。 |
| 要优化 skill、prompt 或 workflow | 用 `autoresearch-loop` 建 baseline、跑 eval、做 keep-or-revert。 |
| 出现错误、纠正或成功模式 | 用 `self-improvement` 记录到 `learnings/`。 |
| 结论已经稳定可复用 | 用 `knowledge-distill` 固化到 `distilled/`。 |

后续建议只在用户目标明确需要时给出；不要把组合示例当作强制流程。`design-style` 是视觉专项能力，只在 UI/网站/品牌风格相关任务中插入使用。

## 技能能力边界

| Skill | 适合处理 | 不适合处理 | 主要产物 |
| --- | --- | --- | --- |
| [`use-danny`](skills/use-danny/SKILL.md) | 开始使用 danny-skill、选择 skill、理解安装/触发/知识库映射 | 代替具体业务 skill 执行任务 | skill 选择建议、安装命令、scope/知识库映射 |
| [`inspiration-box`](skills/inspiration-box/SKILL.md) | 捕获产品点子、技术想法、流程改进和探索性灵感 | 已经需要严谨验证、代码实现或团队决策的事项 | `.danny-skill/knowledge-base/inbox/inspiration/` 和 `.danny-skill/knowledge-base/ideas/` 下的灵感与想法记录 |
| [`knowledge-distill`](skills/knowledge-distill/SKILL.md) | 从讨论、决策、经验和 AI 交互中提炼可复用知识 | 原始随手记录、未经验证的想法、临时日志直接归档 | `.danny-skill/knowledge-base/distilled/` 下的概念、最佳实践、决策和教训 |
| [`self-improvement`](skills/self-improvement/SKILL.md) | 记录错误、用户纠正、成功模式和重复问题 | 普通知识整理、产品创意收集或没有具体事件的泛泛总结 | `.danny-skill/knowledge-base/learnings/` 下的错误、纠正、成功和模式记录 |
| [`design-style`](skills/design-style/SKILL.md) | 生成 UI/网站设计、匹配品牌风格、选择视觉系统 | 非视觉任务、后端逻辑、没有 UI 输出需求的纯文档任务 | 基于 `references/designs/` 设计令牌和 `assets/preview.html` 的风格选择或 UI 生成指导 |
| [`autoresearch-loop`](skills/autoresearch-loop/SKILL.md) | 用 baseline、eval、单点 mutation 和 keep-or-revert 优化 skill、prompt 或 workflow | 没有稳定目标文件、没有可测 eval、只想做开放式头脑风暴的任务 | `.danny-skill/knowledge-base/experiments/autoresearch/` 下的实验结果和 changelog |
| [`research-to-implementation`](skills/research-to-implementation/SKILL.md) | 将论文、技术报告、算法或开源项目转成业务适配和编码交接方案 | 只做论文摘要、只看 GitHub star、没有业务问题或验证指标的技术调研 | `.danny-skill/knowledge-base/research/YYYY-MM-DD-topic/` 下的研究矩阵、开源评估、业务适配和实施提案 |
| [`coding-guardrails`](skills/coding-guardrails/SKILL.md) | 编码、修复、重构和评审时约束最小变更、验证和避免过度设计 | 替代具体实现技能、替代测试、替代需求澄清 | 实施前后的检查清单、风险约束和验证要求 |

知识资产统一遵守 [`docs/knowledge-base/storage-model.md`](docs/knowledge-base/storage-model.md)：`capture -> workspace -> evidence -> distilled`。临时任务状态和本地日志不直接作为知识库内容提交。

## 知识存储 Scope

同一个 skill 同时支持项目级和全局级知识，不拆成两套 skill。触发词表达动作，scope 表达存放位置。

为方便单独分发 skill，`SKILL.md` 内部使用 `<project-knowledge-base>` 和 `<global-knowledge-base>` 占位符，不直接依赖本仓库的 `docs/` 或 `.danny-skill/` 路径。下面是本仓库推荐的默认映射。

默认写入当前项目。下面使用项目别名表达动作；在 Claude Code / Codex 原生环境中，用上表对应的 skill 调用方式并带上同样参数即可。

```text
/danny-idea ...      -> .danny-skill/knowledge-base/...
/danny-distill ...   -> .danny-skill/knowledge-base/...
/danny-learn ...     -> .danny-skill/knowledge-base/...
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
| `--project` | `.danny-skill/knowledge-base/` | 和本仓库代码、目录、安装脚本、skill 组成、项目决策有关的内容。默认值。 |
| `--global` | `~/.danny-skill/knowledge-base/` | 脱离当前仓库也成立、可复用于其他项目或团队工作流的内容。 |
| `--both` | 两边都写 | 项目里保留本仓库决策或事实，全局里存去项目化后的通用原则。 |

自然语言也可以触发 scope 判断：

| 用户说法 | Scope |
| --- | --- |
| “记录到当前项目”、“这个项目里记一下”、“本仓库适用” | `--project` |
| “固化到全局”、“以后所有项目都用”、“个人知识库记一下”、“团队通用方法论” | `--global` |
| “项目留一份，全局也沉淀”、“固化成方法论但保留项目记录” | `--both` |

全局知识必须先去项目化：不要包含本地私有路径、一次性任务状态、仓库专有实现细节或本地运行日志。

## 参考来源

外部参考来源集中维护在这里，`SKILL.md` 正文不重复列出来源说明，避免多处漂移。

| Skill | 参考链接 |
| --- | --- |
| `design-style` | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) |
| `autoresearch-loop` | [karpathy/autoresearch](https://github.com/karpathy/autoresearch), [zning1994/openclaw-autoresearch](https://github.com/zning1994/openclaw-autoresearch), [花叔方法论文章](https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w) |
| `research-to-implementation` | [花叔方法论文章](https://mp.weixin.qq.com/s/4ICQJGwa2MD616_oFmJb4w) |
| `coding-guardrails` | [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) |
| `use-danny` | 项目自研入口工作流，见 [`skills/use-danny/SKILL.md`](skills/use-danny/SKILL.md) |
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
├── docs/               # 设计、计划和知识存储模型说明
├── .danny-skill/       # 项目级 skill 知识资产
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

更多贡献规范见 `CONTRIBUTING.md`。Codex 项目运行约定见 `AGENTS.md`。
