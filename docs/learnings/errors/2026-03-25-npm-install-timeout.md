## npm install 超时问题

**类型**: error
**日期**: 2026-03-25
**上下文**: 在中国网络环境执行 npm install

### 事件描述
执行 `npm install` 时网络超时，无法下载依赖包。

### 原因分析
- npm 官方源在中国访问速度慢
- 网络不稳定导致连接中断

### 经验/解决方案
- 使用 pnpm 替代 npm，速度更快
- 使用淘宝镜像：`npm config set registry https://registry.npmmirror.com`
- 或使用 nrm 管理多个源

### 相关标签
#nodejs #network #china #package-manager

### 下次行动
- [x] 优先使用 pnpm install
- [ ] 配置 npm 镜像源作为备选
