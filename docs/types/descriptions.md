# Descriptions

Descriptions 用于描述列表展示，适合详情页场景。所有 Cell 强制 display 模式。

## 示例

```json
{
  "type": "Descriptions",
  "props": {
    "column": 2,
    "items": [
      { "key": "orderNo", "label": "订单号", "cell": "text", "displayAs": "copy" },
      { "key": "amount", "label": "金额", "cell": "currency" },
      {
        "key": "status",
        "label": "状态",
        "cell": "enum",
        "cellProps": { "options": "dict:orderStatus" },
        "displayAs": "tag"
      },
      {
        "key": "createTime",
        "label": "创建时间",
        "cell": "datetime",
        "cellProps": { "format": "YYYY-MM-DD HH:mm" }
      }
    ]
  }
}
```

## props

| 字段 | 类型 | 说明 |
|---|---|---|
| `column` | number | 每行列数（默认 `2`） |
| `items` | array | 描述项列表，每项为 Cell 声明 |

## 特点

- 所有 Cell 强制 **display 模式**
- Descriptions **无事件**
- 数据通过 `SchemlyRenderer` 的 `data` prop（object 类型）传入

## 使用示例

```vue
<SchemlyRenderer
  :schema="detailSchema"
  :data="orderDetail"
  :providers="providers"
/>
```
