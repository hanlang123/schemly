# @schemly/runtime

> Schema 驱动的 Vue 3 运行时渲染引擎 — [Schemly](https://github.com/hanlang123/schemly) 运行时包

[![npm version](https://img.shields.io/npm/v/@schemly/runtime.svg)](https://www.npmjs.com/package/@schemly/runtime)
[![license](https://img.shields.io/npm/l/@schemly/runtime.svg)](https://github.com/hanlang123/schemly/blob/master/LICENSE)

## 简介

`@schemly/runtime` 消费 `@schemly/core` 定义的 Schema，将其渲染为基于 Vue 3 + Element Plus 的实际 UI 组件。支持 DataTable 数据表格、Form 通用表单、Descriptions 描述列表三种布局容器，涵盖后台管理系统核心场景。

## 安装

```bash
npm install @schemly/runtime element-plus vue
# 或
pnpm add @schemly/runtime element-plus vue
```

> `@schemly/core` 是 `@schemly/runtime` 的依赖，会自动安装。同时 runtime 会 re-export core 的所有 API，无需单独引入 core。

## 快速开始

```vue
<script setup lang="ts">
import { SchemlyRenderer } from '@schemly/runtime'
import type { SchemlySchema, Providers } from '@schemly/runtime'

const schema: SchemlySchema = {
  version: '1',
  cells: {
    name: { type: 'text', label: '姓名' },
    age: { type: 'number', label: '年龄' },
    status: {
      type: 'enum',
      label: '状态',
      options: [
        { label: '启用', value: 1, color: 'success' },
        { label: '禁用', value: 0, color: 'danger' },
      ],
    },
  },
  types: {
    userTable: {
      type: 'dataTable',
      cells: ['name', 'age', 'status'],
    },
  },
}

const providers: Providers = {
  data: [
    { name: '张三', age: 28, status: 1 },
    { name: '李四', age: 32, status: 0 },
  ],
}
</script>

<template>
  <SchemlyRenderer :schema="schema" type-key="userTable" :providers="providers" />
</template>
```

## 组件

| 组件 | 说明 |
|------|------|
| `SchemlyRenderer` | 顶层渲染器，根据 `schema.types[typeKey].type` 自动分发到对应容器 |
| `SchemlyDataTable` | 数据表格，支持分页、排序、选择、行操作、内建增删改表单 |
| `SchemlyForm` | 通用表单，支持搜索、筛选、独立编辑等场景 |
| `SchemlyDescriptions` | 描述列表，适用于详情展示 |
| `SchemaFormDialog` | 表单弹窗，配合 DataTable 内建的新增/编辑操作 |
| `FormField` | 单个表单字段渲染 |
| `CellRenderer` | 单元格渲染器（展示/编辑模式） |

## Composables

| Hook | 说明 |
|------|------|
| `useCellResolver` | 解析 Cell 声明，返回计算后的 displayAs / editAs / 权限 |
| `useDictionary` | 字典数据解析，支持静态、API 动态、远程搜索三种模式 |
| `useFormDialog` | 表单弹窗状态管理 |

## 渲染器

Runtime 内置了丰富的展示渲染器和编辑渲染器：

**展示渲染器**：TextDisplay、NumberDisplay、TagDisplay、BooleanDisplay、DateDisplay、DateRangeDisplay、ImageDisplay、FileDisplay、LinkDisplay 等

**编辑渲染器**：InputEditor、NumberEditor、SelectEditor、SwitchEditor、DatePickerEditor、DateRangePickerEditor、TextareaEditor 等

渲染器映射表通过 `DISPLAY_RENDERER_MAP` 和 `EDIT_RENDERER_MAP` 导出，支持覆盖和扩展。

## Re-export

`@schemly/runtime` 会 re-export `@schemly/core` 的全部 API，因此你可以直接从 runtime 包导入 core 的类型和函数：

```ts
import { validateSchema, parseSchema, type SchemlySchema } from '@schemly/runtime'
```

## 文档

完整文档请访问 [hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/)

## 许可证

[MIT](https://github.com/hanlang123/schemly/blob/master/LICENSE)
