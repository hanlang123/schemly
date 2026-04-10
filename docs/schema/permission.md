# 权限体系

## 三级权限模型

| 层级 | 作用范围 | 声明位置 | 无权限行为 |
|------|----------|----------|------------|
| Type 级 | 整个组件 | `schema.permission` | 不渲染组件，触发 `@denied` |
| Action 级 | 操作按钮 | `rowActions` / `toolbarActions` 的 `permission` | 不渲染按钮 |
| Cell 级 | 单个字段 | Cell 声明的 `permission` | view 无权限：不渲染；edit 无权限：降级为 display |

## Cell 级权限声明

```json
{
  "key": "amount",
  "label": "金额",
  "cell": "currency",
  "permission": { "view": true, "edit": "order:amount:edit" }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `view` | string / boolean | `true` | `true` = 所有人可见，`string` = 权限标识 |
| `edit` | string / boolean | `true` | `true` = 所有人可编辑，`string` = 权限标识 |

不声明 `permission` 等同于 `{ view: true, edit: true }`。

**简写：** `"permission": "code"` 等价于 `{ "view": "code", "edit": "code" }`。

## 权限判定流程

### Type 级

```
schema.permission 存在？
├── 否 → 正常渲染
└── 是 → hasPermission(code)
    ├── true → 正常渲染
    └── false → 不渲染，触发 @denied
```

### Cell 级（display 模式）

```
permission.view？
├── 未声明或 true → 正常渲染
└── string → hasPermission(code) → true: 渲染 / false: 不渲染该列
```

### Cell 级（edit 模式）

```
permission.view？
├── 无权限 → 不渲染
└── 有权限 → permission.edit？
    ├── 未声明或 true → 可编辑
    └── string → hasPermission(code) → true: 可编辑 / false: 降级为 display
```

### Action 级

```
action.permission → hasPermission(code) → true: 渲染 / false: 不渲染
```

## 表单中的权限覆盖

`createForm` / `updateForm` 的 `overrides` 中可覆盖 Cell 原始 `permission`，优先级：**form overrides > Cell 原始声明**。

```json
{
  "createForm": { "overrides": { "amount": { "permission": { "edit": true } } } },
  "updateForm": { "overrides": { "amount": { "permission": { "edit": "order:amount:edit" } } } }
}
```

## 权限注入

```javascript
providers = {
  auth: {
    hasPermission: (code) => currentUser.permissions.includes(code)
  }
}
```
