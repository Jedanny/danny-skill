# danny-skill MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 danny-skill 项目基础结构，实现 Claude Code 适配器，创建示例资产和安装脚本

**Architecture:** 采用适配器模式，资产与工具解耦。核心结构包含 assets/（声明式资产定义）、adapters/（工具适配层）、scripts/（安装脚本）。每种资产类型有统一元数据格式（YAML）+ 内容描述（Markdown）。

**Tech Stack:** Shell + TypeScript, npm

---

## 文件结构规划

```
danny-skill/
├── package.json                      # 项目配置
├── tsconfig.json                    # TypeScript 配置
├── assets/                           # AI 资产
│   ├── skills/
│   │   ├── common/
│   │   │   └── read-code/
│   │   │       ├── read-code.yaml   # 元数据
│   │   │       └── read-code.md     # 内容
│   │   └── frontend/
│   │       └── react-best-practices/
│   │           ├── react-best-practices.yaml
│   │           └── react-best-practices.md
│   ├── commands/
│   │   ├── common/
│   │   │   └── project-init/
│   │   │       ├── project-init.yaml
│   │   │       └── project-init.md
│   │   └── devops/
│   │       └── deploy/
│   │           ├── deploy.yaml
│   │           └── deploy.md
│   └── prompts/
│       └── docs/
│           └── api-doc-template/
│               ├── api-doc-template.yaml
│               └── api-doc-template.md
├── adapters/                         # 工具适配器
│   └── claude-code/
│       ├── index.ts                  # 适配器主入口
│       ├── loader.ts                 # 资产加载器
│       └── installer.ts              # 安装逻辑
├── lib/                              # 共享库
│   └── schema.ts                    # 资产 Schema 定义
├── scripts/                          # 安装脚本
│   ├── install.sh                    # 主安装脚本
│   └── detect-tools.sh              # 工具检测脚本
└── tests/                            # 测试
    ├── schema.test.ts
    └── assets.test.ts
```

---

## Task 1: 项目基础配置

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "danny-skill",
  "version": "1.0.0",
  "description": "Team AI Skills Hub - Cross-tool AI asset sharing platform",
  "main": "lib/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "lint": "tsc --noEmit"
  },
  "keywords": ["claude-code", "cursor", "opencode", "codex", "skills", "commands"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "yaml": "^2.3.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./lib",
    "rootDir": "./adapters",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["adapters/**/*", "lib/**/*"],
  "exclude": ["node_modules", "lib"]
}
```

- [ ] **Step 3: 创建 .gitignore**

```
node_modules/
lib/
*.js
*.d.ts
.DS_Store
```

- [ ] **Step 4: 提交**

```bash
git init
git add package.json tsconfig.json .gitignore
git commit -m "feat: project basic configuration"
```

---

## Task 2: 资产 Schema 定义

**Files:**
- Create: `lib/schema.ts` - 资产元数据类型定义
- Create: `tests/schema.test.ts` - Schema 测试

- [ ] **Step 1: 创建 lib/schema.ts**

```typescript
// Asset base interface
export interface Asset {
  name: string;
  version: string;
  domain: Domain;
  tags: string[];
  description: string;
  adapter: string | 'universal';
}

// Domain categories
export type Domain = 'frontend' | 'backend' | 'devops' | 'quality' | 'docs' | 'common';

// Skill extends Asset
export interface Skill extends Asset {
  type: 'skill';
  trigger?: string;
  requires?: string[];
  content: string; // Markdown content
}

// Command extends Asset
export interface Command extends Asset {
  type: 'command';
  command: string;
  content?: string;
}

// Prompt extends Asset
export interface Prompt extends Asset {
  type: 'prompt';
  template: string;
  variables?: string[];
}

// Workflow extends Asset
export interface Workflow extends Asset {
  type: 'workflow';
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  type: 'skill' | 'command' | 'prompt';
  ref: string;
}

