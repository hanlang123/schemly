# 自定义扩展

Schemly 支持注册自定义 Cell 类型、展示渲染器和编辑渲染器，轻松扩展业务组件。

## 注册自定义 cell type

```javascript
import { registerCellType } from 'schemly'

registerCellType('employee', {
  defaultDisplayAs: 'employeeCard',
  defaultEditAs: 'employeeSelect'
})
```

## 注册自定义展示渲染器

```javascript
import { registerDisplayRenderer } from 'schemly'

registerDisplayRenderer('employeeCard', (value, cellProps, row) => {
  return h('div', { class: 'employee-card' }, [
    h('img', { src: row[cellProps.avatarKey] }),
    h('span', value)
  ])
})
```

## 注册自定义编辑渲染器

```javascript
import { registerEditRenderer } from 'schemly'

registerEditRenderer('employeeSelect', (modelValue, cellProps, onChange) => {
  return h(EmployeeSelectComponent, { modelValue, onChange, ...cellProps })
})
```

## 在 Schema 中使用

```json
{
  "key": "manager",
  "label": "部门经理",
  "cell": "employee",
  "cellProps": { "avatarKey": "managerAvatar" }
}
```

注册后，自定义 Cell 类型与内置类型享有相同的待遇：自动双模态派生、合法性校验、Designer 支持等。
