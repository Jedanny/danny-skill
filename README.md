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
