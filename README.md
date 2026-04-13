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

安装到指定工具：

```bash
./scripts/install.sh --tool claude-code --yes
./scripts/install.sh --tool codex --yes
./scripts/install.sh --tool cursor --yes
./scripts/install.sh --tool opencode --yes
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
