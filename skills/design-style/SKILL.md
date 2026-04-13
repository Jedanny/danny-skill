---
name: design-style
description: Use when generating website or UI designs, selecting visual styles, matching a known brand aesthetic, or referencing a specific website design system
version: "1.0"
triggers: [design, style, ui, website, frontend, brand, visual, landing]
tags: [design, design-systems, ui, style, frontend]
supported_tools: [claude-code, codex, cursor, opencode]
---

> **Design Reference Source**: [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) by [VoltAgent](https://github.com/VoltAgent)

# Design Style Matcher

## Overview

Match any website's design style from a curated collection of 58 design systems. Provides pixel-perfect UI generation via structured design tokens, color palettes, typography rules, and component patterns.

## Progressive Disclosure

This skill uses three-level loading:

1. **Metadata** (~100 words): `name` + `description` above — always in context
2. **SKILL.md body** (<5k words): This file — loaded when triggered
3. **Bundled resources**: `references/designs/*.md` and `assets/preview.html` — loaded as needed

## Trigger Patterns

Activate when user mentions:

- A specific website: "make it look like Vercel", "参照 Airbnb"
- Design style request: "minimal dark theme", "科技感风格"
- UI generation: "create a landing page like Linear"
- Pattern matching: "give me Stripe's checkout style"

## Usage Modes

### Mode 1: Direct Specification

```
User: "make it look like Stripe"
→ Load references/designs/stripe/DESIGN.md
```

### Mode 2: Interactive Selection

```
User: "show me some design options"
→ Open assets/preview.html for visual browsing
```

### Mode 3: Category Filter

```
User: "something minimal and developer-focused"
→ Filter by "Developer Tools" → present options
```

## Workflow

### Step 1: Identify Intent

| User Input | Interpretation |
|------------|---------------|
| "like Vercel" | Direct spec → load vercel |
| "show options" | Browse mode → open preview.html |
| "minimal dark" | Category filter → minimal/dark designs |
| "playful" | Category filter → colorful/creative |

### Step 2: Extract Design Tokens

From loaded DESIGN.md:

- **Colors**: Primary, secondary, accent with hex codes
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: 4px base grid scale
- **Components**: Button, card, input, navigation patterns
- **Shadows**: Elevation system with exact values
- **Border Radius**: Consistent rounding values

### Step 3: Apply to Generation

Use tokens to generate code with:

- Exact color codes from palette
- Specified font stacks
- Documented component structures
- Defined spacing scale
- Shadow/elevation values

## Categories

| Category | Count | Brands |
|----------|-------|--------|
| AI/ML | 12 | anthropic, openai, midjourney, character.ai, cohere, elevenlabs, minimax, mistral.ai, ollama, replicate, together.ai, x.ai |
| Developer Tools | 16 | vercel, linear, raycast, fig, sentry, hashicorp, expo, clickhouse, mongodb, supabase, sanity, resend, mintlify, lovable, opencode.ai, voltagent |
| Design & Productivity | 13 | figma, framer, webflow, cal, miro, notion, cursor, superhuman, posthog, intercom, zapier, airtable, composio |
| Fintech | 5 | stripe, coinbase, kraken, revolut, wise |
| Enterprise | 4 | ibm, spacex, nvidia, uber |
| Car Brands | 5 | tesla, bmw, ferrari, lamborghini, renault |
| Consumer | 8 | airbnb, apple, pinterest, spotify, runwayml |

## Quick Reference

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

## Web Preview

Open `assets/preview.html` for:

- Visual gallery of all 58 designs
- Category filtering
- Dark/light mode toggle
- Color palette extraction
- "Use This Style" action

## CLI Tool

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
