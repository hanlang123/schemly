# 顶层结构

每份 Schema 描述一个组件实例的完整展示行为，顶层结构如下：

```json
{
  "version": "1.0",
  "id": "order-table",
  "name": "订单列表",
  "type": "DataTable",
  "permission": "order:list:view",
  "dicts": { ... },
  "externalDeps": { ... },
  "props": { ... }
}
```

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | ✅ | 协议版本号，格式 `major.minor`，用于迁移（详见 [版本迁移](/advanced/migration)） |
| `id` | string | ✅ | Schema 唯一标识 |
| `name` | string | ✅ | 可读名称，Designer 中展示用 |
| `type` | string | ✅ | 渲染类型：`DataTable` / `Form` / `Descriptions` |
| `permission` | string | ❌ | Type 级权限标识，无权限时整个组件不渲染 |
| `dicts` | object | ❌ | Designer 预配置的静态字典 |
| `externalDeps` | object | ❌ | 外部依赖声明（Designer 自动生成） |
| `props` | object | ✅ | 组件配置，结构由 `type` 决定 |

## Type 类型

Schemly 支持三种布局容器类型：

| Type | 用途 | 数据类型 | 详细文档 |
|------|------|---------|---------|
| `DataTable` | 数据表格，支持增删改查 | `array` | [DataTable 协议](/types/data-table) |
| `Form` | 通用表单（搜索、筛选、编辑） | `object` | [Form 协议](/types/form) |
| `Descriptions` | 描述列表（详情展示） | `object` | [Descriptions 协议](/types/descriptions) |

## 关键设计

- **Schema 纯展示描述**：不包含请求逻辑、路由逻辑，数据由 Runtime props 传入
- **`props` 结构由 `type` 决定**：不同 Type 有不同的 props 字段集
- **`externalDeps` 自动生成**：Designer 保存时自动扫描依赖，业务方无需手写
