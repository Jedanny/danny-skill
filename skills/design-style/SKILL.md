---
name: design-style
description: Use when generating website or UI designs, selecting visual styles, matching a known brand aesthetic, or referencing a specific website design system
version: "1.0"
triggers: [design, style, ui, website, frontend, brand, visual, landing]
tags: [design, design-systems, ui, style, frontend]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Design Style Matcher

## 概览

从 58 套精选设计系统中匹配网站设计风格。通过结构化 design tokens、色板、排版规则和组件模式，为 UI 生成提供风格依据。

## 渐进加载

这个 skill 使用三级加载：

1. **Metadata**（约 100 词）：上方 `name` + `description`，始终在上下文中。
2. **SKILL.md body**（少于 5k 词）：当前文件，触发时加载。
3. **Bundled resources**：`references/designs/*.md` 和 `assets/preview.html`，按需加载。

## 触发模式

用户提到以下内容时激活：

- 具体网站："make it look like Vercel"、"参照 Airbnb"
- 设计风格请求："minimal dark theme"、"科技感风格"
- UI 生成："create a landing page like Linear"
- 模式匹配："give me Stripe's checkout style"

## 使用模式

### 模式 1：直接指定

```
User: "make it look like Stripe"
→ Load references/designs/stripe/DESIGN.md
```

### 模式 2：交互选择

```
User: "show me some design options"
→ Open assets/preview.html for visual browsing
```

### 模式 3：按类别筛选

```
User: "something minimal and developer-focused"
→ Filter by "Developer Tools" → present options
```

## 流程

### 步骤 1：识别意图

| User Input | Interpretation |
|------------|---------------|
| "like Vercel" | Direct spec → load vercel |
| "show options" | Browse mode → open preview.html |
| "minimal dark" | Category filter → minimal/dark designs |
| "playful" | Category filter → colorful/creative |

### 步骤 2：提取 Design Tokens

从加载的 `DESIGN.md` 中提取：

- **Colors**：primary、secondary、accent 及 hex codes。
- **Typography**：font families、sizes、weights、line heights。
- **Spacing**：4px base grid scale。
- **Components**：button、card、input、navigation patterns。
- **Shadows**：带精确值的 elevation system。
- **Border Radius**：一致的圆角值。

### 步骤 3：应用到生成

生成代码时使用这些 tokens：

- 色板中的精确颜色值。
- 指定 font stacks。
- 已记录的组件结构。
- 已定义的 spacing scale。
- shadow/elevation values。

## 分类

| Category | Count | Brands |
|----------|-------|--------|
| AI/ML | 12 | anthropic, openai, midjourney, character.ai, cohere, elevenlabs, minimax, mistral.ai, ollama, replicate, together.ai, x.ai |
| Developer Tools | 16 | vercel, linear, raycast, fig, sentry, hashicorp, expo, clickhouse, mongodb, supabase, sanity, resend, mintlify, lovable, opencode.ai, voltagent |
| Design & Productivity | 13 | figma, framer, webflow, cal, miro, notion, cursor, superhuman, posthog, intercom, zapier, airtable, composio |
| Fintech | 5 | stripe, coinbase, kraken, revolut, wise |
| Enterprise | 4 | ibm, spacex, nvidia, uber |
| Car Brands | 5 | tesla, bmw, ferrari, lamborghini, renault |
| Consumer | 8 | airbnb, apple, pinterest, spotify, runwayml |

## 快速参考

| Brand | Key Trait | Primary Colors |
|-------|-----------|----------------|
| Vercel | Minimal, developer | #171717, #ffffff |
| Stripe | Clean, trustworthy | #635bff, #0a2540 |
| Linear | Precise, dark | #1e1e1e, #10b981 |
| Airbnb | Warm, friendly | #ff385c, #00a699 |
| Anthropic | Calm, AI | #c7a0ff, #161b22 |
| Notion | Clean, productive | #ffffff, #000000 |
| Figma | Creative, modern | #000000, #a259ff |
| Tesla | Minimal, premium | #000000, #ffffff |

## Web 预览

打开 `assets/preview.html` 可用于：

- 浏览 58 套设计的视觉 gallery。
- 按 category 过滤。
- 切换 dark/light mode。
- 提取 color palette。
- 使用 "Use This Style" action。

## CLI 工具

```bash
# List all designs
design-style list

# Get specific design
design-style get vercel

# Open preview
design-style preview

# Validate skill
design-style validate
```
