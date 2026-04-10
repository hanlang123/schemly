# DataTable

DataTable 是最常用的 Type，用于展示和操作表格数据。

## 完整 props 结构

```json
{
  "type": "DataTable",
  "props": {
    "columns": [ ... ],
    "pagination": { ... },
    "selection": { ... },
    "toolbarActions": [ ... ],
    "rowActions": [ ... ],
    "rowActionStyle": { ... },
    "createForm": { ... },
    "updateForm": { ... }
  }
}
```

## columns

每一项为 Cell 声明 + 可选的 column 配置：

```json
{
  "columns": [
    {
      "key": "orderNo",
      "label": "订单号",
      "cell": "text",
      "displayAs": "copy",
      "column": { "width": 180, "fixed": "left" }
    },
    {
      "key": "amount",
      "label": "金额",
      "cell": "currency",
      "column": { "sortable": true, "align": "right" },
      "permission": { "view": true, "edit": "order:amount:edit" }
    },
    {
      "key": "status",
      "label": "状态",
      "cell": "enum",
      "cellProps": { "options": "dict:orderStatus" },
      "displayAs": "tag"
    }
  ]
}
```

### column 配置字段

| column 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | number | — | 固定列宽（px） |
| `minWidth` | number | — | 最小列宽（px） |
| `fixed` | `"left"` / `"right"` | — | 固定列 |
| `align` | `"left"` / `"center"` / `"right"` | `"left"` | 对齐方式 |
| `sortable` | boolean | `false` | 是否支持列头排序 |
| `resizable` | boolean | `true` | 是否可拖拽调整列宽 |
| `showOverflowTooltip` | boolean | `true` | 溢出时 tooltip |

不声明 `column` 时使用全部默认值。排序不在 Schema 中处理逻辑，用户点击排序时触发 `@sort-change` 事件，业务代码重新请求数据。

## pagination