// Loader result
export interface AssetLoadResult<T extends Asset> {
  success: boolean;
  asset?: T;
  error?: string;
}

// Load asset from YAML file
export async function loadAsset<T extends Asset>(filePath: string): Promise<AssetLoadResult<T>> {
  // Implementation in loader.ts
}
```

- [ ] **Step 2: 创建 tests/schema.test.ts**

```typescript
import { describe, expect, test } from '@jest/globals';

describe('Schema', () => {
  test('Skill type should have required fields', () => {
    const skill = {
      name: 'read-code',
      version: '1.0',
      domain: 'common',
      tags: ['reading', 'understanding'],
      description: 'Code reading skill',
      type: 'skill',
      trigger: '/read',
      adapter: 'universal',
      content: '# Read Code\n\nThis skill helps...'
    };

    expect(skill.name).toBe('read-code');
    expect(skill.type).toBe('skill');
    expect(skill.domain).toBe('common');
  });

  test('Command type should have command field', () => {
    const cmd = {
      name: 'project-init',
      version: '1.0',
      domain: 'common',
      tags: ['init', 'setup'],
      description: 'Project initialization',
      type: 'command',
      command: 'npm init',
      adapter: 'universal'
    };

    expect(cmd.type).toBe('command');
    expect(cmd.command).toBe('npm init');
  });
});
```

- [ ] **Step 3: 运行测试验证**

```bash
npm install
npm run test
```

- [ ] **Step 4: 提交**

```bash
git add lib/schema.ts tests/schema.test.ts
git commit -m "feat: add asset schema definitions"
```

---

## Task 3: 创建示例资产

### 3.1 Skill: read-code (通用技能)

**Files:**
- Create: `assets/skills/common/read-code/read-code.yaml`
- Create: `assets/skills/common/read-code/read-code.md`

- [ ] **Step 1: 创建 read-code.yaml**

```yaml
name: read-code
version: "1.0"
domain: common
tags: [reading, understanding, analysis]
description: "标准化代码阅读理解流程，帮助 AI 快速理解代码结构和逻辑"
trigger: "/read"
adapter: universal
requires: []
```

- [ ] **Step 2: 创建 read-code.md**

```markdown
# Read Code Skill

## Purpose
帮助 AI agent 系统性地阅读和理解代码库，快速掌握代码结构、模块关系和核心逻辑。

## Usage
当用户请求阅读或理解代码时，使用此技能。

## Steps

1. **确定代码范围**
   - 识别要阅读的文件或目录
   - 确认代码语言和框架

2. **分析代码结构**
   - 读取目录结构，了解模块划分
   - 识别入口文件和配置文件

3. **阅读核心代码**
   - 从入口文件开始
   - 按依赖关系逐步深入
   - 记录关键函数和类

4. **总结代码逻辑**
   - 用简洁语言描述核心功能
   - 说明模块间的协作关系
   - 标注重要的设计模式

## Output Format

```
## 代码概览
- **语言/框架**: xxx
- **模块数量**: x
- **核心入口**: xxx

## 目录结构
...
## 核心模块说明
...
```

### 3.2 Skill: react-best-practices (前端技能)

**Files:**
- Create: `assets/skills/frontend/react-best-practices/react-best-practices.yaml`
- Create: `assets/skills/frontend/react-best-practices/react-best-practices.md`

- [ ] **Step 3: 创建 react-best-practices.yaml**

```yaml
name: react-best-practices
version: "1.0"
domain: frontend
tags: [react, best-practices, hooks, performance]
description: "React 最佳实践指南，包含 Hooks 使用、性能优化、组件设计模式"
trigger: "/react-best"
adapter: claude-code
requires: []
```

- [ ] **Step 4: 创建 react-best-practices.md**

