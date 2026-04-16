# Learning Patterns

## Agent 使用入口

后续 Agent 执行任务前，先按任务关键词、工具和错误信息扫描本文件。命中规则后，只把相关规则带入当前上下文。

## 项目规则

- 任务关键词: `nodejs`, `package-manager`, `install`, `test`, `dependency`
  - 规则: 优先使用 `pnpm` 执行依赖安装、测试和脚本命令。
  - 来源: `corrections/2026-03-25-npm-vs-pnpm.md`, `errors/2026-03-25-npm-install-timeout.md`
  - 适用: Node.js 项目依赖安装、测试、脚本执行。
  - 例外: 项目文档或 lockfile 明确要求 `npm`、`yarn` 或其他工具。

- 任务关键词: `typescript`, `tsconfig`, `target`, `modern-js`
  - 规则: 新 TypeScript 项目优先使用 `ES2022` 或更高 target。
  - 来源: `successes/2026-03-25-tsconfig-target.md`
  - 适用: 新项目初始化、TypeScript 编译配置设计。
  - 例外: 运行环境需要兼容旧浏览器或旧 Node.js。
