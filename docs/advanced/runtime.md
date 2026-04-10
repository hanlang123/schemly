# Runtime 接口

## SchemlyRenderer

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

### Props

| prop | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `schema` | object | ✅ | — | Schema JSON |
| `data` | array / object | ❌ | — | 数据（DataTable 数组，Descriptions 对象，Form 对象或不传） |
| `providers` | object | ❌ | `{}` | 外部依赖注入 |
| `loading` | boolean | ❌ | `false` | 加载状态 |
| `emptyText` | string | ❌ | `"暂无数据"` | 空状态文案 |
| `emptyImage` | string | ❌ | — | 空状态图片 URL |

### Events（DataTable）

| event | payload | 触发场景 |
|---|---|---|
| `action` | `{ key, row }` | 行操作（非 trigger、非 batch） |
| `action` | `{ key, rows }` | 批量操作（batch: true） |
| `createSubmit` | `{ values }` | createForm 提交 |
| `updateSubmit` | `{ values, row }` | updateForm 提交 |
| `sort-change` | `{ key, order }` | 列头排序，order: `"ascending"` / `"descending"` / `null` |
| `page-change` | `{ page, pageSize }` | 分页变化 |
| `selection-change` | `{ rows }` | 行选择变化 |
| `denied` | `{ permission }` | Type 级权限不足 |

### Events（Form）

| event | payload | 触发场景 |
|---|---|---|
| `submit` | `{ values }` | 表单提交 |
| `reset` | `{}` | 表单重置 |

### Events（Descriptions）

无事件。

## providers 完整结构

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

### 命名空间

| 命名空间 | 说明 |
|----------|------|
| `dicts` | 静态字典数据 |
| `functions` | 所有注入函数，签名由 `externalDeps.functions` 中的 `type` 约定 |
| `auth` | 权限校验 |
| `actionControl` | 行操作动态控制（可选） |
| `toolbarControl` | 工具栏操作动态控制（可选） |
| `formatters` | 自定义格式化（可选） |
