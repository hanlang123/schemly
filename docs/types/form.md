# Form

Form 是通用表单容器，适用于搜索、筛选、独立编辑等任何表单场景。所有 Cell 强制 edit 模式。

## 完整示例

```json
{
  "version": "1.0",
  "id": "order-form",
  "name": "订单表单",
  "type": "Form",
  "dicts": { ... },
  "props": {
    "layout": {
      "columns": 2,
      "labelWidth": "100px",
      "labelPosition": "right"
    },
    "fields": [
      {
        "key": "orderNo", "label": "订单号", "cell": "text",
        "disabled": true
      },
      {
        "key": "amount", "label": "金额", "cell": "currency",
        "rules": [{ "required": true, "message": "请输入金额" }]
      },
      {
        "key": "status", "label": "状态", "cell": "enum",
        "cellProps": { "options": "dict:orderStatus" }
      },
      {
        "key": "remark", "label": "备注", "cell": "text",
        "editAs": "textarea", "span": 2
      }
    ],
    "buttons": {
      "submitText": "提交",
      "resetText": "重置",
      "showReset": true
    }
  }
}
```

## layout

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `columns` | number | `1` | 每行几列 |
| `labelWidth` | string | `"auto"` | label 宽度 |
| `labelPosition` | `"left"` / `"right"` / `"top"` | `"right"` | label 位置 |
| `collapsible` | boolean | `false` | 是否支持展开/收起（搜索场景常用） |
| `defaultCollapsed` | boolean | `true` | 默认是否收起 |
| `visibleRows` | number | `1` | 收起时显示几行 |

## fields

每一项为 Cell 声明 + 表单扩展字段：

| 扩展字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `rules` | array | — | 校验规则 |
| `defaultValue` | any | — | 默认值 |
| `visible` | boolean | `true` | 是否显示 |
| `disabled` | boolean | `false` | 是否禁用 |
| `span` | number | `1` | 占据列数 |

## buttons

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `submitText` | string | `"提交"` | 提交按钮文字 |
| `resetText` | string | `"重置"` | 重置按钮文字 |
| `showReset` | boolean | `true` | 是否显示重置按钮 |

## 与 DataTable 内表单的区别

| | DataTable 内的表单 | 独立 Form |
|---|---|---|
| 存在位置 | DataTable schema 的 props 内部 | 独立的 Schema |
| 字段来源 | 引用 columns 的 key | 自己定义 fields |
| 渲染方式 | Dialog 弹窗 | 直接渲染在页面中 |
| 数据回填 | Runtime 自动用行数据回填 | 业务方通过 data prop 传入 |
| 用途 | 行编辑/新增 | 搜索、筛选、独立编辑、设置面板等 |

## 使用示例

```vue
<!-- 搜索表单 -->
<SchemlyRenderer
  :schema="searchSchema"
  :providers="providers"
  @submit="onSearch"
  @reset="onReset"
/>

<!-- 独立编辑表单 -->
<SchemlyRenderer
  :schema="editFormSchema"
  :data="orderDetail"
  :providers="providers"
  @submit="onSave"
/>
```
