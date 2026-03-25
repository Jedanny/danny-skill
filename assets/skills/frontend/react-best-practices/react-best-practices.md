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