```markdown
# React Best Practices

## Hooks 使用规则

### 1. Hooks 调用顺序
- 只在组件顶层调用 Hooks
- 不在条件语句、循环或嵌套函数中调用

### 2. useEffect 依赖管理
- 始终包含正确的依赖数组
- 使用 ESLint exhaustive-deps 规则

### 3. 自定义 Hooks
- 以 `use` 开头命名
- 单一职责
- 返回值类型明确

## 性能优化

### 1. React.memo
- 对纯函数组件使用
- 避免过度使用

### 2. useMemo / useCallback
- 用于 expensive computation
- 用于 callback 传递给子组件

### 3. 列表渲染
- 使用 key 避免全量重渲染
- 使用虚拟列表处理大列表

## 组件设计

### 1. 组件拆分原则
- 单一职责
- 100 行以内最佳
- 超过 200 行考虑拆分

### 2. Props 接口
- 使用 TypeScript interface
- 避免使用 any

### 3. 状态管理
- 优先 useState
- 跨组件共享用 Context
- 复杂状态用 useReducer 或状态库
```

### 3.3 Command: project-init (通用命令)

**Files:**
- Create: `assets/commands/common/project-init/project-init.yaml`
- Create: `assets/commands/common/project-init/project-init.md`

- [ ] **Step 5: 创建 project-init.yaml**

```yaml
name: project-init
version: "1.0"
domain: common
tags: [init, setup, scaffolding]
description: "标准化项目初始化流程，支持多种项目模板"
command: |
  echo "Project initialization"
  # 具体命令根据项目类型动态生成
adapter: universal
```

- [ ] **Step 6: 创建 project-init.md**

```markdown
# Project Init Command

## Description
交互式项目初始化工具，根据选择的项目类型和配置生成项目脚手架。

## Supported Templates

### 1. Node.js
- Express/Koa/Egg.js
- TypeScript 默认支持

### 2. React
- Vite + React + TypeScript
- TailwindCSS 可选

### 3. Vue
- Vite + Vue + TypeScript

### 4. Next.js
- App Router
- TypeScript 默认

## Usage
```bash
npx @danny-skill/project-init
```

## Interactive Options
1. Project name
2. Template selection
3. Additional features (ESLint, Prettier, etc.)
4. Git initialization
```

### 3.4 Command: deploy (DevOps 命令)

**Files:**
- Create: `assets/commands/devops/deploy/deploy.yaml`
- Create: `assets/commands/devops/deploy/deploy.md`

- [ ] **Step 7: 创建 deploy.yaml**

```yaml
name: deploy
version: "1.0"
domain: devops
tags: [deploy, ci-cd, release]
description: "标准化部署流程，支持多环境部署"
command: |
  echo "Deploy command"
adapter: universal
```

- [ ] **Step 8: 创建 deploy.md**

```markdown
# Deploy Command

## Description
标准化部署命令，支持开发、预发、生产多环境。

## Prerequisites
- Docker 已安装
- kubectl 配置正确
- 部署配置已定义

## Usage
```bash
# 开发环境
./deploy.sh dev

# 预发环境
./deploy.sh staging

# 生产环境
./deploy.sh prod
```

## Environments
1. **dev**: 开发环境，自动部署到 dev 集群
2. **staging**: 预发环境，使用灰度发布
3. **prod**: 生产环境，需要确认后部署
```

### 3.5 Prompt: api-doc-template (文档提示词)

**Files:**
- Create: `assets/prompts/docs/api-doc-template/api-doc-template.yaml`
- Create: `assets/prompts/docs/api-doc-template/api-doc-template.md`

- [ ] **Step 9: 创建 api-doc-template.yaml**

```yaml
name: api-doc-template
version: "1.0"
domain: docs
tags: [api, documentation, openapi]
description: "API 文档生成模板，输出符合 OpenAPI 规范的文档"
template: |
  请为以下 API 生成文档：

  接口路径: {{path}}
  请求方法: {{method}}
  功能描述: {{description}}
  请求参数: {{params}}
  返回格式: {{response}}

  请按以下格式输出：
  ## {{path}}
  ...
variables: [path, method, description, params, response]
adapter: universal
```

