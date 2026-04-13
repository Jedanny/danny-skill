# danny-skill 可分享工具架构设计

**日期：** 2026-04-13  
**状态：** 草案  
**目标：** 将 danny-skill 优化为优先面向 Claude Code、Codex、Cursor、OpenCode 等工具的可分享技能库，同时为后续 CLI 分发、安装、校验和打包预留清晰扩展点。

---

## 1. 背景

当前仓库已经从早期 `assets/ + adapters/ + lib/schema.ts` 的实现路线，演进为更接近社区标准的结构：顶层 `skills/`、`commands/`、`prompts/`、`hooks/`，并带有 `.claude-plugin/`、`.codex/`、`.cursor-plugin/`、`.opencode/` 等工具入口。

这种方向与 Superpowers、Claude Code plugin、Codex native skills、OpenCode plugin 的实践更一致：技能以 `skills/<name>/SKILL.md` 为核心分发单元，工具差异由安装文档、插件 manifest 或轻量 shim 处理，而不是为每个工具维护一套业务 adapter。

---

## 2. 设计目标

1. **技能库优先**：仓库的首要产物是可读、可安装、可分享的技能集合。
2. **单一事实源**：`skills/` 是技能内容的唯一源，避免 `assets/` 与工具目录多份重复定义。
3. **多工具兼容**：Claude Code、Codex、Cursor、OpenCode 通过各自推荐入口消费同一套技能。
4. **CLI 可预留**：现在不强行做完整 CLI，但目录和测试为未来 `validate/install/package/sync` 命令留接口。
5. **贡献友好**：新增技能只需理解 `SKILL.md`、frontmatter、references/scripts/assets 约定。

---

## 3. 推荐目录结构

```text
danny-skill/
├── skills/                       # 标准技能源资产
│   └── <skill-name>/
│       ├── SKILL.md              # 必须，技能入口
│       ├── references/           # 可选，长文档或参考资料
│       ├── scripts/              # 可选，技能专用脚本
│       └── assets/               # 可选，图片、模板、示例文件
├── commands/                     # 可复用 slash command / command 文档
├── prompts/                      # 可复用提示词模板
├── agents/                       # 可选，角色/子代理提示词，后续引入
├── hooks/                        # 会话 hook 与跨工具 hook 配置
├── tools/                        # 当前轻量脚本，未来 CLI 雏形
├── packages/
│   └── cli/                      # 预留，后续正式 CLI 包
├── dist/                         # 生成产物，不手写
├── .claude-plugin/               # Claude Code plugin/marketplace 元数据
├── .codex/                       # Codex 安装说明和未来 Codex 专用入口
├── .cursor-plugin/               # Cursor plugin 元数据
├── .opencode/                    # OpenCode 安装说明和 plugin shim
├── docs/                         # 设计、贡献、发布和学习文档
└── tests/                        # 结构、元数据、安装脚本测试
```

`dist/`、`packages/cli/` 和 `agents/` 可先不填充完整实现，但目录意图要在文档中固定，避免后续贡献者随意新增平行体系。

---

## 4. 技能规范

每个技能必须使用：

```text
skills/<skill-name>/SKILL.md
```

基础 frontmatter：

```yaml
---
name: skill-name
description: Use when a task matches this workflow - concise explanation of the skill outcome
version: "1.0"
tags: [knowledge, workflow]
supported_tools: [claude-code, codex, cursor, opencode]
---
```

约束：

- `name` 与目录名一致，使用 kebab-case。
- `description` 同时承担“技能说明”和“自动触发提示”职责，应写清使用场景。
- 工具专有配置不要塞进正文；放到工具 manifest、安装文档或未来 `tools/` 生成逻辑。
- 大段参考资料放入 `references/`，脚本放入 `scripts/`，避免 `SKILL.md` 过长。

---

## 5. 工具分发边界

### Claude Code

使用 `.claude-plugin/plugin.json` 和 `.claude-plugin/marketplace.json` 描述插件。技能保持在根目录 `skills/`，与 Claude Code plugin 的目录约定兼容。

### Codex

使用 `.codex/INSTALL.md` 说明安装方式。默认策略是 clone 仓库后，将 `skills/` 暴露给 Codex 的技能发现路径，例如通过 symlink 或 copy。后续 CLI 可自动化该步骤。

### OpenCode

保留 `.opencode/INSTALL.md`。如需自动注册技能路径，可参考 Superpowers 的轻量 plugin shim：只做路径注册和 bootstrap 注入，不复制技能业务逻辑。

### Cursor

保留 `.cursor-plugin/plugin.json`，优先把本仓库作为技能/提示词资产包分发。Cursor 特定限制用文档说明，不改变 canonical skills。

---

## 6. CLI 预留设计

近期只新增轻量脚本或测试，避免过早 monorepo 化。未来 CLI 可放在 `packages/cli/`，命令面向四类能力：

- `danny-skill validate`：校验 `SKILL.md` frontmatter、目录命名、支持工具字段。
- `danny-skill install --tool codex|claude|cursor|opencode`：安装或链接技能。
- `danny-skill package --tool <tool>`：生成 `dist/<tool>/` 分发包。
- `danny-skill sync`：从 canonical skills 同步工具 manifest 或索引。

当前阶段不新增运行时依赖；如需解析 YAML，可优先复用已有依赖或在测试中使用简单 frontmatter parser。

---

## 7. 测试策略

现有 `tests/adapters/claude-code.test.ts` 与已删除的 `adapters/` 结构不匹配，应迁移为资产库测试：

1. `tests/skills-schema.test.ts`：遍历 `skills/*/SKILL.md`，校验 frontmatter 必填字段、目录名一致、支持工具合法。
2. `tests/plugin-manifest.test.ts`：校验 `.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`、`.cursor-plugin/plugin.json` 的基本字段。
3. `tests/install-script.test.ts`：使用临时 HOME 或目标目录验证安装脚本，不写真实用户目录。
4. `tests/repo-layout.test.ts`：防止重新引入旧 `assets/`、旧 `adapters/`、旧 `lib/schema.ts` 与新结构并存。

---

## 8. 迁移计划

### 阶段 1：结构定稿

- 更新 README，明确项目是技能库优先。
- 更新 AGENTS/CLAUDE 指南，记录贡献入口和测试命令。
- 明确 `skills/` 是唯一事实源。

### 阶段 2：测试对齐

- 删除或重写旧 adapter 测试。
- 增加技能 schema、manifest、repo layout 测试。
- 调整 `tsconfig.json`，避免指向不存在的 `adapters/` 和 `lib/`。

### 阶段 3：安装与分发

- 完善 `.codex/INSTALL.md`、`.opencode/INSTALL.md`。
- 改造 `scripts/install.sh`，支持 dry-run、目标工具选择和测试用目标目录。
- 保持 Claude plugin metadata 与 README 一致。

### 阶段 4：CLI 萌芽

- 将可复用校验逻辑放入 `tools/`。
- 当脚本能力稳定后，再迁移到 `packages/cli/`。

---

## 9. 非目标

- 不在当前阶段重建旧 `assets/ + adapters/` 架构。
- 不为每个工具复制一份技能内容。
- 不立即发布完整 npm CLI。
- 不引入新的运行时依赖，除非某个验证或打包能力无法可靠实现。

---

## 10. 参考

- Claude Code Plugins: https://docs.claude.com/en/docs/claude-code/plugins
- Claude Code Skills: https://code.claude.com/docs/en/skills
- Agent Skills: https://docs.claude.com/en/docs/agents-and-tools/agent-skills
- Superpowers repository pattern: https://github.com/obra/superpowers
