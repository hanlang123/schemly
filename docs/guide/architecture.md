# 工程架构

## Monorepo 架构

Schemly 采用 pnpm workspace 管理，包含四个包：

| 包 | 职责 | 发布 |
|---|------|------|
| `@schemly/core` | 类型、常量、解析引擎、校验、迁移 | ✅ |
| `@schemly/runtime` | SchemlyRenderer、Cell 渲染器、composables | ✅ |
| `@schemly/designer` | SchemlyDesigner、配置面板 | ✅ |
| `playground` | 开发调试、示例演示 | ❌ |

### 依赖关系

```
playground → designer → runtime → core
                     → core
```

## 构建策略

| 包 | 工具 | 输出 |
|---|---|---|
| core | unbuild | ESM + CJS + d.ts，零依赖 |
| runtime | vite lib mode | ESM + CJS + d.ts，externalize vue / element-plus |
| designer | vite lib mode | ESM + CJS + d.ts |
| playground | vite app mode | SPA |

`vue` 和 `element-plus` 作为 peerDependencies。

## 开发顺序

```
Phase 1: core（类型 → 常量 → 解析器 → 校验器）
Phase 2: runtime（cells → composables → components）+ playground
Phase 3: designer（状态管理 → 配置面板 → 预览）
Phase 4: 完善（迁移、测试、文档）
```

## 技术栈

- **Vue 3** — 渲染框架
- **Element Plus** — UI 组件库
- **TypeScript** — 类型安全
- **Vite** — 构建工具
- **Vitest** — 单元测试
- **pnpm** — 包管理