- [ ] **Step 10: 创建 api-doc-template.md**

```markdown
# API Documentation Template

## Description
生成标准化的 API 文档，支持 OpenAPI 3.0 格式。

## Template Structure

```yaml
## API Endpoint

### 请求信息
- **URL**: {url}
- **Method**: {method}
- **Content-Type**: application/json

### 请求参数
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|

### 请求示例
```json
{
  "example": "value"
}
```

### 响应参数
| 参数名 | 类型 | 描述 |
|--------|------|------|

### 响应示例
```json
{
  "code": 0,
  "data": {}
}
```

### 错误码说明
| 错误码 | 描述 |
|--------|------|
```
```

- [ ] **Step 11: 提交所有资产**

```bash
git add assets/
git commit -m "feat: add sample assets (skills, commands, prompts)"
```

---

## Task 4: Claude Code 适配器实现

**Files:**
- Create: `adapters/claude-code/index.ts` - 主入口
- Create: `adapters/claude-code/loader.ts` - 资产加载器
- Create: `adapters/claude-code/installer.ts` - 安装逻辑
- Create: `tests/adapters/claude-code.test.ts` - 适配器测试

- [ ] **Step 1: 创建 adapters/claude-code/index.ts**

```typescript
import { Skill, Command, Prompt, Workflow, Asset } from '../../lib/schema.js';
import { loadAsset, loadAssetsFromDir } from './loader.js';
import { installToClaudeCode, uninstallFromClaudeCode } from './installer.js';

export class ClaudeCodeAdapter {
  private assetsPath: string;

  constructor(assetsPath: string) {
    this.assetsPath = assetsPath;
  }

  async loadSkills(domain?: string): Promise<Skill[]> {
    const dir = domain
      ? `${this.assetsPath}/skills/${domain}`
      : `${this.assetsPath}/skills`;
    return loadAssetsFromDir<Skill>(dir, 'skill');
  }

  async loadCommands(domain?: string): Promise<Command[]> {
    const dir = domain
      ? `${this.assetsPath}/commands/${domain}`
      : `${this.assetsPath}/commands`;
    return loadAssetsFromDir<Command>(dir, 'command');
  }

  async loadPrompts(domain?: string): Promise<Prompt[]> {
    const dir = domain
      ? `${this.assetsPath}/prompts/${domain}`
      : `${this.assetsPath}/prompts`;
    return loadAssetsFromDir<Prompt>(dir, 'prompt');
  }

  async install(): Promise<void> {
    await installToClaudeCode(this.assetsPath);
  }

  async uninstall(): Promise<void> {
    await uninstallFromClaudeCode();
  }
}

export default ClaudeCodeAdapter;
```

- [ ] **Step 2: 创建 adapters/claude-code/loader.ts**

```typescript
import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadAsset<T extends { name: string; type: string }>(
  filePath: string,
  type: string
): Promise<T | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = yaml.parse(content);

    if (!data || data.type !== type) {
      return null;
    }

    // Load markdown content if exists
    const mdPath = filePath.replace('.yaml', '.md');
    try {
      data.content = await readFile(mdPath, 'utf-8');
    } catch {
      // Markdown content is optional
    }

    return data as T;
  } catch (error) {
    console.error(`Failed to load asset from ${filePath}:`, error);
    return null;
  }
}

export async function loadAssetsFromDir<T extends { name: string; type: string }>(
  dirPath: string,
  type: string
): Promise<T[]> {
  const assets: T[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const yamlPath = join(dirPath, entry.name, `${entry.name}.yaml`);
        const asset = await loadAsset<T>(yamlPath, type);
        if (asset) {
          assets.push(asset);
        }
      }
    }
  } catch (error) {
    // Directory might not exist, return empty array
    console.error(`Failed to load assets from ${dirPath}:`, error);
  }

  return assets;
}
```

- [ ] **Step 3: 创建 adapters/claude-code/installer.ts**

