# Skill Manifest Spec

`config.yaml` 是 danny-skill 的机器可读 skill manifest。它不替代 `SKILL.md`，而是补充 profile 分发、结构校验和文档摘要等声明性信息。

设计原则：

- `SKILL.md` 负责给 Agent 看执行工作流。
- `config.yaml` 负责给 CLI、测试和未来自动化看分发与契约。
- README 负责给人看索引与来源，不定义运行时真相。
- 不要在代码里写死 skill 名特判来表达 profile 差异。

## 最小结构

每个 `config.yaml` 至少包含以下顶层字段：

```yaml
version: 1

runtime:
  kind: "workflow"
  profile_behavior:
    minimal: ""
    standard: ""
    full: ""

packaging:
  minimal:
    include: []
  standard:
    include: []
  full:
    include: []

validation:
  required_files: []
  markdown_contracts: []

docs:
  summary: ""
  artifacts: []
```

允许在此基础上叠加 skill 专属配置，例如 `self-improvement` 的 `learning`、`retrieval`、`capture`、`retention`。

## 字段含义

### `version`

- 当前固定为 `1`
- 表示 manifest schema 版本，不表示 skill 内容版本

### `runtime`

描述这个 skill 的运行语义。

```yaml
runtime:
  kind: "workflow"
  profile_behavior:
    minimal: "Use SKILL.md only"
    standard: "Use lightweight guides/assets"
    full: "Use complete skill directory"
```

推荐 `kind`：

- `workflow`
- `capture`
- `distill`
- `eval`
- `guardrail`
- `router`

### `packaging`

定义 `minimal` / `standard` / `full` 三档实际分发哪些文件。

```yaml
packaging:
  minimal:
    include:
      - "SKILL.md"
      - "config.yaml"
  standard:
    include:
      - "SKILL.md"
      - "config.yaml"
      - "references/example.md"
  full:
    include:
      - "**"
```

规则：

- 路径相对 skill 根目录
- 当前只要求支持：
  - 普通相对路径
  - `"**"` 表示整个 skill 目录
- `minimal` 和 `standard` 应尽量显式列出文件
- `full` 优先使用 `"**"`

### `validation`

定义测试应如何校验这个 skill。

```yaml
validation:
  required_files:
    - "SKILL.md"
    - "references/example.md"
  json_files:
    - "assets/example.json"
  markdown_contracts:
    - path: "references/example.md"
      must_contain:
        - "## Section A"
        - "## Section B"
```

说明：

- `required_files`：必须存在的文件
- `json_files`：必须能被 JSON parse 的文件
- `markdown_contracts`：必须包含的 markdown 标题或关键短语

### `docs`

为 README、CLI help 或未来文档生成保留的摘要信息。

```yaml
docs:
  summary: "Short human-readable summary"
  artifacts:
    - "config.yaml"
    - "references/example.md"
```

说明：

- `summary`：一行摘要
- `artifacts`：主要产物列表
- 这些字段不参与运行时逻辑

## Profile 设计约束

- `minimal` 必须自洽，不能引用未分发文件
- `standard` 是默认团队包，应该覆盖日常使用的轻量资源
- `full` 允许包含大型资源包，但不应改变 skill 的基本工作流，只扩大可用材料

## 迁移规则

旧 skill 迁移到 manifest 时：

1. 保留原有 `SKILL.md` 行为描述
2. 新增或扩展 `config.yaml`
3. 先把 profile 规则写入 `packaging`
4. 再把关键资源写入 `validation`
5. 最后删除 CLI 中对应 skill 的硬编码特判

## 反模式

- 在 `SKILL.md` 中写 profile 真相，同时在 CLI 里写另一份不同规则
- 用 skill 名字特判分发逻辑
- 只校验文件存在，不校验 JSON/markdown 结构
- 让 `minimal` 指向未打包资源
- 把外部来源链接写回 `SKILL.md`
