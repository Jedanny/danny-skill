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