```typescript
import { existsSync, mkdirSync, symlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CLAUDE_CODE_CONFIG_DIR = join(homedir(), '.claude');
const CLAUDE_CODE_SKILLS_DIR = join(CLAUDE_CODE_CONFIG_DIR, 'skills');

export async function installToClaudeCode(assetsPath: string): Promise<void> {
  // Ensure Claude Code config directory exists
  if (!existsSync(CLAUDE_CODE_CONFIG_DIR)) {
    mkdirSync(CLAUDE_CODE_CONFIG_DIR, { recursive: true });
  }

  // Install skills
  const skillsSource = join(assetsPath, 'skills');
  if (existsSync(skillsSource)) {
    // Create symlink or copy skills
    const targetDir = CLAUDE_CODE_SKILLS_DIR;

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Copy skill files
    await copyDirRecursive(skillsSource, targetDir);
  }

  console.log('Successfully installed assets to Claude Code');
}

export async function uninstallFromClaudeCode(): Promise<void> {
  if (existsSync(CLAUDE_CODE_SKILLS_DIR)) {
    // Remove installed skills
    const { rmSync } = await import('fs');
    rmSync(CLAUDE_CODE_SKILLS_DIR, { recursive: true, force: true });
  }

  console.log('Successfully uninstalled assets from Claude Code');
}

async function copyDirRecursive(src: string, dest: string): Promise<void> {
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export function getClaudeCodeSkillsDir(): string {
  return CLAUDE_CODE_SKILLS_DIR;
}
```

- [ ] **Step 4: 创建 tests/adapters/claude-code.test.ts**

```typescript
import { describe, expect, test, beforeEach } from '@jest/globals';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

describe('Claude Code Adapter', () => {
  const testAssetsDir = join(tmpdir(), 'danny-skill-test-assets');

  beforeEach(() => {
    // Setup test directory structure
    if (!existsSync(testAssetsDir)) {
      mkdirSync(testAssetsDir, { recursive: true });
    }
  });

  test('should create Claude Code adapter instance', async () => {
    const { ClaudeCodeAdapter } = await import('../adapters/claude-code/index.js');
    const adapter = new ClaudeCodeAdapter(testAssetsDir);
    expect(adapter).toBeDefined();
  });

  test('should load skills from directory', async () => {
    const { ClaudeCodeAdapter } = await import('../adapters/claude-code/index.js');
    const adapter = new ClaudeCodeAdapter(testAssetsDir);
    const skills = await adapter.loadSkills();
    expect(Array.isArray(skills)).toBe(true);
  });
});
```

- [ ] **Step 5: 运行测试验证**

```bash
npm run build
npm run test
```

- [ ] **Step 6: 提交适配器代码**

```bash
git add adapters/ tests/
git commit -m "feat: implement Claude Code adapter"
```

---

## Task 5: 安装脚本

**Files:**
- Create: `scripts/install.sh` - 主安装脚本
- Create: `scripts/detect-tools.sh` - 工具检测脚本

- [ ] **Step 1: 创建 scripts/detect-tools.sh**

```bash
#!/bin/bash
# detect-tools.sh - 检测已安装的 AI 编码工具

detect_claude_code() {
    if command -v claude &> /dev/null; then
        echo "claude-code:found"
        return 0
    else
        echo "claude-code:not-found"
        return 1
    fi
}

detect_cursor() {
    if [ -d "$HOME/AppData/Local/Cursor" ] || [ -d "/Applications/Cursor.app" ]; then
        echo "cursor:found"
        return 0
    else
        echo "cursor:not-found"
        return 1
    fi
}

detect_opencode() {
    if command -v opencode &> /dev/null; then
        echo "opencode:found"
        return 0
    else
        echo "opencode:not-found"
        return 1
    fi
}

# Main detection
echo "Detecting AI coding tools..."
echo "---"

detect_claude_code
detect_cursor
detect_opencode

echo "---"
echo "Detection complete"
```

- [ ] **Step 2: 创建 scripts/install.sh**

