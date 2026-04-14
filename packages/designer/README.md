# @schemly/designer

> Schema 可视化编辑器 — [Schemly](https://github.com/hanlang123/schemly) 设计器

[![npm version](https://img.shields.io/npm/v/@schemly/designer.svg)](https://www.npmjs.com/package/@schemly/designer)
[![license](https://img.shields.io/npm/l/@schemly/designer.svg)](https://github.com/hanlang123/schemly/blob/master/LICENSE)

## 简介

`@schemly/designer` 提供一个面向开发者的 Schema 可视化编辑器组件，替代手写 JSON，支持实时预览与校验。通过拖拽、表单配置的方式快速产出符合 Schemly 协议的 Schema，再交由 `@schemly/runtime` 消费渲染。

## 安装

```bash
npm install @schemly/designer @schemly/runtime element-plus vue pinia
# 或
pnpm add @schemly/designer @schemly/runtime element-plus vue pinia
```

## 快速开始

```vue
<script setup lang="ts">
import { SchemlyDesigner, useDesignerStore } from '@schemly/designer'
import '@schemly/designer/style.css'

const store = useDesignerStore()

function handleExport() {
  const schema = store.buildSchema()
  console.log(JSON.stringify(schema, null, 2))
}
</script>

<template>
  <SchemlyDesigner />
  <button @click="handleExport">导出 Schema</button>
</template>
```

> 使用前请确保已安装并注册 Element Plus 和 Pinia。

## 组件

### SchemlyDesigner

主设计器组件，提供完整的可视化编辑界面，包括：

- **左侧面板** — Cell 类型选择与字段列表管理
- **中间画布** — 实时预览渲染效果
- **右侧面板** — 字段属性配置（类型、展示/编辑渲染器、权限、校验规则等）
- **底部面板** — Schema JSON 输出与校验结果

### useDesignerStore

基于 Pinia 的设计器状态管理，核心方法：

| 方法 | 说明 |
|------|------|
| `buildSchema()` | 从当前设计器状态构建完整的 `SchemlySchema` |
| `loadSchema(schema)` | 加载已有的 Schema 到设计器进行编辑 |
| `validateSchema()` | 校验当前 Schema 的合法性 |
| `generateExternalDeps()` | 扫描当前 Schema 所需的外部依赖 |
| `undo()` / `redo()` | 撤销 / 重做 |

## 功能特性

- **字段管理** — 添加、删除、排序、复制字段
- **类型推断** — 从样例数据自动推断字段 Cell 类型
- **字典编辑** — 内联编辑静态字典项
- **权限配置** — 可视化配置 Cell 级查看/编辑权限
- **实时校验** — 编辑过程中实时校验 Schema 合法性
- **导入导出** — 支持 JSON 导入导出
- **撤销重做** — 完整的操作历史

## 样式

Designer 自带样式文件，需要手动引入：

```ts
import '@schemly/designer/style.css'
```

## 文档

完整文档请访问 [hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/)

## 许可证

[MIT](https://github.com/hanlang123/schemly/blob/master/LICENSE)
