---
name: design-style
description: Use when selecting a website or UI visual direction, narrowing inspiration references, and generating scene-specific designs with critique-driven review
version: "1.0"
triggers: [design, style, ui, website, frontend, brand, visual, landing]
tags: [design, design-systems, ui, style, frontend]
supported_tools: [claude-code, codex, cursor, opencode]
---

# Design Style Workflow

## 概览

这个 skill 不再把自己当作“58 套设计目录”，而是一个用于生成设计的工作流。

- `references/designs/*/DESIGN.md` 中的 58 份品牌资料是**灵感输入**，不是官方 design system，也不保证能完整代表品牌实现细节。
- `references/designs/*/DESIGN.md` 需要 `full` profile（或本地完整镜像）才能直接读取；`standard` 安装默认依赖本文件、轻量 guides/assets 与用户提供的品牌线索；`minimal` 安装只能依赖本文件与用户提供的品牌/场景线索推进，不能提示读取未随包分发的文件。
- 使用时应只选择**最小相关子集**，优先 1 个主参考，必要时再补 1 到 2 个辅助参考，而不是一次加载整套目录。
- 先选风格，再选场景模板，再生成设计，最后做 checklist + critique。
- 生成工作的终点不是第一版代码或第一张图，而是完成自查并进入复评。

## 渐进加载

这个 skill 使用三级加载：

1. **Metadata**（约 100 词）：上方 `name` + `description`，始终在上下文中。
2. **SKILL.md body**（少于 5k 词）：当前文件，触发时加载。
3. **Bundled resources**：按 profile 按需加载。`full` 可额外读取 `references/designs/*/DESIGN.md`；`standard` 可读取 `assets/preview.html`、`assets/output-checklist.md`、`assets/test-prompts.json`、`references/style-selection-guide.md`、`references/scene-templates.md`、`references/critique-guide.md`；`minimal` 默认只使用当前 `SKILL.md`（以及若存在的配置），不应提示读取其他未分发文件。

## 触发模式

用户提到以下内容时激活：

- 具体网站或品牌参考："make it look like Vercel"、"参照 Airbnb"
- 风格方向不明确："给我几个科技产品风格"、"something premium but warm"
- 明确要产出界面："做一个 dashboard"、"create a landing page like Linear"
- 需要设计复盘："这个页面为什么没有品牌感"、"帮我 critique 一下这个方案"

## 四步工作流

### 步骤 1：选择风格

先判断用户是在指定品牌、指定气质，还是只表达了业务目标。

- 用户明确点名品牌时：若当前是 `full` profile，优先加载对应 `references/designs/<brand>/DESIGN.md`；若是 `standard`，先根据用户描述提炼品牌气质、产品类型与视觉关键词，再用 `references/style-selection-guide.md` 找最接近的替代风格；若是 `minimal`，只根据用户提供的品牌线索提炼气质与视觉关键词，不要提示读取未分发的 guide。
- 用户只描述气质或目标时：`standard` 先读 `references/style-selection-guide.md`，把意图映射到少量候选风格；`minimal` 则直接在当前回复中给出少量候选风格，并明确这些候选只基于用户提供的线索与本文件工作流。
- 只保留最小相关参考集；除非确有必要，不要并列加载多个风格相近的品牌。
- 把品牌资料当作灵感样本，而不是必须逐项复制的官方规范。

### 步骤 2：选择场景模板

风格确定后，先选输出场景，再开始生成。

- `standard` 生成前先读 `references/scene-templates.md`；`minimal` 则直接根据用户给出的页面类型、信息结构与目标设备，在当前回复里补齐场景假设，不要提示读取未分发模板文件。
- 在 `landing page`、`product page`、`dashboard`、`mobile app screen`、`presentation / one-pager` 等模板中选最匹配的一个。
- 优先让场景模板决定版式结构、信息密度和组件优先级，再让风格参考决定视觉语言。
- 如果用户还没说明输出形态，不要直接开始写代码，先补足场景模板选择。

### 步骤 3：生成设计

生成阶段要同时继承“场景模板”与“最小参考集”。

- 从场景模板确定页面骨架、必需区块和信息节奏。
- 从品牌资料提取有限的视觉信号，例如色彩气质、排版倾向、留白方式、组件边界感和交互语气。
- 避免把多个品牌的表层元素机械拼贴在一起。
- 第一版输出后不要立刻结束；`standard` 先用 `assets/output-checklist.md` 做自查，再决定是否进入下一轮；`minimal` 则用本文件中的工作流要求做简化自查，不要提示读取未分发 checklist。

### 步骤 4：使用 critique-guide 复评

复评是工作流的一部分，不是可选附加项。

- 生成完成后，`standard` 使用 `references/critique-guide.md` 检查风格一致性、视觉层级、信息密度、组件细节和品牌辨识度；`minimal` 则直接按这些维度在当前回复中做文字复评，不要提示读取未分发 critique guide。
- critique 目标是指出该保留什么、该修改什么、下一轮该集中修什么。
- 如果需要对比多个方向，按同一 rubric 逐个复评，而不是凭印象选方案。
- 只有完成 checklist + critique，当前轮设计才算结束。

## 资源使用顺序

1. `full`：可按需深入 `references/designs/*/DESIGN.md`
2. `standard`：不明确风格时先读 `references/style-selection-guide.md`，不明确输出形态时再读 `references/scene-templates.md`
3. `standard`：生成完成后用 `assets/output-checklist.md` 自查，需要复盘或比较方案时用 `references/critique-guide.md`
4. `minimal`：只使用当前 `SKILL.md` 与用户提供的品牌/场景线索，不要提示读取任何未分发资源

## 仓库内资源

- `full`：按需深入品牌资料，只加载必要的 `references/designs/*/DESIGN.md`
- `standard`：浏览灵感可打开 `assets/preview.html`
- `standard`：映射风格意图时阅读 `references/style-selection-guide.md`
- `standard`：确认场景模板时在生成前阅读 `references/scene-templates.md`
- `standard`：手动回归检查时按 `assets/test-prompts.json` 中的 prompts 执行
- `minimal`：默认只使用当前 `SKILL.md`，其余品牌感、场景结构与复评维度都直接从用户线索中提炼

## 使用提示

- 如果用户说“像某品牌”，优先给出该品牌作为主参考，并说明是否需要补充一个辅助参考来平衡场景需求。
- 如果当前不是 `full` profile，遇到“像某品牌”时不要卡住；`standard` 可先说明品牌资料包可能未安装，再基于已知品牌特征、场景模板和少量替代风格继续推进；`minimal` 则只基于用户提供的品牌/场景线索与本文件工作流继续推进。
- 如果用户说“给我几个方向”，先收敛到 2 到 3 个风格候选，再选一个场景模板继续。
- 如果用户已经给了线框或结构要求，仍然要先匹配场景模板，再决定视觉表达。
- 如果第一版已经能运行，也不要把它当成终点；这个 skill 默认要求完成 checklist 和 critique 再收束。