```bash
#!/bin/bash
# install.sh - danny-skill 安装脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  danny-skill Installer"
echo "============================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect tools
echo "Detecting installed AI coding tools..."
echo ""

detect_and_install() {
    local tool=$1
    local install_func=$2

    if command -v "$tool" &> /dev/null || [ -d "$HOME/.claude" ]; then
        echo -e "${GREEN}✓${NC} $tool detected"
        if [ "$AUTO_INSTALL" = "true" ]; then
            echo "  Installing assets..."
            eval "$install_func"
            echo -e "  ${GREEN}✓${NC} Installed"
        else
            read -p "  Install assets for $tool? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                eval "$install_func"
                echo -e "  ${GREEN}✓${NC} Installed"
            fi
        fi
    else
        echo -e "${YELLOW}○${NC} $tool not found, skipping"
    fi
}

install_claude_code() {
    local skills_dir="$HOME/.claude/skills"
    mkdir -p "$skills_dir"

    # Copy skills
    if [ -d "$PROJECT_ROOT/assets/skills" ]; then
        cp -r "$PROJECT_ROOT/assets/skills/"* "$skills_dir/"
    fi

    echo "  Claude Code skills installed to $skills_dir"
}

install_cursor() {
    # Cursor 配置路径: $HOME/.cursor/
    # Skills 目录: $HOME/.cursor/skills/
    echo "  [TODO] Cursor adapter not yet implemented"
    return 1
}

install_opencode() {
    # OpenCode 配置路径: $HOME/.config/opencode/
    # Plugins 目录: $HOME/.config/opencode/plugins/
    echo "  [TODO] OpenCode adapter not yet implemented"
    return 1
}

# Main installation flow
if [ "$1" = "-y" ] || [ "$1" = "--yes" ]; then
    AUTO_INSTALL="true"
    echo "Auto-install mode: will install to all detected tools"
    echo ""
else
    AUTO_INSTALL="false"
    echo "Interactive mode: will ask for confirmation"
    echo ""
fi

# Check for Node.js (required for TypeScript build)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js found: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js first."
    exit 1
fi

# Build TypeScript
echo ""
echo "Building project..."
cd "$PROJECT_ROOT"
if command -v npm &> /dev/null; then
    npm install
    npm run build
    echo -e "${GREEN}✓${NC} Build complete"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm first."
    exit 1
fi

echo ""
echo "Installing assets..."

detect_and_install "claude" "install_claude_code"
detect_and_install "cursor" "install_cursor"
detect_and_install "opencode" "install_opencode"

echo ""
echo "============================================"
echo -e "${GREEN}Installation complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Restart your AI coding tool"
echo "  2. Try /read to test read-code skill"
echo "  3. Check ~/.claude/skills/ for installed assets"
echo ""
```

- [ ] **Step 3: 设置脚本执行权限并提交**

```bash
chmod +x scripts/install.sh scripts/detect-tools.sh
git add scripts/
git commit -m "feat: add installation scripts"
```

---

## Task 6: CLAUDE.md 文件

**Files:**
- Create: `CLAUDE.md` - 项目指南

- [ ] **Step 1: 创建 CLAUDE.md**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

danny-skill 是团队 AI 技能共享中心，支持跨工具复用（Claude Code、Cursor、OpenCode、Codex、Codebuddy）。

## 常用命令

```bash
# 安装依赖
npm install

# 构建 TypeScript
npm run build

# 运行测试
npm test

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
```

- [ ] **Step 2: 提交 CLAUDE.md**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```

---

## 验证清单

完成所有任务后，执行以下验证：

```bash
# 1. 构建项目
npm run build

# 2. 运行测试
npm test

# 3. 检查安装脚本
./scripts/detect-tools.sh

# 4. 验证资产文件存在
ls -la assets/skills/common/read-code/
ls -la assets/commands/common/project-init/
ls -la assets/prompts/docs/api-doc-template/
```
