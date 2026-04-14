# @schemly/core

> Schema 协议类型定义、校验与工具函数 — [Schemly](https://github.com/hanlang123/schemly) 核心包

[![npm version](https://img.shields.io/npm/v/@schemly/core.svg)](https://www.npmjs.com/package/@schemly/core)
[![license](https://img.shields.io/npm/l/@schemly/core.svg)](https://github.com/hanlang123/schemly/blob/master/LICENSE)

## 简介

`@schemly/core` 是 Schemly 的底层协议包，提供 Schema 的 TypeScript 类型定义、校验函数、解析工具和扩展注册表。它不依赖任何 UI 框架，可独立用于 Schema 的生成、校验与分析。

## 安装

```bash
npm install @schemly/core
# 或
pnpm add @schemly/core
```

## 核心功能

### 类型定义

提供完整的 Schema 协议类型，包括 `SchemlySchema`、`CellDeclaration`、`DataTableProps`、`FormProps`、`DescriptionsProps` 等 50+ 类型。

```ts
import type { SchemlySchema, CellDeclaration, CellType } from '@schemly/core'
```

### Schema 校验

```ts
import { validateSchema } from '@schemly/core'

const issues = validateSchema(schema)
// [{ path: 'cells.name', message: '...', severity: 'error' }]
```

### Schema 解析

```ts
import { parseSchema } from '@schemly/core'

const parsed = parseSchema(schema)
// 自动填充 displayAs / editAs 默认值，解析权限等
```

### Cell 类型与渲染器推导

支持 11 种内置 Cell 类型（`text`、`number`、`currency`、`enum`、`boolean`、`datetime`、`dateRange`、`image`、`file`、`link`、`detail`），自动推导 display/edit 渲染器：

```ts
import { resolveDisplayAs, resolveEditAs } from '@schemly/core'

resolveDisplayAs('enum')    // 'tag'
resolveEditAs('datetime')   // 'datePicker'
```

### 权限检查

```ts
import { checkCellViewPermission, checkCellEditPermission } from '@schemly/core'

checkCellViewPermission(cell, userPermissions)  // boolean
checkCellEditPermission(cell, userPermissions)  // boolean
```

### 外部依赖扫描

从 Schema 中提取所需的字典、函数、权限等外部依赖：

```ts
import { generateExternalDeps } from '@schemly/core'

const deps = generateExternalDeps(schema)
// { dictKeys: ['status', ...], functions: [...], permissions: [...] }
```

### 自定义扩展注册

```ts
import { registerCellType, registerDisplayRenderer, registerEditRenderer } from '@schemly/core'

registerCellType('address', {
  defaultDisplayAs: 'text',
  defaultEditAs: 'input',
})
```

### Schema 版本迁移

```ts
import { registerMigration, migrateSchema } from '@schemly/core'

registerMigration('1', '2', (schema) => { /* 转换逻辑 */ return schema })
const migrated = migrateSchema(schema, '2')
```

## API 一览

| 类别 | 导出 |
|------|------|
| 常量 | `DEFAULT_DISPLAY_AS` `DEFAULT_EDIT_AS` `VALID_DISPLAY_COMBINATIONS` `VALID_EDIT_COMBINATIONS` `BUILT_IN_CELL_TYPES` `OPTIONS_PREFIX` `DEFAULT_PAGINATION` `DEFAULT_SELECTION` `CURRENT_SCHEMA_VERSION` 等 |
| 解析 | `resolveDisplayAs` `resolveEditAs` `parseSchema` `parseOptionsPrefix` `resolveDictItems` `findDictLabel` `findDictColor` |
| 权限 | `normalizePermission` `mergeFieldPermission` `checkPermission` `checkCellViewPermission` `checkCellEditPermission` |
| 校验 | `validateSchema` |
| 依赖 | `generateExternalDeps` |
| 注册 | `registerCellType` `registerDisplayRenderer` `registerEditRenderer` `registerMigration` `migrateSchema` `checkVersionCompatibility` `resetRegistry` |

## 文档

完整文档请访问 [hanlang123.github.io/schemly](https://hanlang123.github.io/schemly/)

## 许可证

[MIT](https://github.com/hanlang123/schemly/blob/master/LICENSE)
