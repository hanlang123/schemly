# Cell 体系

Cell 是 Schemly 的最小原子单元。所有高级展示形式（表格列、描述项、表单字段）都消费 Cell。

## Cell 声明结构

```json
{
  "key": "status",
  "label": "状态",
  "cell": "enum",
  "cellProps": { ... },
  "displayAs": "tag",
  "editAs": "select",
  "permission": { ... }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `key` | string | ✅ | 数据字段名，对应数据对象中的属性 |
| `label` | string | ✅ | 显示标签 |
| `cell` | string | ✅ | 数据语义类型，决定默认渲染器 |
| `cellProps` | object | ❌ | 渲染器配置参数，display 和 edit 共享 |
| `displayAs` | string | ❌ | 覆盖默认的展示渲染器 |
| `editAs` | string | ❌ | 覆盖默认的编辑渲染器 |
| `permission` | string / object | ❌ | Cell 级权限声明（详见 [权限体系](/schema/permission)） |

最简写法只需 `key`、`label`、`cell` 三个字段：

```json
{ "key": "orderNo", "label": "订单号", "cell": "text" }
```

## Cell 数据类型

| cell | 含义 | 默认 displayAs | 默认 editAs | 数据类型 |
|------|------|----------------|-------------|----------|
| `text` | 文本 | text | input | string |
| `number` | 数字 | number | inputNumber | number |
| `currency` | 金额 | currency | inputNumber | number |
| `enum` | 枚举值 | tag | select | string / number |
| `boolean` | 布尔值 | text | switch | boolean |
| `datetime` | 日期时间 | date | datePicker | string |
| `dateRange` | 日期区间 | date | dateRangePicker | string[] |
| `image` | 图片 | image | imageUpload | string / string[] |
| `file` | 文件 | file | fileUpload | object / object[] |
| `link` | 链接 | link | input | string |
| `detail` | 详情弹窗 | detail | textarea | string |

::: tip 特殊规则
`enum` 类型在 `cellProps` 中启用远程搜索时，默认 `displayAs` 降级为 `text`。
:::

## 双模态机制

容器根据自身语义自动决定使用哪种模态：

| 容器 | 默认模态 |
|------|----------|
| DataTable columns | display |
| Descriptions items | display |
| Form fields | edit |
| DataTable createForm / updateForm | edit |

## cellProps 详细说明

### text

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `maxlength` | number | — | 最大长度（edit 模式） |
| `placeholder` | string | — | 占位文本（edit 模式） |
| `showOverflowTooltip` | boolean | `true` | 溢出时 tooltip（display 模式） |

### number

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `precision` | number | `0` | 小数位数 |
| `thousandSep` | boolean | `true` | 千分位（display 模式） |
| `min` | number | — | 最小值（edit 模式） |
| `max` | number | — | 最大值（edit 模式） |
| `step` | number | `1` | 步进（edit 模式） |

### currency

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `precision` | number | `2` | 小数位数 |
| `prefix` | string | `"¥"` | 货币符号（display 模式） |
| `min` | number | `0` | 最小值（edit 模式） |
| `max` | number | — | 最大值（edit 模式） |

### enum

根据 `options` 前缀不同，cellProps 分为三种模式（详见 [数据源与字典](/schema/data-source)）：

**静态字典模式：**

| cellProps 字段 | 类型 | 说明 |
|---------------|------|------|
| `options` | string | 字典引用，格式 `dict:xxx` |
| `colors` | object | value → Element Plus type 颜色映射 |

**动态接口模式：**

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `options` | string | — | 接口引用，格式 `api:xxx` |
| `labelKey` | string | `"label"` | 返回数据中的 label 字段名 |
| `valueKey` | string | `"value"` | 返回数据中的 value 字段名 |

**远程搜索模式：**

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `options` | string | — | 搜索方法引用，格式 `remote:xxx` |
| `labelKey` | string | `"label"` | 搜索结果中的 label 字段名 |
| `valueKey` | string | `"value"` | 搜索结果中的 value 字段名 |
| `displayLabelKey` | string | — | 行数据中已有的 label 字段名 |

### boolean

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `activeText` | string | `"是"` | true 的展示文本 |
| `inactiveText` | string | `"否"` | false 的展示文本 |
| `activeColor` | string | — | switch 激活颜色（edit 模式） |

### datetime

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `format` | string | `"YYYY-MM-DD HH:mm:ss"` | 展示格式 |
| `valueFormat` | string | — | 值的格式（edit 模式提交格式） |
| `pickerType` | string | `"date"` | 选择器类型：date / datetime / month / year |

### dateRange

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `format` | string | `"YYYY-MM-DD"` | 展示格式 |
| `valueFormat` | string | — | 值的格式 |
| `startKey` | string | — | 起始日期字段名（提交时拆分） |
| `endKey` | string | — | 结束日期字段名 |

### image

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `multiple` | boolean | `false` | 是否多图 |
| `limit` | number | — | 多图模式下最大数量 |
| `width` | number | `60` | 缩略图宽度（display 模式） |
| `height` | number | `60` | 缩略图高度（display 模式） |
| `preview` | boolean | `true` | 点击预览大图（display 模式） |
| `accept` | string | `"image/*"` | 上传类型限制（edit 模式） |
| `maxSize` | number | — | 上传大小限制 MB（edit 模式） |
| `uploadFn` | string | `"uploadImage"` | 上传函数 key，从 `providers.functions` 中查找 |

**数据格式约定：**

```json
// 单图：值为字符串
{ "avatar": "https://xxx/1.jpg" }

