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
