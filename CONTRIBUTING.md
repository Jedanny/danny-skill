# Repository Guidelines

## 项目结构与模块组织

本仓库是 `danny-skill` 跨工具 AI 技能库。`skills/` 是唯一技能源目录，每个技能位于 `skills/<skill-name>/SKILL.md`，可选资料放在同级 `references/`、`scripts/`、`assets/`。`commands/` 保存可复用命令文档，`prompts/` 保存提示词模板，`hooks/` 保存会话 hook。`.claude-plugin/`、`.cursor-plugin/`、`.codex/`、`.opencode/` 只保存工具分发元数据或安装说明。设计、计划和学习记录放在 `docs/`，测试放在 `tests/`。

## 构建、测试与开发命令

- `pnpm install`：根据 `pnpm-lock.yaml` 安装依赖。
- `pnpm test`：运行 Jest 测试，覆盖技能 schema、插件 manifest、仓库结构和安装脚本。
- `pnpm run validate`：当前等同于 `pnpm test`。
- `pnpm run install:claude`：以链接模式安装技能到 Claude Code。
- `./scripts/install.sh --tool codex --dry-run --yes`：预览 Codex 安装路径。

当前没有独立构建产物；如修改 TypeScript 测试或未来工具代码，运行 `pnpm exec tsc --noEmit`。

## 编码风格与命名约定

代码使用 TypeScript 和 ES Modules；技能、命令和提示词使用 Markdown。JSON、YAML、TypeScript 使用两个空格缩进。技能目录必须使用 kebab-case，并与 frontmatter 的 `name` 一致。技能触发命名保持 `/danny-*` 约定。不要为不同工具复制技能正文；工具差异放入 manifest、安装文档或未来 CLI。

## 测试规范

测试框架为 Jest + `ts-jest`，配置见 `jest.config.js`。新增测试使用 `*.test.ts` 命名并放在 `tests/`。修改技能 frontmatter、插件元数据、安装脚本或目录结构时，必须补充或更新对应测试。安装脚本测试必须使用临时目标目录，不能写真实用户工具目录。

## 提交与 Pull Request 规范

提交信息遵守仓库 Lore commit 协议：首行写“为什么”，正文说明约束和取舍，必要时添加 `Constraint:`、`Rejected:`、`Confidence:`、`Scope-risk:`、`Tested:`、`Not-tested:` 等 trailer。PR 应说明变更的技能、安装路径或分发元数据，列出验证命令，并关联相关设计文档或计划。

## 安全与配置提示

不要提交本地密钥、私有工具路径、`node_modules/`、`dist/` 或 `.omx/` 运行态数据。修改安装脚本时保持保守，因为它会写入或链接到用户工具目录，例如 `~/.claude/skills/`、`~/.codex/skills/`、`~/.cursor/skills/` 和 `~/.opencode/plugins/`。
