# Schemly Schema 协议规范 v1.0（完整版）

## 目录

1. [概述](#1-概述)
2. [顶层结构](#2-顶层结构)
3. [Cell 体系](#3-cell-体系)
4. [展示渲染器 displayAs](#4-展示渲染器-displayas)
5. [编辑渲染器 editAs](#5-编辑渲染器-editas)
6. [数据源与字典系统](#6-数据源与字典系统)
7. [权限体系](#7-权限体系)
8. [Type 协议：DataTable](#8-type-协议datatable)
9. [Type 协议：Form](#9-type-协议form)
10. [Type 协议：Descriptions](#10-type-协议descriptions)
11. [外部依赖声明 externalDeps](#11-外部依赖声明-externaldeps)
12. [Runtime 接口](#12-runtime-接口)
13. [自定义扩展](#13-自定义扩展)
14. [版本迁移策略](#14-版本迁移策略)
15. [Designer 设计规范](#15-designer-设计规范)
16. [工程结构](#16-工程结构)
17. [TypeScript 类型定义](#17-typescript-类型定义)
18. [完整 Schema 示例](#18-完整-schema-示例)

---

## 1. 概述

Schemly 是一个基于 Vue 3 + Element Plus 的 schema 驱动业务展示类库，面向后台管理系统。一份 schema 描述一个组件实例的完整展示行为，由 Designer 产出，由 Runtime 消费渲染。

### 核心原则

- **一个 schema = 一个组件实例**：schema 描述局部区域（页面主体、弹窗、抽屉等），不描述完整页面
- **Cell 是最小原子单元**：所有高级展示形式（表格列、描述项、表单字段）都消费 Cell
- **cell type = 数据语义**：cell 描述"这个字段是什么类型的数据"，而非"用什么组件渲染"
- **双模态派生**：每个 cell type 默认推导出 display 渲染器和 edit 渲染器，大多数场景无需显式指定
- **schema 纯展示描述**：不包含请求逻辑、路由逻辑，数据由 Runtime props 传入
- **组件间联动交给业务代码**：schema 不管组件间的交互关系
- **声明与实现分离**：schema 只声明 key，Runtime 注入具体实现

### 分层模型

```
Schema 协议层
├── Cell（原子单元，数据语义层）
│   ├── displayAs → 展示渲染器
│   └── editAs   → 编辑渲染器
├── Field = Cell + 表单行为（rules、disabled 等）
└── Type（布局容器，消费 Cell 或 Field）
    ├── DataTable：用 Cell 渲染列，支持 createForm / updateForm
    ├── Form：通用表单，适用于搜索、筛选、独立编辑等
    └── Descriptions：用 Cell 渲染描述项
```

---

## 2. 顶层结构

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

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| version | string | 是 | 协议版本号，格式 major.minor，用于迁移（详见第 14 章） |
| id | string | 是 | schema 唯一标识 |
| name | string | 是 | 可读名称，Designer 中展示用 |
| type | string | 是 | 渲染类型：DataTable / Form / Descriptions |
| permission | string | 否 | Type 级权限标识，无权限时整个组件不渲染 |
| dicts | object | 否 | Designer 预配置的静态字典 |
| externalDeps | object | 否 | 外部依赖声明（Designer 自动生成） |
| props | object | 是 | 组件配置，结构由 type 决定 |

---

## 3. Cell 体系

### 3.1 Cell 声明结构

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
| key | string | 是 | 数据字段名，对应数据对象中的属性 |
| label | string | 是 | 显示标签 |
| cell | string | 是 | 数据语义类型，决定默认渲染器 |
| cellProps | object | 否 | 渲染器配置参数，display 和 edit 共享 |
| displayAs | string | 否 | 覆盖默认的展示渲染器 |
| editAs | string | 否 | 覆盖默认的编辑渲染器 |
| permission | string / object | 否 | Cell 级权限声明（详见第 7 章） |

最简写法只需 key、label、cell 三个字段：

```json
{ "key": "orderNo", "label": "订单号", "cell": "text" }
```

### 3.2 Cell 数据类型

| cell | 含义 | 默认 displayAs | 默认 editAs | 数据类型 |
|------|------|----------------|-------------|----------|
| text | 文本 | text | input | string |
| number | 数字 | number | inputNumber | number |
| currency | 金额 | currency | inputNumber | number |
| enum | 枚举值 | tag | select | string / number |
| boolean | 布尔值 | text | switch | boolean |
| datetime | 日期时间 | date | datePicker | string |
| dateRange | 日期区间 | date | dateRangePicker | string[] |
| image | 图片 | image | imageUpload | string / string[] |
| file | 文件 | file | fileUpload | object / object[] |
| link | 链接 | link | input | string |
| detail | 详情弹窗 | detail | textarea | string |

> 特殊规则：enum 类型在 cellProps 中启用远程搜索时，默认 displayAs 降级为 text。

### 3.3 双模态机制

容器根据自身语义自动决定使用哪种模态：

| 容器 | 默认模态 |
|------|----------|
| DataTable columns | display |
| Descriptions items | display |
| Form fields | edit |
| DataTable createForm / updateForm | edit |

### 3.4 各类型 cellProps 详细说明

#### text

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| maxlength | number | — | 最大长度（edit 模式） |
| placeholder | string | — | 占位文本（edit 模式） |
| showOverflowTooltip | boolean | true | 溢出时 tooltip（display 模式） |

#### number

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| precision | number | 0 | 小数位数 |
| thousandSep | boolean | true | 千分位（display 模式） |
| min | number | — | 最小值（edit 模式） |
| max | number | — | 最大值（edit 模式） |
| step | number | 1 | 步进（edit 模式） |

#### currency

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| precision | number | 2 | 小数位数 |
| prefix | string | "¥" | 货币符号（display 模式） |
| min | number | 0 | 最小值（edit 模式） |
| max | number | — | 最大值（edit 模式） |

#### enum

根据 options 前缀不同，cellProps 分为三种模式（详见第 6 章）：

**静态字典模式：**

| cellProps 字段 | 类型 | 说明 |
|---------------|------|------|
| options | string | 字典引用，格式 `dict:xxx` |
| colors | object | value → Element Plus type 颜色映射 |

**动态接口模式：**

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| options | string | — | 接口引用，格式 `api:xxx` |
| labelKey | string | "label" | 返回数据中的 label 字段名 |
| valueKey | string | "value" | 返回数据中的 value 字段名 |

**远程搜索模式：**

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| options | string | — | 搜索方法引用，格式 `remote:xxx` |
| labelKey | string | "label" | 搜索结果中的 label 字段名 |
| valueKey | string | "value" | 搜索结果中的 value 字段名 |
| displayLabelKey | string | — | 行数据中已有的 label 字段名 |

#### boolean

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| activeText | string | "是" | true 的展示文本 |
| inactiveText | string | "否" | false 的展示文本 |
| activeColor | string | — | switch 激活颜色（edit 模式） |

#### datetime

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| format | string | "YYYY-MM-DD HH:mm:ss" | 展示格式 |
| valueFormat | string | — | 值的格式（edit 模式提交格式） |
| pickerType | string | "date" | 选择器类型：date / datetime / month / year |

#### dateRange

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| format | string | "YYYY-MM-DD" | 展示格式 |
| valueFormat | string | — | 值的格式 |
| startKey | string | — | 起始日期字段名（提交时拆分） |
| endKey | string | — | 结束日期字段名 |

#### image

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| multiple | boolean | false | 是否多图 |
| limit | number | — | 多图模式下最大数量 |
| width | number | 60 | 缩略图宽度（display 模式） |
| height | number | 60 | 缩略图高度（display 模式） |
| preview | boolean | true | 点击预览大图（display 模式） |
| accept | string | "image/*" | 上传类型限制（edit 模式） |
| maxSize | number | — | 上传大小限制 MB（edit 模式） |
| uploadFn | string | "uploadImage" | 上传函数 key，从 providers.functions 中查找 |

数据格式约定：

```json
// 单图：值为字符串
{ "avatar": "https://xxx/1.jpg" }

// 多图：值为字符串数组
{ "photos": ["https://xxx/1.jpg", "https://xxx/2.jpg"] }
```

display 模式：单图缩略图点击预览；多图横向排列，支持左右滚动，点击进入画廊预览。
edit 模式：单图上传支持替换删除；多图上传支持拖拽排序和逐个删除。上传逻辑由 providers.functions 中对应的上传函数注入。

#### file

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| multiple | boolean | false | 是否多文件 |
| limit | number | — | 多文件最大数量 |
| accept | string | "*" | 允许的文件类型 |
| maxSize | number | — | 单文件大小限制 MB |
| uploadFn | string | "uploadFile" | 上传函数 key，从 providers.functions 中查找 |

数据格式约定：

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

文件项结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 文件名 |
| url | string | 文件地址 |
| size | number | 文件大小（字节，可选） |

display 模式：单文件渲染文件名 + 图标 + 下载按钮；多文件渲染文件列表。
edit 模式：文件上传组件，展示已上传文件列表，支持删除和重新上传。

#### link

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| target | string | "_blank" | 链接打开方式 |
| href | string | — | 链接地址字段名（若非 key 本身） |

#### detail

detail 是纯展示交互型 Cell，点击后弹出详情弹窗，支持纯文本和高亮匹配两种模式。

| cellProps 字段 | 类型 | 默认值 | 说明 |
|---------------|------|--------|------|
| trigger | string | "button" | 触发方式：button（按钮）/ link（文字链接） |
| buttonText | string | "查看" | 触发按钮/链接的文字 |
| mode | string | "text" | 弹窗内容模式：text（纯文本）/ highlight（高亮匹配） |
| highlightKey | string | — | highlight 模式下，高亮关键词的数据字段名 |
| dialogTitle | string | "详情" | 弹窗标题 |
| dialogWidth | string | "600px" | 弹窗宽度 |

**text 模式**：弹窗中展示字段完整内容。

```json
{
  "key": "content",
  "label": "内容",
  "cell": "detail",
  "cellProps": { "trigger": "button", "buttonText": "查看详情", "mode": "text", "dialogTitle": "内容详情" }
}
```

**highlight 模式**：弹窗中展示完整内容，关键词高亮标记。关键词从 `row[highlightKey]` 取（字符串或字符串数组）。

```json
{
  "key": "matchResult",
  "label": "匹配结果",
  "cell": "detail",
  "cellProps": { "trigger": "button", "buttonText": "查看匹配", "mode": "highlight", "highlightKey": "keywords", "dialogTitle": "匹配详情" }
}
```

对应行数据：`{ "matchResult": "包含关键信息的文本...", "keywords": ["关键", "信息"] }`

display 模式：渲染按钮或文字链接，点击弹出 Dialog。
edit 模式：自动降级为 textarea 编辑器。

---

## 4. 展示渲染器（displayAs）

### 4.1 渲染器列表

| displayAs | 渲染效果 | 说明 |
|-----------|----------|------|
| text | 纯文本 | 默认，直接输出值 |
| number | 千分位格式化数字 | 1234567 → 1,234,567 |
| currency | 货币符号 + 格式化金额 | 1234.5 → ¥1,234.50 |
| tag | Element Plus Tag 组件 | 配合字典映射颜色 |
| status | 圆点 + 文字 | 适合状态类字段 |
| date | 格式化日期字符串 | 按 format 格式化 |
| image | 缩略图（可预览） | 单图/多图，支持画廊预览 |
| file | 文件展示 | 文件名 + 图标 + 下载按钮 |
| link | 可点击超链接 | 带 target 配置 |
| copy | 文字 + 复制按钮 | 点击复制到剪贴板 |
| progress | 进度条 | Element Plus Progress |
| detail | 详情按钮 | 按钮/链接，点击弹出详情弹窗 |

### 4.2 tag / status 颜色查找优先级

1. cellProps.colors 中的显式映射
2. dict 项中的 color 字段
3. 无匹配时使用默认色（info）

### 4.3 合法的 displayAs 覆盖组合

| cell \ displayAs | text | number | currency | tag | status | date | image | file | link | copy | progress | detail |
|-----------------|------|--------|----------|-----|--------|------|-------|------|------|------|----------|--------|
| text | ✅ | — | — | — | — | — | — | — | ✅ | ✅ | — | ✅ |
| number | ✅ | ✅ | ✅ | — | — | — | — | — | — | ✅ | ✅ | — |
| currency | ✅ | ✅ | ✅ | — | — | — | — | — | — | ✅ | — | — |
| enum | ✅ | — | — | ✅ | ✅ | — | — | — | — | — | — | — |
| boolean | ✅ | — | — | ✅ | ✅ | — | — | — | — | — | — | — |
| datetime | ✅ | — | — | — | — | ✅ | — | — | — | ✅ | — | — |
| dateRange | ✅ | — | — | — | — | ✅ | — | — | — | — | — | — |
| image | — | — | — | — | — | — | ✅ | — | ✅ | — | — | — |
| file | — | — | — | — | — | — | — | ✅ | ✅ | — | — | — |
| link | ✅ | — | — | — | — | — | — | — | ✅ | ✅ | — | — |
| detail | ✅ | — | — | — | — | — | — | — | — | — | — | ✅ |

---

## 5. 编辑渲染器（editAs）

### 5.1 渲染器列表

| editAs | 渲染组件 | 说明 |
|--------|----------|------|
| input | el-input | 单行文本 |
| textarea | el-input[textarea] | 多行文本 |
| inputNumber | el-input-number | 数字输入 |
| select | el-select | 下拉选择（支持远程搜索） |
| radio | el-radio-group | 单选（选项 ≤ 5 时适用） |
| checkbox | el-checkbox-group | 多选，值为数组 |
| datePicker | el-date-picker | 日期选择 |
| dateRangePicker | el-date-picker[range] | 日期范围 |
| switch | el-switch | 开关 |
| imageUpload | el-upload（图片模式） | 图片上传，支持预览、单图/多图 |
| fileUpload | el-upload（文件模式） | 文件上传，展示文件列表 |

### 5.2 合法的 editAs 覆盖组合

| cell \ editAs | input | textarea | inputNumber | select | radio | checkbox | datePicker | dateRangePicker | switch | imageUpload | fileUpload |
|--------------|-------|----------|-------------|--------|-------|----------|------------|-----------------|--------|-------------|------------|
| text | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| number | — | — | ✅ | — | — | — | — | — | — | — | — |
| currency | — | — | ✅ | — | — | — | — | — | — | — | — |
| enum | — | — | — | ✅ | ✅ | ✅ | — | — | — | — | — |
| boolean | — | — | — | — | ✅ | — | — | — | ✅ | — | — |
| datetime | — | — | — | — | — | — | ✅ | — | — | — | — |
| dateRange | — | — | — | — | — | — | — | ✅ | — | — | — |
| image | — | — | — | — | — | — | — | — | — | ✅ | — |
| file | — | — | — | — | — | — | — | — | — | — | ✅ |
| link | ✅ | — | — | — | — | — | — | — | — | — | — |
| detail | — | ✅ | — | — | — | — | — | — | — | — | — |

Runtime 加载时应校验组合合法性，非法组合开发模式下警告并回退到默认渲染器。

---

## 6. 数据源与字典系统

### 6.1 options 前缀协议

enum 类型通过 cellProps.options 的前缀区分数据来源：

| 前缀 | 格式 | 含义 | 获取时机 |
|------|------|------|----------|
| dict: | `dict:orderStatus` | 静态字典 | schema 加载时即可用 |
| api: | `api:fetchDeptList` | 动态接口 | 组件挂载时调用一次并缓存 |
| remote: | `remote:searchUser` | 远程搜索 | 用户输入时实时调用 |

schema 中保留 api: / remote: 前缀以保留语义（前端程序员一眼看出调用方式），但在 providers 层面统一为 functions 命名空间（详见第 12 章）。

Runtime 解析映射：

```
options = "dict:xxx"     → 从 dicts 中查找
options = "api:xxx"      → 从 providers.functions[xxx] 获取，按 api 签名调用
options = "remote:xxx"   → 从 providers.functions[xxx] 获取，按 remote 签名调用
```

### 6.2 schema.dicts（Designer 预配置）

```json
{
  "dicts": {
    "orderStatus": [
      { "label": "待处理", "value": "pending", "color": "warning" },
      { "label": "已完成", "value": "done", "color": "success" },
      { "label": "已取消", "value": "cancelled", "color": "info" }
    ]
  }
}
```

字典项结构：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | string | 是 | 显示文本 |
| value | string / number | 是 | 数据值 |
| color | string | 否 | Element Plus type（primary / success / warning / danger / info） |

### 6.3 字典解析优先级

```
dict:orderStatus
  → ① schema.dicts.orderStatus（Designer 预配置）
  → ② providers.dicts.orderStatus（Runtime 注入）
  → ③ 均未找到 → 控制台警告，渲染原始 value
```

### 6.4 远程搜索的 display 模式约定

远程搜索字段的数据层**必须同时返回 value 和 label**，避免列表场景 N 行数据触发 N 次反查请求：

```json
{ "assignee": 42, "assigneeName": "张三" }
```

schema 中通过 `displayLabelKey: "assigneeName"` 声明，display 模式直接读取渲染。

---

## 7. 权限体系

### 7.1 三级权限模型

| 层级 | 作用范围 | 声明位置 | 无权限行为 |
|------|----------|----------|------------|
| Type 级 | 整个组件 | schema.permission | 不渲染组件，触发 @denied |
| Action 级 | 操作按钮 | rowActions / toolbarActions 的 permission | 不渲染按钮 |
| Cell 级 | 单个字段 | Cell 声明的 permission | view 无权限：不渲染；edit 无权限：降级为 display |

### 7.2 Cell 级权限声明

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
| view | string / boolean | true | true = 所有人可见，string = 权限标识 |
| edit | string / boolean | true | true = 所有人可编辑，string = 权限标识 |

不声明 permission 等同于 `{ view: true, edit: true }`。

简写：`"permission": "code"` 等价于 `{ "view": "code", "edit": "code" }`。

### 7.3 权限判定流程

**Type 级：**

```
schema.permission 存在？
├── 否 → 正常渲染
└── 是 → hasPermission(code)
    ├── true → 正常渲染
    └── false → 不渲染，触发 @denied
```

**Cell 级（display 模式）：**

```
permission.view？
├── 未声明或 true → 正常渲染
└── string → hasPermission(code) → true: 渲染 / false: 不渲染该列
```

**Cell 级（edit 模式）：**

```
permission.view？
├── 无权限 → 不渲染
└── 有权限 → permission.edit？
    ├── 未声明或 true → 可编辑
    └── string → hasPermission(code) → true: 可编辑 / false: 降级为 display
```

**Action 级：**

```
action.permission → hasPermission(code) → true: 渲染 / false: 不渲染
```

### 7.4 表单中的权限覆盖

createForm / updateForm 的 overrides 中可覆盖 Cell 原始 permission，优先级：**form overrides > Cell 原始声明**。

```json
{
  "createForm": { "overrides": { "amount": { "permission": { "edit": true } } } },
  "updateForm": { "overrides": { "amount": { "permission": { "edit": "order:amount:edit" } } } }
}
```

### 7.5 权限注入

```javascript
providers = {
  auth: { hasPermission: (code) => currentUser.permissions.includes(code) }
}
```

---

## 8. Type 协议：DataTable

### 8.1 完整 props 结构

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

### 8.2 columns

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

column 配置字段：

| column 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| width | number | — | 固定列宽（px） |
| minWidth | number | — | 最小列宽（px） |
| fixed | "left" / "right" | — | 固定列 |
| align | "left" / "center" / "right" | "left" | 对齐方式 |
| sortable | boolean | false | 是否支持列头排序 |
| resizable | boolean | true | 是否可拖拽调整列宽 |
| showOverflowTooltip | boolean | true | 溢出时 tooltip |

不声明 column 时使用全部默认值。排序不在 schema 中处理逻辑，用户点击排序时触发 @sort-change 事件，业务代码重新请求数据。

### 8.3 pagination

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
| enabled | boolean | true | 是否启用分页 |
| pageSize | number | 20 | 默认每页条数 |
| pageSizes | number[] | [10, 20, 50, 100] | 可选每页条数 |
| layout | string | "total, sizes, prev, pager, next, jumper" | 分页组件布局 |

向后兼容：`"pagination": true` 等价于 `{ "enabled": true }` 使用全部默认值；`"pagination": false` 或不声明则不显示分页。

### 8.4 selection（多选与批量操作）

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
| enabled | boolean | false | 是否显示 checkbox 列 |
| rowKey | string | "id" | 行数据唯一标识字段 |
| selectable | boolean / string | true | true = 所有行可选，string = 权限码 |

行级可选控制通过 actionControl 的 `_selection` key：

```javascript
actionControl: (row) => ({
  _selection: row.status !== 'locked'
})
```

### 8.5 toolbarActions

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
| key | string | 操作标识 |
| label | string | 按钮文字 |
| permission | string | 权限标识（可选） |
| trigger | string | 指向内部功能 createForm / updateForm（可选） |
| batch | boolean | 是否为批量操作，true 时无选中行自动禁用（默认 false） |
| confirm | string | 二次确认文案（可选） |
| icon | string | 按钮图标（可选） |

### 8.6 rowActions

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
| key | string | 操作标识 |
| label | string | 按钮文字 |
| permission | string | 权限标识（可选） |
| trigger | string | 指向内部功能（可选） |
| confirm | string | 二次确认文案（可选） |
| danger | boolean | 危险操作标红（默认 false） |
| icon | string | 按钮图标（可选） |

### 8.7 rowActionStyle

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
| type | "link" / "button" | "link" | 操作按钮样式 |
| maxVisible | number | 3 | 最多显示几个，超出折叠为下拉菜单 |
| moreText | string | "更多" | 折叠按钮文字 |

### 8.8 行级操作动态控制（actionControl）

通过 providers.actionControl 注入，根据行数据动态控制按钮显隐：

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
| true | 正常显示 |
| false | 隐藏 |
| "disabled" | 显示但禁用 |
| 未返回某个 key | 不受影响，正常显示 |

判定流程：permission（全局门槛）→ actionControl（行级门槛），两道都通过才显示。

toolbarActions 的动态控制通过 providers.toolbarControl（可选）：

```javascript
providers = {
  toolbarControl: () => ({
    batchDelete: selectedRows.length > 0
  })
}
```

### 8.9 createForm

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
| title | string | — | 弹窗标题 |
| width | string | "600px" | 弹窗宽度 |
| closeConfirm | boolean | true | 有修改时关闭是否弹确认 |
| keepAfterSubmit | boolean | false | 提交成功后保持弹窗（适合连续新增） |
| layout | object | — | 表单布局（见下） |
| fields | string[] | — | 引用 columns 中的 key |
| overrides | object | — | 按 key 覆盖 Cell 属性 |
| rules | object | — | 表单校验规则 |

layout 字段：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| columns | number | 1 | 每行几列 |
| labelWidth | string | "auto" | label 宽度 |
| labelPosition | "left" / "right" / "top" | "right" | label 位置 |

overrides 可覆盖字段：

| 字段 | 说明 |
|------|------|
| disabled | 强制禁用 |
| visible | false 时不出现在表单中 |
| cell | 覆盖数据类型 |
| cellProps | 合并覆盖（浅合并） |
| editAs | 覆盖编辑渲染器 |
| permission | 覆盖权限声明 |
| defaultValue | 默认值 |
| span | 占据列数（配合 layout.columns） |

### 8.10 updateForm

结构与 createForm 一致，区别：

- Runtime 用当前行数据回填表单
- 提交时触发 @updateSubmit，payload 含 `{ values, row }`
- keepAfterSubmit 在 updateForm 中无效

```json
{
  "updateForm": {
    "title": "编辑订单",
    "width": "600px",
    "layout": { "columns": 2, "labelWidth": "100px" },
    "fields": ["orderNo", "customer", "amount", "status", "remark"],
    "overrides": {
      "orderNo": { "disabled": true },
      "customer": { "disabled": true },
      "amount": { "permission": { "edit": "order:amount:edit" } },
      "remark": { "span": 2 }
    },
    "rules": {
      "amount": [{ "required": true, "message": "请输入金额" }]
    }
  }
}
```

### 8.11 rules 校验

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
| required | boolean | 必填 |
| pattern | string | 正则表达式（字符串形式） |
| min | number | 最小长度（字符串）或最小值（数字） |
| max | number | 最大长度或最大值 |
| type | string | 内置类型校验：email / url / number |
| validator | string | 自定义校验函数 key，从 providers.functions 中查找 |
| message | string | 校验失败提示 |
| trigger | string | 触发时机：blur / change（默认 blur） |

---

## 9. Type 协议：Form

Form 是通用表单容器，适用于搜索、筛选、独立编辑等任何表单场景。所有 Cell 强制 edit 模式。

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

### 9.1 layout

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| columns | number | 1 | 每行几列 |
| labelWidth | string | "auto" | label 宽度 |
| labelPosition | "left" / "right" / "top" | "right" | label 位置 |
| collapsible | boolean | false | 是否支持展开/收起（搜索场景常用） |
| defaultCollapsed | boolean | true | 默认是否收起 |
| visibleRows | number | 1 | 收起时显示几行 |

### 9.2 fields

每一项为 Cell 声明 + 表单扩展字段：

| 扩展字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| rules | array | — | 校验规则 |
| defaultValue | any | — | 默认值 |
| visible | boolean | true | 是否显示 |
| disabled | boolean | false | 是否禁用 |
| span | number | 1 | 占据列数 |

### 9.3 buttons

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| submitText | string | "提交" | 提交按钮文字 |
| resetText | string | "重置" | 重置按钮文字 |
| showReset | boolean | true | 是否显示重置按钮 |

### 9.4 与 DataTable 内表单的区别

| | DataTable 内的表单 | 独立 Form |
|---|---|---|
| 存在位置 | DataTable schema 的 props 内部 | 独立的 schema |
| 字段来源 | 引用 columns 的 key | 自己定义 fields |
| 渲染方式 | Dialog 弹窗 | 直接渲染在页面中 |
| 数据回填 | Runtime 自动用行数据回填 | 业务方通过 data prop 传入 |
| 用途 | 行编辑/新增 | 搜索、筛选、独立编辑、设置面板等 |

### 9.5 使用示例

```vue
<!-- 搜索表单 -->
<SchemlyRenderer :schema="searchSchema" :providers="providers" @submit="onSearch" @reset="onReset" />

<!-- 独立编辑表单 -->
<SchemlyRenderer :schema="editFormSchema" :data="orderDetail" :providers="providers" @submit="onSave" />
```

---

## 10. Type 协议：Descriptions

```json
{
  "type": "Descriptions",
  "props": {
    "column": 2,
    "items": [
      { "key": "orderNo", "label": "订单号", "cell": "text", "displayAs": "copy" },
      { "key": "amount", "label": "金额", "cell": "currency" },
      { "key": "status", "label": "状态", "cell": "enum", "cellProps": { "options": "dict:orderStatus" }, "displayAs": "tag" },
      { "key": "createTime", "label": "创建时间", "cell": "datetime", "cellProps": { "format": "YYYY-MM-DD HH:mm" } }
    ]
  }
}
```

| props 字段 | 类型 | 说明 |
|---|---|---|
| column | number | 每行列数（默认 2） |
| items | array | 描述项列表，每项为 Cell 声明 |

所有 Cell 强制 display 模式。Descriptions 无事件。

---

## 11. 外部依赖声明（externalDeps）

### 11.1 作用

Designer 保存时自动扫描生成的依赖清单。业务方看 externalDeps 即知需要在 providers 中注入什么。

### 11.2 结构

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

| 字段 | 类型 | 说明 |
|------|------|------|
| dicts | string[] | schema.dicts 中未包含但被 dict:xxx 引用的字典 key |
| functions | FunctionDep[] | 所有需要注入的函数 |
| permissions | PermissionDep[] | 所有权限码 |

function 项：

| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | 函数标识，对应 providers.functions 中的 key |
| type | string | api / remote / upload:image / upload:file / validator |
| description | string | 可读描述 |

type 与签名对应关系：

| type | 签名 | 调用时机 |
|------|------|----------|
| api | `() => Promise<Array>` | 组件挂载时调一次并缓存 |
| remote | `(query: string) => Promise<Array>` | 用户输入时实时调用 |
| upload:image | `(file: File) => Promise<string>` | 图片上传，返回 URL |
| upload:file | `(file: File) => Promise<{ name, url, size }>` | 文件上传，返回文件信息 |
| validator | `(rule, value, callback) => void` | 表单校验时调用 |

permission 项：

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 权限码 |
| name | string | 可读描述 |
| scope | string | type / cell:view / cell:edit / action |
| target | string | schema id / cell key / action key |

### 11.3 自动生成规则

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

### 11.4 使用场景

- **开发时对照**：看 externalDeps 就知道 providers 里注入什么
- **Runtime 校验**：开发模式自动比对，缺失时警告
- **与后端同步**：permissions 导出给后端权限系统

---

## 12. Runtime 接口

### 12.1 SchemlyRenderer

```vue
<SchemlyRenderer
  :schema="schema"
  :data="data"
  :providers="providers"
  :loading="loading"
  :empty-text="emptyText"
  :empty-image="emptyImage"
  @action="onAction"
  @createSubmit="onCreateSubmit"
  @updateSubmit="onUpdateSubmit"
  @submit="onSubmit"
  @reset="onReset"
  @sort-change="onSortChange"
  @page-change="onPageChange"
  @selection-change="onSelectionChange"
  @denied="onDenied"
/>
```

#### Props

| prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| schema | object | 是 | — | schema JSON |
| data | array / object | 否 | — | 数据（DataTable 数组，Descriptions 对象，Form 对象或不传） |
| providers | object | 否 | {} | 外部依赖注入 |
| loading | boolean | 否 | false | 加载状态 |
| emptyText | string | 否 | "暂无数据" | 空状态文案 |
| emptyImage | string | 否 | — | 空状态图片 URL |

#### Events（DataTable）

| event | payload | 触发场景 |
|---|---|---|
| action | `{ key, row }` | 行操作（非 trigger、非 batch） |
| action | `{ key, rows }` | 批量操作（batch: true） |
| createSubmit | `{ values }` | createForm 提交 |
| updateSubmit | `{ values, row }` | updateForm 提交 |
| sort-change | `{ key, order }` | 列头排序，order: "ascending" / "descending" / null |
| page-change | `{ page, pageSize }` | 分页变化 |
| selection-change | `{ rows }` | 行选择变化 |
| denied | `{ permission }` | Type 级权限不足 |

#### Events（Form）

| event | payload | 触发场景 |
|---|---|---|
| submit | `{ values }` | 表单提交 |
| reset | `{}` | 表单重置 |

#### Events（Descriptions）

无事件。

### 12.2 providers 完整结构

```javascript
const providers = {
  // 静态字典数据
  dicts: {
    roleList: [
      { label: '管理员', value: 'admin' },
      { label: '编辑', value: 'editor' }
    ]
  },

  // 统一的函数注入（合并 api / remote / upload / validator）
  functions: {
    fetchDeptList: () => api.getDepartments(),
    fetchRoleList: () => api.getRoles(),
    searchUser: (query) => api.searchUser({ keyword: query }),
    uploadImage: (file) => api.uploadImage(file),
    uploadFile: (file) => api.uploadFile(file),
    validateAmount: (rule, value, callback) => {
      if (value <= 0) callback(new Error('金额必须大于 0'))
      else callback()
    }
  },

  // 权限校验
  auth: {
    hasPermission: (code) => currentUser.permissions.includes(code)
  },

  // 行操作动态控制（可选）
  actionControl: (row) => ({
    edit: row.status !== 'done',
    delete: row.createdBy === currentUser.id ? true : 'disabled'
  }),

  // 工具栏操作动态控制（可选）
  toolbarControl: () => ({
    batchDelete: selectedRows.length > 0
  }),

  // 自定义格式化（可选）
  formatters: {
    customMoney: (value) => `${value} 元`
  }
}
```

| 命名空间 | 说明 |
|----------|------|
| dicts | 静态字典数据 |
| functions | 所有注入函数，签名由 externalDeps.functions 中的 type 约定 |
| auth | 权限校验 |
| actionControl | 行操作动态控制（可选） |
| toolbarControl | 工具栏操作动态控制（可选） |
| formatters | 自定义格式化（可选） |

---

## 13. 自定义扩展

### 13.1 注册自定义 cell type

```javascript
import { registerCellType } from 'schemly'

registerCellType('employee', {
  defaultDisplayAs: 'employeeCard',
  defaultEditAs: 'employeeSelect'
})
```

### 13.2 注册自定义展示渲染器

```javascript
import { registerDisplayRenderer } from 'schemly'

registerDisplayRenderer('employeeCard', (value, cellProps, row) => {
  return h('div', { class: 'employee-card' }, [
    h('img', { src: row[cellProps.avatarKey] }),
    h('span', value)
  ])
})
```

### 13.3 注册自定义编辑渲染器

```javascript
import { registerEditRenderer } from 'schemly'

registerEditRenderer('employeeSelect', (modelValue, cellProps, onChange) => {
  return h(EmployeeSelectComponent, { modelValue, onChange, ...cellProps })
})
```

### 13.4 在 schema 中使用

```json
{ "key": "manager", "label": "部门经理", "cell": "employee", "cellProps": { "avatarKey": "managerAvatar" } }
```

---

## 14. 版本迁移策略

### 14.1 版本号格式

`major.minor`，如 `"1.0"` / `"1.1"` / `"2.0"`。

### 14.2 兼容规则

- minor 升级（1.0 → 1.1）：向后兼容，新增字段使用默认值
- major 升级（1.0 → 2.0）：不兼容，需要迁移

### 14.3 Runtime 行为

```
加载 schema 时检查 version:
├── major 一致 → 正常渲染
├── major 低于 Runtime → 自动迁移（调用迁移函数）
├── major 高于 Runtime → 报错，提示升级
└── version 缺失 → 视为 "1.0"
```

### 14.4 迁移函数注册

```typescript
import { registerMigration } from '@schemly/core'

registerMigration('1.0', '2.0', (schema) => {
  return transformedSchema
})
```

链式调用：1.0 → 1.1 → 2.0。现阶段只定义机制，不实现实际迁移。

---

## 15. Designer 设计规范

### 15.1 定位

面向前端开发者的可视化 JSON 编辑器，替代手写 JSON，提升配置效率。

### 15.2 使用形态

核心是 Vue 组件 `<SchemlyDesigner>`，playground 中包装为独立页面。

```vue
<SchemlyDesigner
  :schema="initialSchema"
  :mock-data="mockData"
  @save="onSave"
  @change="onChange"
/>
```

| prop | 类型 | 说明 |
|---|---|---|
| schema | object | 初始 schema，可为空（新建）或已有（编辑） |
| mockData | array / object | 预览用 mock 数据 |

| event | payload | 说明 |
|---|---|---|
| save | `{ schema }` | 用户点击保存 |
| change | `{ schema }` | 任何变更时触发 |

### 15.3 整体页面结构

```
┌─────────────────────────────────────────────────────────────┐
│  顶栏 (56px)                                                │
│  [Logo] 订单列表 order-table  │ DataTable ▼ │ 导入 导出 预览 │
├─────────┬───────────────────────────────┬───────────────────┤
│ 左侧     │                               │ 右侧             │
│ 240px    │     中间主区域                  │ 320px            │
│ 可折叠    │     flex: 1                   │ 可折叠            │
│          │                               │                  │
│          │                               │                  │
│          │                               │                  │
│          │                               │                  │
├─────────┴───────────────────────────────┴───────────────────┤
│  底栏 (可收起)                                               │
│  JSON 输出 │ 依赖清单 │ 校验信息                               │
└─────────────────────────────────────────────────────────────┘
```

### 15.4 顶栏

```
┌─────────────────────────────────────────────────────────────┐
│ [S] Schemly Designer                                        │
│                                                             │
│ 左区域:                         中区域:        右区域:        │
│ schema 名称 (可编辑)            type 切换      操作按钮组      │
│ schema id (只读, 灰色小字)      [DataTable]     [导入] [导出]  │
│                                [Form]         [预览] [保存]  │
│                                [Descriptions]               │
└─────────────────────────────────────────────────────────────┘
```

- **type 切换**：已有配置时弹确认框"切换类型将清空当前配置"。新建时无需确认。
- **预览按钮**：切换中间区域在"配置模式"和"预览模式"之间。

### 15.5 左侧面板

左侧面板根据 type 展示不同的 tab。

#### DataTable 时：三个 tab

**字段 tab：**

```
┌─────────────────────┐
│ [字段] [操作] [表单]  │
├─────────────────────┤
│ 🔍 搜索字段...       │
│ [+ 添加字段] [⚡推断]  │
│                     │
│ ┌─────────────────┐ │
│ │ ≡ orderNo       │ │
│ │   订单号 · text  │ │
│ ├─────────────────┤ │
│ │ ≡ amount        │ │
│ │   金额 · currency│ │
│ ├─────────────────┤ │
│ │ ≡ status  ●     │ │
│ │   状态 · enum    │ │
│ ├─────────────────┤ │
│ │ ≡ createTime    │ │
│ │   创建时间·datetime│
│ └─────────────────┘ │
│                     │
│ ≡ 可拖拽排序         │
│ ● 表示有权限配置      │
│ 选中行高亮蓝色边框     │
└─────────────────────┘
```

**操作 tab：**

```
┌─────────────────────┐
│ [字段] [操作] [表单]  │
├─────────────────────┤
│ 工具栏操作            │
│ [+ 添加]             │
│ ┌─────────────────┐ │
│ │ 新增  → createForm│ │
│ │ 批量删除  batch   │ │
│ │ 导出              │ │
│ └─────────────────┘ │
│                     │
│ 行操作               │
│ [+ 添加]             │
│ ┌─────────────────┐ │
│ │ 查看              │ │
│ │ 编辑 → updateForm │ │
│ │ 删除  🔴 danger   │ │
│ └─────────────────┘ │
│                     │
│ 行操作样式            │
│ 类型: [link ▼]       │
│ 最多显示: [3]         │
│ 更多文字: [更多]       │
└─────────────────────┘
```

**表单 tab（融合式配置面板）：**

```
┌─────────────────────┐
│ [字段] [操作] [表单]  │
├─────────────────────┤
│ 字段    新增  编辑    │
│ ─────────────────── │
│ 订单号  —    只读     │
│ 金额    ✅   🔒权限   │
│ 状态    ✅   ✅       │
│ 部门    ✅   ✅       │
│ 备注    ✅   ✅       │
│                     │
│ 点击展开详细配置 ↓     │
│ ┌─────────────────┐ │
│ │ [新增]    [编辑]  │ │
│ │ ☑ 包含    ☑ 包含  │ │
│ │ ☐ 只读    ☑ 只读  │ │
│ │ ☑ 必填    ☑ 必填  │ │
│ │ ☐ 权限    ☑ 权限  │ │
│ │           ↳ code │ │
│ └─────────────────┘ │
│                     │
│ 新增表单设置:         │
│ 标题: [新增订单]      │
│ 宽度: [800px]        │
│ 列数: [2]            │
│ 连续新增: [关]        │
│                     │
│ 编辑表单设置:         │
│ 标题: [编辑订单]      │
│ 宽度: [800px]        │
│ 列数: [2]            │
└─────────────────────┘
```

#### Form 时：一个 tab

```
┌─────────────────────┐
│ [字段]               │
├─────────────────────┤
│ 🔍 搜索字段...       │
│ [+ 添加字段] [⚡推断]  │
│                     │
│ 字段列表（同上）       │
└─────────────────────┘
```

#### Descriptions 时：一个 tab

```
┌─────────────────────┐
│ [字段]               │
├─────────────────────┤
│ 字段列表（同上）       │
└─────────────────────┘
```

### 15.6 中间主区域

中间区域有两种模式，通过顶栏"预览"按钮切换。

#### 配置模式（默认）

根据 type 展示结构化配置界面，使用简化版 Runtime 渲染 mock 数据，点击可选中字段联动右侧面板。

**DataTable 配置模式：**

```
┌──────────────────────────────────────┐
│ 全局配置                              │
│ 分页: [开 ▼]  每页: [20]              │
│ 多选: [开 ▼]  rowKey: [id]           │
│ ─────────────────────────────────── │
│                                      │
│ 列预览表格                            │
│ ┌──────┬──────┬──────┬──────┐       │
│ │订单号 │ 金额  │ 状态  │ 操作  │       │
│ ├──────┼──────┼──────┼──────┤       │
│ │ORD-01│¥9999 │[待处理]│查看.. │       │
│ │ORD-02│¥1234 │[已完成]│查看.. │       │
│ │ORD-03│¥5678 │[已取消]│查看.. │       │
│ └──────┴──────┴──────┴──────┘       │
│                                      │
│ 点击某一列 → 右侧面板显示该列的配置      │
│ 点击表格空白处 → 右侧面板显示全局配置    │
└──────────────────────────────────────┘
```

**Form 配置模式：**

```
┌──────────────────────────────────────┐
│ 全局配置                              │
│ 列数: [2]  labelWidth: [100px]       │
│ 可折叠: [关]                          │
│ ─────────────────────────────────── │
│                                      │
│ 表单预览                              │
│ ┌──────────────────────────────┐    │
│ │ 关键词: [        ]  状态: [▼]  │    │
│ │ 日期范围: [    ] ~ [    ]      │    │
│ │            [搜索] [重置]       │    │
│ └──────────────────────────────┘    │
│                                      │
│ 点击某个字段 → 右侧面板显示配置         │
└──────────────────────────────────────┘
```

**Descriptions 配置模式：**

```
┌──────────────────────────────────────┐
│ 全局配置                              │
│ 每行列数: [2]                         │
│ ─────────────────────────────────── │
│                                      │
│ 描述列表预览                          │
│ ┌──────────────────────────────┐    │
│ │ 订单号: ORD-001    金额: ¥9999 │    │
│ │ 状态:  [待处理]    负责人: 张三  │    │
│ │ 创建时间: 2024-01-01           │    │
│ └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

#### 预览模式

完全使用 Runtime 的 SchemlyRenderer 渲染，展示真实效果，不可点击编辑，数据可切换为用户提供的 mockData。

### 15.7 右侧属性面板

右侧面板是上下文感知的，根据选中状态展示不同内容。

#### 未选中字段时 → schema 全局配置

```
┌───────────────────────┐
│ Schema 配置             │
├───────────────────────┤
│                       │
│ ▼ 基本信息             │
│ ┌───────────────────┐ │
│ │ ID: order-table   │ │
│ │ 名称: [订单列表]    │ │
│ │ 类型: DataTable    │ │
│ └───────────────────┘ │
│                       │
│ ▼ 权限                 │
│ ┌───────────────────┐ │
│ │ Type 级权限: [开]   │ │
│ │ 权限码: [order:..] │ │
│ │ 权限名: [查看订单..] │ │
│ └───────────────────┘ │
│                       │
│ ▼ 字典管理             │
│ ┌───────────────────┐ │
│ │ orderStatus (3项)  │ │
│ │ [编辑] [删除]       │ │
│ │                   │ │
│ │ [+ 新增字典]        │ │
│ └───────────────────┘ │
│                       │
│ ▼ 依赖清单             │
│ ┌───────────────────┐ │
│ │ functions: 4       │ │
│ │ permissions: 7     │ │
│ │ [查看详情]          │ │
│ │ [复制 providers]   │ │
│ └───────────────────┘ │
└───────────────────────┘
```

#### 选中字段时 → 字段详细配置

```
┌───────────────────────┐
│ 字段配置: status        │
│ [← 返回全局配置]        │
├───────────────────────┤
│                       │
│ ▼ 基础信息             │
│ ┌───────────────────┐ │
│ │ key:   [status]    │ │
│ │ label: [状态]       │ │
│ └───────────────────┘ │
│                       │
│ ▼ Cell 配置            │
│ ┌───────────────────┐ │
│ │ 类型: [enum ▼]     │ │
│ │                   │ │
│ │ options 来源:       │ │
│ │ ○ 静态字典          │ │
│ │   dict: [orderSt▼] │ │
│ │ ○ 动态接口          │ │
│ │ ○ 远程搜索          │ │
│ │                   │ │
│ │ 展示覆盖:           │ │
│ │ displayAs: [tag ▼] │ │
│ │                   │ │
│ │ 编辑覆盖:           │ │
│ │ editAs: [默认 ▼]   │ │
│ └───────────────────┘ │
│                       │
│ ▼ 列配置 (DataTable)   │
│ ┌───────────────────┐ │
│ │ 宽度:    [  ]px    │ │
│ │ 最小宽度: [  ]px    │ │
│ │ 固定:    [无 ▼]     │ │
│ │ 对齐:    [左 ▼]     │ │
│ │ 可排序:  [关]       │ │
│ │ 可调宽:  [开]       │ │
│ └───────────────────┘ │
│                       │
│ ▼ 权限配置             │
│ ┌───────────────────┐ │
│ │ 查看权限: [关]      │ │
│ │ 编辑权限: [关]      │ │
│ └───────────────────┘ │
└───────────────────────┘
```

#### Cell 类型切换联动

选择不同 cell 类型后，cellProps 配置区域动态变化：

```
cell: text →           cell: enum →                cell: currency →
┌─────────────────┐   ┌─────────────────────────┐  ┌─────────────────┐
│ placeholder: [ ] │   │ options 来源:             │  │ 精度:     [2]    │
│ maxlength:   [ ] │   │ ○ 静态字典 ○ 动态接口     │  │ 货币符号:  [¥]    │
└─────────────────┘   │ ○ 远程搜索               │  │ 最小值:   [0]    │
                      │ (根据选择展示不同配置)      │  └─────────────────┘
                      └─────────────────────────┘

cell: image →          cell: detail →
┌─────────────────┐   ┌─────────────────┐
│ 多图:     [关]   │   │ 触发方式: [按钮 ▼] │
│ 数量限制:  [ ]   │   │ 按钮文字: [查看]   │
│ 缩略图宽:  [60]  │   │ 弹窗模式: [纯文本▼]│
│ 缩略图高:  [60]  │   │ 弹窗标题: [详情]   │
│ 上传函数: [upl.] │   │ 弹窗宽度: [600px] │
└─────────────────┘   └─────────────────┘
```

displayAs / editAs 下拉框只展示合法选项，根据合法组合矩阵过滤。

### 15.8 底栏

底栏可收起，三个 tab：

#### JSON 输出 tab

```
┌─────────────────────────────────────────────────────────────┐
│ [JSON 输出] [依赖清单] [校验信息]                    [收起 ▼] │
├─────────────────────────────────────────────────────────────┤
│ {                                              [复制] [下载] │
│   "version": "1.0",                                        │
│   "id": "order-table",                                     │
│   "name": "订单列表",                                       │
│   "type": "DataTable",                                     │
│   ...                                                      │
│ }                                                          │
└─────────────────────────────────────────────────────────────┘
```

实时更新，任何配置变更立即反映。支持复制到剪贴板和下载 .json 文件。

#### 依赖清单 tab

```
┌─────────────────────────────────────────────────────────────┐
│ [JSON 输出] [依赖清单] [校验信息]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ functions (4)                    permissions (7)             │
│ ┌────────────────────────┐      ┌────────────────────────┐ │
│ │ fetchDeptList  api     │      │ order:list:view  type   │ │
│ │ searchUser     remote  │      │ order:amount:edit cell  │ │
│ │ uploadImage    upload  │      │ order:create     action │ │
│ │ uploadFile     upload  │      │ ...                     │ │
│ └────────────────────────┘      └────────────────────────┘ │
│                                                             │
│ [复制 providers 模板]                                        │
└─────────────────────────────────────────────────────────────┘
```

"复制 providers 模板"按钮生成业务代码模板：

```javascript
const providers = {
  dicts: {},
  functions: {
    // api - 获取部门列表
    fetchDeptList: () => { /* TODO */ },
    // remote - 搜索用户
    searchUser: (query) => { /* TODO */ },
    // upload:image - 上传图片
    uploadImage: (file) => { /* TODO */ },
    // upload:file - 上传文件
    uploadFile: (file) => { /* TODO */ },
  },
  auth: {
    hasPermission: (code) => { /* TODO */ }
  }
}
```

#### 校验信息 tab

```
┌─────────────────────────────────────────────────────────────┐
│ [JSON 输出] [依赖清单] [校验信息]                    ✅ 0 问题 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ 所有字段配置合法                                           │
│ ✅ displayAs / editAs 组合均合法                              │
│ ✅ 所有 dict 引用有效                                         │
│ ✅ createForm / updateForm 引用的字段均存在于 columns 中        │
│                                                             │
│ --- 有问题时 ---                                              │
│                                                             │
│ ⚠️ 2 个警告                                                 │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ ⚠️ columns.phone: displayAs "progress" 与 cell "text" │    │
│ │   不是合法组合，将回退到默认渲染器                          │    │
│ │ ⚠️ updateForm.fields 引用了 "address" 但 columns 中     │    │
│ │   不存在该字段                                           │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

校验实时运行，tab 标签上显示问题数量，点击问题项可定位到对应字段配置。

### 15.9 添加字段交互

**手动添加**（点击"+ 添加字段"）：

```
┌──────────────────────────────┐
│ 添加字段                      │
├──────────────────────────────┤
│                              │
│ key:   [         ]           │
│ label: [         ]           │
│ 类型:  [text ▼]              │
│                              │
│ [取消]           [确认添加]    │
└──────────────────────────────┘
```

**从数据推断**（点击"⚡推断"）：

```
┌──────────────────────────────────┐
│ 从数据推断字段                     │
├──────────────────────────────────┤
│                                  │
│ 粘贴接口返回的 JSON 数据:          │
│ ┌──────────────────────────┐    │
│ │ {                        │    │
│ │   "orderNo": "ORD-001", │    │
│ │   "amount": 1299.00,    │    │
│ │   "status": "pending",  │    │
│ │   ...                   │    │
│ │ }                        │    │
│ └──────────────────────────┘    │
│                                  │
│ 推断结果:                         │
│ ┌──────────────────────────┐    │
│ │ ☑ orderNo  text     订单号 │    │
│ │ ☑ amount   number   金额  │    │
│ │ ☑ status   text     状态  │    │
│ │ ☑ createTime datetime    │    │
│ │ ☑ isActive boolean  是否  │    │
│ └──────────────────────────┘    │
│                                  │
│ 可勾选/取消，可修改 label 和 type  │
│                                  │
│ [取消]              [添加选中字段]  │
└──────────────────────────────────┘
```

推断规则：

| 值类型 | 推断 cell |
|---|---|
| string + ISO 日期格式 | datetime |
| string | text |
| number + 含小数 | number |
| number + 整数 | number |
| boolean | boolean |
| array of string（URL 格式） | image (multiple) |
| object with name/url | file |
| array of object with name/url | file (multiple) |

### 15.10 字典编辑弹窗

右侧全局配置中"字典管理"，点击编辑弹出：

```
┌──────────────────────────────────┐
│ 编辑字典: orderStatus             │
├──────────────────────────────────┤
│                                  │
│ label        value      color    │
│ ┌────────┬──────────┬────────┐  │
│ │[待处理] │ [pending] │[warn▼] │  │
│ │[已完成] │ [done]    │[succ▼] │  │
│ │[已取消] │[cancelled]│[info▼] │  │
│ └────────┴──────────┴────────┘  │
│ [+ 添加项]                       │
│                                  │
│ [取消]           [保存]           │
└──────────────────────────────────┘
```

### 15.11 预览机制

有 mockData 用 mockData，没有则根据 Cell 类型自动生成：

| cell | mock 值 |
|---|---|
| text | "示例文本" |
| number | 1234 |
| currency | 9999.00 |
| enum | options 第一个 value |
| boolean | true |
| datetime | 当前日期 |
| image | 占位图 URL |
| file | `{ name: "示例文件.pdf", url: "#", size: 1024000 }` |
| detail | "这是一段详情内容的示例文本..." |

### 15.12 导入导出

| 功能 | 说明 |
|---|---|
| 导出 JSON 文件 | 下载 .json |
| 复制 JSON | 复制到剪贴板 |
| 导入 JSON 文件 | 上传 .json 加载 |
| 从剪贴板导入 | 粘贴 JSON 加载 |
| 从示例数据推断 | 贴入数据自动生成字段 |

存储完全交给业务方，Designer 只负责编辑和导出。

### 15.13 操作流程

```
① 选择 type（DataTable / Form / Descriptions）
② 添加字段（手动添加或从示例数据推断）
③ 逐个配置字段（点击左侧或中间区域选中，右侧面板配置）
④ 配置全局属性（pagination / layout / selection）
⑤ 配置 Actions（toolbarActions / rowActions）[DataTable 独有]
⑥ 配置表单（createForm / updateForm 融合面板）[DataTable 独有]
⑦ 管理字典（右侧全局配置中）
⑧ 底栏查看 JSON / 依赖清单 / 校验信息
⑨ 预览 → 调整 → 导出 / 保存
```

---

## 16. 工程结构

### 16.1 monorepo 架构

pnpm workspace，四个包：

| 包 | 职责 | 发布 |
|---|------|------|
| @schemly/core | 类型、常量、解析引擎、校验、迁移 | 是 |
| @schemly/runtime | SchemlyRenderer、Cell 渲染器、composables | 是 |
| @schemly/designer | SchemlyDesigner、配置面板 | 是 |
| playground | 开发调试、示例演示 | 否 |

依赖关系：

```
playground → designer → runtime → core
                     → core
```

### 16.2 构建策略

| 包 | 工具 | 输出 |
|---|---|---|
| core | unbuild | ESM + CJS + d.ts，零依赖 |
| runtime | vite lib mode | ESM + CJS + d.ts，externalize vue / element-plus |
| designer | vite lib mode | ESM + CJS + d.ts |
| playground | vite app mode | SPA |

vue 和 element-plus 作为 peerDependencies。

### 16.3 开发顺序

```
Phase 1: core（类型 → 常量 → 解析器 → 校验器）
Phase 2: runtime（cells → composables → components）+ playground
Phase 3: designer（状态管理 → 配置面板 → 预览）
Phase 4: 完善（迁移、测试、文档）
```

---

## 17. TypeScript 类型定义

```typescript
// ============ Cell 类型 ============

export type CellType =
  | 'text' | 'number' | 'currency' | 'enum' | 'boolean'
  | 'datetime' | 'dateRange' | 'image' | 'file' | 'link' | 'detail'

export type DisplayAs =
  | 'text' | 'number' | 'currency' | 'tag' | 'status' | 'date'
  | 'image' | 'file' | 'link' | 'copy' | 'progress' | 'detail'

export type EditAs =
  | 'input' | 'textarea' | 'inputNumber' | 'select' | 'radio' | 'checkbox'
  | 'datePicker' | 'dateRangePicker' | 'switch' | 'imageUpload' | 'fileUpload'

export interface CellDeclaration {
  key: string
  label: string
  cell: CellType
  cellProps?: Record<string, any>
  displayAs?: DisplayAs
  editAs?: EditAs
  permission?: string | { view?: string | boolean; edit?: string | boolean }
  column?: ColumnConfig
}

// ============ Column 配置 ============

export interface ColumnConfig {
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  resizable?: boolean
  showOverflowTooltip?: boolean
}

// ============ 各 cellProps 类型 ============

export interface TextCellProps {
  maxlength?: number
  placeholder?: string
  showOverflowTooltip?: boolean
}

export interface NumberCellProps {
  precision?: number
  thousandSep?: boolean
  min?: number
  max?: number
  step?: number
}

export interface CurrencyCellProps {
  precision?: number
  prefix?: string
  min?: number
  max?: number
}

export interface EnumCellProps {
  options?: string
  colors?: Record<string, string>
  labelKey?: string
  valueKey?: string
  displayLabelKey?: string
}

export interface BooleanCellProps {
  activeText?: string
  inactiveText?: string
  activeColor?: string
}

export interface DatetimeCellProps {
  format?: string
  valueFormat?: string
  pickerType?: 'date' | 'datetime' | 'month' | 'year'
}

export interface DateRangeCellProps {
  format?: string
  valueFormat?: string
  startKey?: string
  endKey?: string
}

export interface ImageCellProps {
  multiple?: boolean
  limit?: number
  width?: number
  height?: number
  preview?: boolean
  accept?: string
  maxSize?: number
  uploadFn?: string
}

export interface FileCellProps {
  multiple?: boolean
  limit?: number
  accept?: string
  maxSize?: number
  uploadFn?: string
}

export interface LinkCellProps {
  target?: string
  href?: string
}

export interface DetailCellProps {
  trigger?: 'button' | 'link'
  buttonText?: string
  mode?: 'text' | 'highlight'
  highlightKey?: string
  dialogTitle?: string
  dialogWidth?: string
}

// ============ Schema 顶层 ============

export interface SchemlySchema {
  version: string
  id: string
  name: string
  type: 'DataTable' | 'Form' | 'Descriptions'
  permission?: string
  dicts?: Record<string, DictItem[]>
  externalDeps?: ExternalDeps
  props: DataTableProps | FormProps | DescriptionsProps
}

export interface DictItem {
  label: string
  value: string | number
  color?: string
}

// ============ ExternalDeps ============

export interface ExternalDeps {
  dicts?: string[]
  functions?: FunctionDep[]
  permissions?: PermissionDep[]
}

export interface FunctionDep {
  key: string
  type: 'api' | 'remote' | 'upload:image' | 'upload:file' | 'validator'
  description: string
}

export interface PermissionDep {
  code: string
  name: string
  scope: 'type' | 'cell:view' | 'cell:edit' | 'action'
  target: string
}

// ============ DataTable Props ============

export interface DataTableProps {
  columns: CellDeclaration[]
  pagination?: boolean | PaginationConfig
  selection?: SelectionConfig
  toolbarActions?: ToolbarAction[]
  rowActions?: RowAction[]
  rowActionStyle?: RowActionStyle
  createForm?: FormDialogConfig
  updateForm?: FormDialogConfig
}

export interface PaginationConfig {
  enabled?: boolean
  pageSize?: number
  pageSizes?: number[]
  layout?: string
}

export interface SelectionConfig {
  enabled?: boolean
  rowKey?: string
  selectable?: boolean | string
}

export interface ToolbarAction {
  key: string
  label: string
  permission?: string
  trigger?: string
  batch?: boolean
  confirm?: string
  icon?: string
}

export interface RowAction {
  key: string
  label: string
  permission?: string
  trigger?: string
  confirm?: string
  danger?: boolean
  icon?: string
}

export interface RowActionStyle {
  type?: 'link' | 'button'
  maxVisible?: number
  moreText?: string
}

export interface FormDialogConfig {
  title: string
  width?: string
  closeConfirm?: boolean
  keepAfterSubmit?: boolean
  layout?: FormLayout
  fields: string[]
  overrides?: Record<string, FieldOverride>
  rules?: Record<string, RuleItem[]>
}

export interface FormLayout {
  columns?: number
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
}

export interface FieldOverride {
  disabled?: boolean
  visible?: boolean
  cell?: CellType
  cellProps?: Record<string, any>
  editAs?: EditAs
  permission?: string | { view?: string | boolean; edit?: string | boolean }
  defaultValue?: any
  span?: number
}

export interface RuleItem {
  required?: boolean
  pattern?: string
  min?: number
  max?: number
  type?: string
  validator?: string
  message?: string
  trigger?: 'blur' | 'change'
}

// ============ Form Props ============

export interface FormProps {
  layout?: FormLayout & {
    collapsible?: boolean
    defaultCollapsed?: boolean
    visibleRows?: number
  }
  fields: FormFieldDeclaration[]
  buttons?: FormButtons
}

export interface FormFieldDeclaration extends CellDeclaration {
  rules?: RuleItem[]
  defaultValue?: any
  visible?: boolean
  disabled?: boolean
  span?: number
}

export interface FormButtons {
  submitText?: string
  resetText?: string
  showReset?: boolean
}

// ============ Descriptions Props ============

export interface DescriptionsProps {
  column?: number
  items: CellDeclaration[]
}

// ============ Providers ============

export interface Providers {
  dicts?: Record<string, DictItem[]>
  functions?: Record<string, Function>
  auth?: { hasPermission: (code: string) => boolean }
  actionControl?: (row: any) => Record<string, true | false | 'disabled'>
  toolbarControl?: () => Record<string, true | false | 'disabled'>
  formatters?: Record<string, (value: any) => string>
}
```

---

## 18. 完整 Schema 示例

### 18.1 订单列表表格

```json
{
  "version": "1.0",
  "id": "order-table",
  "name": "订单列表",
  "type": "DataTable",
  "permission": "order:list:view",
  "dicts": {
    "orderStatus": [
      { "label": "待处理", "value": "pending", "color": "warning" },
      { "label": "已完成", "value": "done", "color": "success" },
      { "label": "已取消", "value": "cancelled", "color": "info" }
    ]
  },
  "externalDeps": {
    "dicts": [],
    "functions": [
      { "key": "fetchDeptList", "type": "api", "description": "获取部门列表" },
      { "key": "searchUser", "type": "remote", "description": "搜索用户" },
      { "key": "uploadImage", "type": "upload:image", "description": "上传图片" },
      { "key": "uploadFile", "type": "upload:file", "description": "上传文件" }
    ],
    "permissions": [
      { "code": "order:list:view", "name": "查看订单列表", "scope": "type", "target": "order-table" },
      { "code": "order:cost:view", "name": "查看订单成本", "scope": "cell:view", "target": "cost" },
      { "code": "order:amount:edit", "name": "编辑订单金额", "scope": "cell:edit", "target": "amount" },
      { "code": "order:create", "name": "新增订单", "scope": "action", "target": "create" },
      { "code": "order:view", "name": "查看订单详情", "scope": "action", "target": "view" },
      { "code": "order:edit", "name": "编辑订单", "scope": "action", "target": "edit" },
      { "code": "order:delete", "name": "删除订单", "scope": "action", "target": "delete" }
    ]
  },
  "props": {
    "columns": [
      { "key": "orderNo", "label": "订单号", "cell": "text", "displayAs": "copy", "column": { "width": 180, "fixed": "left" } },
      { "key": "amount", "label": "金额", "cell": "currency", "column": { "sortable": true, "align": "right" }, "permission": { "view": true, "edit": "order:amount:edit" } },
      { "key": "cost", "label": "成本", "cell": "currency", "permission": { "view": "order:cost:view", "edit": "order:cost:view" } },
      { "key": "status", "label": "状态", "cell": "enum", "cellProps": { "options": "dict:orderStatus" }, "displayAs": "tag" },
      { "key": "department", "label": "所属部门", "cell": "enum", "cellProps": { "options": "api:fetchDeptList", "labelKey": "name", "valueKey": "id" } },
      { "key": "assignee", "label": "负责人", "cell": "enum", "cellProps": { "options": "remote:searchUser", "labelKey": "name", "valueKey": "id", "displayLabelKey": "assigneeName" }, "displayAs": "text" },
      { "key": "photos", "label": "商品图片", "cell": "image", "cellProps": { "multiple": true, "limit": 5, "width": 40, "height": 40 } },
      { "key": "attachments", "label": "附件", "cell": "file", "cellProps": { "multiple": true, "limit": 10, "accept": ".pdf,.docx,.xlsx" } },
      { "key": "content", "label": "内容", "cell": "detail", "cellProps": { "trigger": "button", "buttonText": "查看详情", "mode": "text", "dialogTitle": "内容详情" } },
      { "key": "createTime", "label": "创建时间", "cell": "datetime", "cellProps": { "format": "YYYY-MM-DD" }, "column": { "sortable": true } }
    ],
    "pagination": { "enabled": true, "pageSize": 20, "pageSizes": [10, 20, 50, 100] },
    "selection": { "enabled": true, "rowKey": "id" },
    "toolbarActions": [
      { "key": "create", "label": "新增", "permission": "order:create", "trigger": "createForm" },
      { "key": "batchDelete", "label": "批量删除", "permission": "order:delete", "batch": true, "confirm": "确认删除选中的订单？" }
    ],
    "rowActions": [
      { "key": "view", "label": "查看", "permission": "order:view" },
      { "key": "edit", "label": "编辑", "permission": "order:edit", "trigger": "updateForm" },
      { "key": "delete", "label": "删除", "permission": "order:delete", "danger": true, "confirm": "确认删除？" }
    ],
    "rowActionStyle": { "type": "link", "maxVisible": 3 },
    "createForm": {
      "title": "新增订单",
      "width": "800px",
      "keepAfterSubmit": false,
      "layout": { "columns": 2, "labelWidth": "100px" },
      "fields": ["amount", "status", "department", "assignee", "photos", "attachments", "content"],
      "overrides": {
        "amount": { "permission": { "edit": true } },
        "content": { "span": 2 }
      },
      "rules": {
        "amount": [{ "required": true, "message": "请输入金额" }],
        "status": [{ "required": true, "message": "请选择状态" }]
      }
    },
    "updateForm": {
      "title": "编辑订单",
      "width": "800px",
      "layout": { "columns": 2, "labelWidth": "100px" },
      "fields": ["orderNo", "amount", "status", "department", "assignee", "photos", "attachments", "content"],
      "overrides": {
        "orderNo": { "disabled": true },
        "amount": { "permission": { "edit": "order:amount:edit" } },
        "content": { "span": 2 }
      },
      "rules": {
        "amount": [{ "required": true, "message": "请输入金额" }]
      }
    }
  }
}
```

### 18.2 订单搜索表单

```json
{
  "version": "1.0",
  "id": "order-search",
  "name": "订单搜索",
  "type": "Form",
  "dicts": {
    "orderStatus": [
      { "label": "待处理", "value": "pending" },
      { "label": "已完成", "value": "done" },
      { "label": "已取消", "value": "cancelled" }
    ]
  },
  "props": {
    "layout": { "columns": 3, "labelWidth": "80px", "collapsible": true, "defaultCollapsed": true, "visibleRows": 1 },
    "fields": [
      { "key": "keyword", "label": "关键词", "cell": "text", "cellProps": { "placeholder": "订单号 / 客户名" } },
      { "key": "status", "label": "状态", "cell": "enum", "cellProps": { "options": "dict:orderStatus" } },
      { "key": "dateRange", "label": "创建日期", "cell": "dateRange", "cellProps": { "startKey": "startDate", "endKey": "endDate" } }
    ],
    "buttons": { "submitText": "搜索", "resetText": "重置", "showReset": true }
  }
}
```

### 18.3 订单详情

```json
{
  "version": "1.0",
  "id": "order-detail",
  "name": "订单详情",
  "type": "Descriptions",
  "permission": "order:detail:view",
  "dicts": {
    "orderStatus": [
      { "label": "待处理", "value": "pending", "color": "warning" },
      { "label": "已完成", "value": "done", "color": "success" },
      { "label": "已取消", "value": "cancelled", "color": "info" }
    ]
  },
  "externalDeps": {
    "dicts": [],
    "functions": [],
    "permissions": [
      { "code": "order:detail:view", "name": "查看订单详情", "scope": "type", "target": "order-detail" },
      { "code": "order:cost:view", "name": "查看订单成本", "scope": "cell:view", "target": "cost" }
    ]
  },
  "props": {
    "column": 2,
    "items": [
      { "key": "orderNo", "label": "订单号", "cell": "text", "displayAs": "copy" },
      { "key": "amount", "label": "金额", "cell": "currency" },
      { "key": "cost", "label": "成本", "cell": "currency", "permission": { "view": "order:cost:view" } },
      { "key": "status", "label": "状态", "cell": "enum", "cellProps": { "options": "dict:orderStatus" }, "displayAs": "tag" },
      { "key": "assigneeName", "label": "负责人", "cell": "text" },
      { "key": "photos", "label": "商品图片", "cell": "image", "cellProps": { "multiple": true, "width": 80, "height": 80 } },
      { "key": "attachments", "label": "附件", "cell": "file", "cellProps": { "multiple": true } },
      { "key": "content", "label": "内容", "cell": "detail", "cellProps": { "trigger": "link", "buttonText": "查看完整内容", "mode": "text" } },
      { "key": "createTime", "label": "创建时间", "cell": "datetime", "cellProps": { "format": "YYYY-MM-DD HH:mm:ss" } },
      { "key": "remark", "label": "备注", "cell": "text" }
    ]
  }
}
```

### 18.4 业务页面组装

```vue
<template>
  <div class="order-page">
    <SchemlyRenderer
      :schema="searchSchema"
      :providers="providers"
      @submit="onSearch"
      @reset="onReset"
    />
    <SchemlyRenderer
      :schema="tableSchema"
      :data="tableData"
      :providers="providers"
      :loading="loading"
      @action="onAction"
      @createSubmit="onCreateSubmit"
      @updateSubmit="onUpdateSubmit"
      @sort-change="onSortChange"
      @page-change="onPageChange"
      @selection-change="onSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import searchSchema from './schemas/order-search.json'
import tableSchema from './schemas/order-table.json'

const tableData = ref([])
const loading = ref(false)

const providers = {
  dicts: {},
  functions: {
    fetchDeptList: () => api.getDepartments(),
    searchUser: (query) => api.searchUser({ keyword: query }),
    uploadImage: (file) => api.uploadImage(file),
    uploadFile: (file) => api.uploadFile(file)
  },
  auth: {
    hasPermission: (code) => currentUser.permissions.includes(code)
  },
  actionControl: (row) => ({
    edit: row.status !== 'done',
    delete: row.createdBy === currentUser.id
  })
}

const onSearch = ({ values }) => {
  loading.value = true
  api.fetchOrderList(values).then(res => {
    tableData.value = res.data
    loading.value = false
  })
}

const onReset = () => {
  onSearch({ values: {} })
}

const onAction = ({ key, row, rows }) => {
  if (key === 'view') router.push(`/order/${row.id}`)
  if (key === 'delete') api.deleteOrder(row.id).then(() => refresh())
  if (key === 'batchDelete') api.batchDeleteOrders(rows.map(r => r.id)).then(() => refresh())
}

const onCreateSubmit = ({ values }) => {
  api.createOrder(values).then(() => refresh())
}

const onUpdateSubmit = ({ values, row }) => {
  api.updateOrder(row.id, values).then(() => refresh())
}

const onSortChange = ({ key, order }) => {
  // 重新请求排序数据
}

const onPageChange = ({ page, pageSize }) => {
  // 重新请求分页数据
}

const onSelectionChange = ({ rows }) => {
  // 记录选中行
}
</script>
```
