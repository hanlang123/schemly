# Designer 设计规范

## 定位

面向前端开发者的可视化 JSON 编辑器，替代手写 JSON，提升配置效率。

## 使用形态

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
| `schema` | object | 初始 schema，可为空（新建）或已有（编辑） |
| `mockData` | array / object | 预览用 mock 数据 |

| event | payload | 说明 |
|---|---|---|
| `save` | `{ schema }` | 用户点击保存 |
| `change` | `{ schema }` | 任何变更时触发 |

## 整体页面结构

```
┌─────────────────────────────────────────────────────────────┐
│  顶栏 (56px)                                                │
│  [Logo] 订单列表 order-table  │ DataTable ▼ │ 导入 导出 预览 │
├─────────┬───────────────────────────────┬───────────────────┤
│ 左侧     │                               │ 右侧             │
│ 240px    │     中间主区域                  │ 320px            │
│ 可折叠    │     flex: 1                   │ 可折叠            │
│          │                               │                  │
├─────────┴───────────────────────────────┴───────────────────┤
│  底栏 (可收起)                                               │
│  JSON 输出 │ 依赖清单 │ 校验信息                               │
└─────────────────────────────────────────────────────────────┘
```

## 顶栏

- **type 切换**：已有配置时弹确认框"切换类型将清空当前配置"。新建时无需确认。
- **预览按钮**：切换中间区域在"配置模式"和"预览模式"之间。

## 左侧面板

左侧面板根据 type 展示不同的 tab：

### DataTable 时：三个 tab

- **字段 tab**：字段列表，支持搜索、拖拽排序、添加字段、从数据推断
- **操作 tab**：工具栏操作 + 行操作 + 行操作样式配置
- **表单 tab**：融合式配置面板，新增/编辑表单的字段映射和覆盖配置

### Form 时：一个 tab

- **字段 tab**：字段列表

### Descriptions 时：一个 tab

- **字段 tab**：字段列表

## 中间主区域

### 配置模式（默认）

根据 type 展示结构化配置界面，使用简化版 Runtime 渲染 mock 数据，点击可选中字段联动右侧面板。

### 预览模式

完全使用 Runtime 的 `SchemlyRenderer` 渲染，展示真实效果，不可点击编辑。

## 右侧属性面板

右侧面板是**上下文感知**的，根据选中状态展示不同内容：

- **未选中字段时**：展示 Schema 全局配置（基本信息、权限、字典管理、依赖清单）
- **选中字段时**：展示字段详细配置（基础信息、Cell 配置、列配置、权限配置）

### Cell 类型切换联动

选择不同 cell 类型后，`cellProps` 配置区域动态变化。`displayAs` / `editAs` 下拉框只展示合法选项，根据合法组合矩阵过滤。

## 底栏

底栏可收起，包含三个 tab：

### JSON 输出
实时更新，任何配置变更立即反映。支持复制到剪贴板和下载 `.json` 文件。

### 依赖清单
展示所有 functions 和 permissions，提供"复制 providers 模板"按钮生成业务代码模板。

### 校验信息
校验实时运行，tab 标签上显示问题数量，点击问题项可定位到对应字段配置。

## 添加字段交互

### 手动添加
输入 key、label、选择类型，确认添加。

### 从数据推断
粘贴接口返回的 JSON 数据，自动推断字段类型：

| 值类型 | 推断 cell |
|---|---|
| string + ISO 日期格式 | `datetime` |
| string | `text` |
| number + 含小数 | `number` |
| number + 整数 | `number` |
| boolean | `boolean` |
| array of string（URL 格式） | `image` (multiple) |
| object with name/url | `file` |
| array of object with name/url | `file` (multiple) |

## 预览机制

有 mockData 用 mockData，没有则根据 Cell 类型自动生成：

| cell | mock 值 |
|---|---|
| `text` | `"示例文本"` |
| `number` | `1234` |
| `currency` | `9999.00` |
| `enum` | options 第一个 value |
| `boolean` | `true` |
| `datetime` | 当前日期 |
| `image` | 占位图 URL |
| `file` | `{ name: "示例文件.pdf", url: "#", size: 1024000 }` |
| `detail` | `"这是一段详情内容的示例文本..."` |

## 导入导出

| 功能 | 说明 |
|---|---|
| 导出 JSON 文件 | 下载 .json |
| 复制 JSON | 复制到剪贴板 |
| 导入 JSON 文件 | 上传 .json 加载 |
| 从剪贴板导入 | 粘贴 JSON 加载 |
| 从示例数据推断 | 贴入数据自动生成字段 |

存储完全交给业务方，Designer 只负责编辑和导出。

## 操作流程

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
