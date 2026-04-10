# 外部依赖声明（externalDeps）

## 作用

Designer 保存时自动扫描生成的依赖清单。业务方看 `externalDeps` 即知需要在 `providers` 中注入什么。

## 结构

```json
{
  "externalDeps": {
    "dicts": ["roleList"],
    "functions": [
      { "key": "fetchDeptList", "type": "api", "description": "获取部门列表" },
      { "key": "searchUser", "type": "remote", "description": "搜索用户" },
      { "key": "uploadImage", "type": "upload:image", "description": "上传图片" },
      { "key": "uploadFile", "type": "upload:file", "description": "上传文件" },
      { "key": "validateAmount", "type": "validator", "description": "金额校验" }
    ],
    "permissions": [
      { "code": "order:list:view", "name": "查看订单列表", "scope": "type", "target": "order-table" },
      { "code": "order:amount:edit", "name": "编辑订单金额", "scope": "cell:edit", "target": "amount" },
      { "code": "order:edit", "name": "编辑订单", "scope": "action", "target": "edit" }
    ]
  }
}
```

### 顶层字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `dicts` | string[] | `schema.dicts` 中未包含但被 `dict:xxx` 引用的字典 key |
| `functions` | FunctionDep[] | 所有需要注入的函数 |
| `permissions` | PermissionDep[] | 所有权限码 |

### function 项

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 函数标识，对应 `providers.functions` 中的 key |
| `type` | string | `api` / `remote` / `upload:image` / `upload:file` / `validator` |
| `description` | string | 可读描述 |

### type 与签名对应关系

| type | 签名 | 调用时机 |
|------|------|----------|
| `api` | `() => Promise<Array>` | 组件挂载时调一次并缓存 |
| `remote` | `(query: string) => Promise<Array>` | 用户输入时实时调用 |
| `upload:image` | `(file: File) => Promise<string>` | 图片上传，返回 URL |
| `upload:file` | `(file: File) => Promise<{ name, url, size }>` | 文件上传，返回文件信息 |
| `validator` | `(rule, value, callback) => void` | 表单校验时调用 |

### permission 项

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | string | 权限码 |
| `name` | string | 可读描述 |
| `scope` | string | `type` / `cell:view` / `cell:edit` / `action` |
| `target` | string | schema id / cell key / action key |

## 自动生成规则

```
扫描范围：
├── schema.permission（Type 级）
├── columns[]/fields[]/items[].permission（Cell 级）
├── columns[]/fields[]/items[].cellProps.options（api: / remote: 前缀）
├── columns[]/fields[]/items[].cell（image → uploadImage；file → uploadFile；或读 cellProps.uploadFn）
├── rowActions[].permission / toolbarActions[].permission（Action 级）
├── createForm/updateForm.overrides.*.permission（表单覆盖）
└── createForm/updateForm.rules.*.validator（自定义校验函数）
```

## 使用场景

- **开发时对照**：看 `externalDeps` 就知道 `providers` 里注入什么
- **Runtime 校验**：开发模式自动比对，缺失时警告
- **与后端同步**：`permissions` 导出给后端权限系统
