# 版本迁移策略

## 版本号格式

`major.minor`，如 `"1.0"` / `"1.1"` / `"2.0"`。

## 兼容规则

- **minor 升级**（1.0 → 1.1）：向后兼容，新增字段使用默认值
- **major 升级**（1.0 → 2.0）：不兼容，需要迁移

## Runtime 行为

```
加载 schema 时检查 version:
├── major 一致 → 正常渲染
├── major 低于 Runtime → 自动迁移（调用迁移函数）
├── major 高于 Runtime → 报错，提示升级
└── version 缺失 → 视为 "1.0"
```

## 迁移函数注册

```typescript
import { registerMigration } from '@schemly/core'

registerMigration('1.0', '2.0', (schema) => {
  return transformedSchema
})
```

链式调用：`1.0 → 1.1 → 2.0`。现阶段只定义机制，不实现实际迁移。
