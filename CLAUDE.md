# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

danny-skill 是团队 AI 技能共享中心，支持跨工具复用（Claude Code、Cursor、OpenCode、Codex、Codebuddy）。

## 常用命令

```bash
# 安装依赖
pnpm install

# 构建 TypeScript
pnpm run build

# 运行测试
pnpm test

# 安装到本地工具
./scripts/install.sh

# 检测已安装的 AI 工具
./scripts/detect-tools.sh
```

## 项目结构

- `assets/` - 声明式 AI 资产（skills、commands、prompts、workflows）
- `adapters/` - 工具适配器（当前实现 Claude Code）
- `lib/` - 共享库和类型定义
- `scripts/` - 安装和配置脚本
- `tests/` - 测试文件

## 资产类型

### Skills
位置: `assets/skills/<domain>/`
- 触发方式: `/<skill-name>`
- 每个 skill 包含 `.yaml` 元数据和 `.md` 内容

### Commands
位置: `assets/commands/<domain>/`
- 可执行的命令定义
- 支持参数配置

### Prompts
位置: `assets/prompts/<domain>/`
- 提示词模板
- 支持变量替换

## 领域分类

- `common/` - 通用技能
- `frontend/` - 前端开发
- `backend/` - 后端开发
- `devops/` - 运维部署
- `quality/` - 代码质量
- `docs/` - 文档生成

## 添加新资产

1. 在对应领域目录创建 `<name>/` 目录
2. 创建 `<name>.yaml` 元数据文件
3. 创建 `<name>.md` 内容描述文件
4. 运行测试确保格式正确