// 多图：值为字符串数组
{ "photos": ["https://xxx/1.jpg", "https://xxx/2.jpg"] }
```

- **display 模式**：单图缩略图点击预览；多图横向排列，支持左右滚动，点击进入画廊预览。
- **edit 模式**：单图上传支持替换删除；多图上传支持拖拽排序和逐个删除。上传逻辑由 `providers.functions` 中对应的上传函数注入。

### file

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `multiple` | boolean | `false` | 是否多文件 |
| `limit` | number | — | 多文件最大数量 |
| `accept` | string | `"*"` | 允许的文件类型 |
| `maxSize` | number | — | 单文件大小限制 MB |
| `uploadFn` | string | `"uploadFile"` | 上传函数 key，从 `providers.functions` 中查找 |

**数据格式约定：**

```json
// 单文件
{
  "contract": { "name": "合同.pdf", "url": "https://xxx/contract.pdf", "size": 1024000 }
}

// 多文件
{
  "attachments": [
    { "name": "报告.pdf", "url": "https://xxx/1.pdf", "size": 1024000 },
    { "name": "数据.xlsx", "url": "https://xxx/2.xlsx", "size": 2048000 }
  ]
}
```

**文件项结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 文件名 |
| `url` | string | 文件地址 |
| `size` | number | 文件大小（字节，可选） |

### link

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `target` | string | `"_blank"` | 链接打开方式 |
| `href` | string | — | 链接地址字段名（若非 key 本身） |

### detail

Detail 是纯展示交互型 Cell，点击后弹出详情弹窗，支持纯文本和高亮匹配两种模式。

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| `trigger` | string | `"button"` | 触发方式：button（按钮）/ link（文字链接） |
| `buttonText` | string | `"查看"` | 触发按钮/链接的文字 |
| `mode` | string | `"text"` | 弹窗内容模式：text（纯文本）/ highlight（高亮匹配） |
| `highlightKey` | string | — | highlight 模式下，高亮关键词的数据字段名 |
| `dialogTitle` | string | `"详情"` | 弹窗标题 |
| `dialogWidth` | string | `"600px"` | 弹窗宽度 |

**text 模式**：弹窗中展示字段完整内容。

```json
{
  "key": "content",
  "label": "内容",
  "cell": "detail",
  "cellProps": {
    "trigger": "button",
    "buttonText": "查看详情",
    "mode": "text",
    "dialogTitle": "内容详情"
  }
}
```

**highlight 模式**：弹窗中展示完整内容，关键词高亮标记。关键词从 `row[highlightKey]` 取（字符串或字符串数组）。

```json
{
  "key": "matchResult",
  "label": "匹配结果",
  "cell": "detail",
  "cellProps": {
    "trigger": "button",
    "buttonText": "查看匹配",
    "mode": "highlight",
    "highlightKey": "keywords",
    "dialogTitle": "匹配详情"
  }
}
```

对应行数据：`{ "matchResult": "包含关键信息的文本...", "keywords": ["关键", "信息"] }`

- **display 模式**：渲染按钮或文字链接，点击弹出 Dialog。
- **edit 模式**：自动降级为 textarea 编辑器。