```json
{
  "pagination": {
    "enabled": true,
    "pageSize": 20,
    "pageSizes": [10, 20, 50, 100],
    "layout": "total, sizes, prev, pager, next, jumper"
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 是否启用分页 |
| `pageSize` | number | `20` | 默认每页条数 |
| `pageSizes` | number[] | `[10, 20, 50, 100]` | 可选每页条数 |
| `layout` | string | `"total, sizes, prev, pager, next, jumper"` | 分页组件布局 |

::: tip 简写
`"pagination": true` 等价于 `{ "enabled": true }` 使用全部默认值；`"pagination": false` 或不声明则不显示分页。
:::

## selection（多选与批量操作）

```json
{
  "selection": {
    "enabled": true,
    "rowKey": "id",
    "selectable": true
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `false` | 是否显示 checkbox 列 |
| `rowKey` | string | `"id"` | 行数据唯一标识字段 |
| `selectable` | boolean / string | `true` | `true` = 所有行可选，`string` = 权限码 |

行级可选控制通过 `actionControl` 的 `_selection` key：

```javascript
actionControl: (row) => ({
  _selection: row.status !== 'locked'
})
```

## toolbarActions

```json
{
  "toolbarActions": [
    { "key": "create", "label": "新增", "permission": "order:create", "trigger": "createForm" },
    { "key": "batchDelete", "label": "批量删除", "permission": "order:delete", "batch": true, "confirm": "确认删除选中的订单？" },
    { "key": "export", "label": "导出", "permission": "order:export" }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 操作标识 |
| `label` | string | 按钮文字 |
| `permission` | string | 权限标识（可选） |
| `trigger` | string | 指向内部功能 `createForm` / `updateForm`（可选） |
| `batch` | boolean | 是否为批量操作，`true` 时无选中行自动禁用（默认 `false`） |
| `confirm` | string | 二次确认文案（可选） |
| `icon` | string | 按钮图标（可选） |

## rowActions

```json
{
  "rowActions": [
    { "key": "view", "label": "查看", "permission": "order:view" },
    { "key": "edit", "label": "编辑", "permission": "order:edit", "trigger": "updateForm" },
    { "key": "delete", "label": "删除", "permission": "order:delete", "danger": true, "confirm": "确认删除？" }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 操作标识 |
| `label` | string | 按钮文字 |
| `permission` | string | 权限标识（可选） |
| `trigger` | string | 指向内部功能（可选） |
| `confirm` | string | 二次确认文案（可选） |
| `danger` | boolean | 危险操作标红（默认 `false`） |
| `icon` | string | 按钮图标（可选） |

## rowActionStyle

```json
{
  "rowActionStyle": {
    "type": "link",
    "maxVisible": 3,
    "moreText": "更多"
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `"link"` / `"button"` | `"link"` | 操作按钮样式 |
| `maxVisible` | number | `3` | 最多显示几个，超出折叠为下拉菜单 |
| `moreText` | string | `"更多"` | 折叠按钮文字 |

## 行级操作动态控制（actionControl）

通过 `providers.actionControl` 注入，根据行数据动态控制按钮显隐：

```javascript
providers = {
  actionControl: (row) => ({
    edit: row.status !== 'done',
    delete: row.createdBy === currentUser.id ? true : 'disabled',
    _selection: row.status !== 'locked'
  })
}
```

| 返回值 | 行为 |
|---|---|
| `true` | 正常显示 |
| `false` | 隐藏 |
| `"disabled"` | 显示但禁用 |
| 未返回某个 key | 不受影响，正常显示 |

判定流程：`permission`（全局门槛）→ `actionControl`（行级门槛），两道都通过才显示。

`toolbarActions` 的动态控制通过 `providers.toolbarControl`（可选）：

```javascript
providers = {
  toolbarControl: () => ({
    batchDelete: selectedRows.length > 0
  })
}
```

## createForm

```json
{
  "createForm": {
    "title": "新增订单",
    "width": "600px",
    "closeConfirm": true,
    "keepAfterSubmit": false,
    "layout": {
      "columns": 2,
      "labelWidth": "100px",
      "labelPosition": "right"
    },
    "fields": ["customer", "amount", "status", "remark"],
    "overrides": {
      "amount": { "permission": { "edit": true } },
      "remark": { "span": 2 }
    },
    "rules": {
      "customer": [{ "required": true, "message": "请选择客户" }],
      "amount": [{ "required": true, "message": "请输入金额" }]
    }
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | — | 弹窗标题 |
| `width` | string | `"600px"` | 弹窗宽度 |
| `closeConfirm` | boolean | `true` | 有修改时关闭是否弹确认 |
| `keepAfterSubmit` | boolean | `false` | 提交成功后保持弹窗（适合连续新增） |
| `layout` | object | — | 表单布局（见下） |
| `fields` | string[] | — | 引用 columns 中的 key |
| `overrides` | object | — | 按 key 覆盖 Cell 属性 |
| `rules` | object | — | 表单校验规则 |

### layout 字段

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `columns` | number | `1` | 每行几列 |
| `labelWidth` | string | `"auto"` | label 宽度 |
| `labelPosition` | `"left"` / `"right"` / `"top"` | `"right"` | label 位置 |

### overrides 可覆盖字段

| 字段 | 说明 |
|------|------|
| `disabled` | 强制禁用 |
| `visible` | `false` 时不出现在表单中 |
| `cell` | 覆盖数据类型 |
| `cellProps` | 合并覆盖（浅合并） |
| `editAs` | 覆盖编辑渲染器 |
| `permission` | 覆盖权限声明 |
| `defaultValue` | 默认值 |
| `span` | 占据列数（配合 `layout.columns`） |

## updateForm

结构与 `createForm` 一致，区别：

- Runtime 用当前行数据回填表单
- 提交时触发 `@updateSubmit`，payload 含 `{ values, row }`
- `keepAfterSubmit` 在 updateForm 中无效

## rules 校验

```json
{
  "rules": {
    "phone": [
      { "required": true, "message": "请输入手机号" },
      { "pattern": "^1[3-9]\\d{9}$", "message": "手机号格式不正确" }
    ],
    "name": [
      { "required": true, "message": "请输入姓名" },
      { "min": 2, "max": 20, "message": "长度 2-20 个字符" }
    ],
    "email": [
      { "type": "email", "message": "邮箱格式不正确" }
    ],
    "amount": [
      { "validator": "validateAmount", "message": "金额不合法" }
    ]
  }
}
```

| rule 字段 | 类型 | 说明 |
|---|---|---|
| `required` | boolean | 必填 |
| `pattern` | string | 正则表达式（字符串形式） |
| `min` | number | 最小长度（字符串）或最小值（数字） |
| `max` | number | 最大长度或最大值 |
| `type` | string | 内置类型校验：email / url / number |
| `validator` | string | 自定义校验函数 key，从 `providers.functions` 中查找 |
| `message` | string | 校验失败提示 |
| `trigger` | string | 触发时机：`blur` / `change`（默认 `blur`） |
