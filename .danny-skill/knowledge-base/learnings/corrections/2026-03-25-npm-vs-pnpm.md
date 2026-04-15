## 包管理器选择纠正

**类型**: correction
**日期**: 2026-03-25
**上下文**: 用户纠正包管理器使用习惯

### 事件描述
用户指出应该优先使用 pnpm 而不是 npm。

### 原因分析
- pnpm 速度快、节省磁盘空间
- 中国网络环境对 pnpm 支持更好

### 经验/解决方案
- 优先使用 `pnpm` 作为包管理器
- 只有 pnpm 不可用时才使用 npm
- yarn 已基本废弃

### 相关标签
#nodejs #package-manager #best-practice

### 下次行动
- [x] 更新项目文档使用 pnpm
- [ ] 记住中国环境首选 pnpm
