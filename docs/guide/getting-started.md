# 快速开始

## 安装

Schemly 采用 monorepo 架构，按需安装对应的包：

```bash
# 安装运行时（用于渲染 Schema）
pnpm add @schemly/runtime

# 安装设计器（用于可视化编辑 Schema）
pnpm add @schemly/designer

# 核心包会作为依赖自动安装
```

### 前置依赖

确保项目中已安装以下 peer dependencies：

```bash
pnpm add vue@^3.5 element-plus@^2.9
```

## 基础用法

### 1. 定义 Schema

创建一个 Schema JSON 文件，描述你需要渲染的组件：

```json
{
  "version": "1.0",
  "id": "user-table",
  "name": "用户列表",
  "type": "DataTable",
  "props": {
    "columns": [
      { "key": "name", "label": "姓名", "cell": "text" },
      { "key": "age", "label": "年龄", "cell": "number" },
      { "key": "email", "label": "邮箱", "cell": "text", "displayAs": "copy" },
      {
        "key": "status",
        "label": "状态",
        "cell": "enum",
        "cellProps": { "options": "dict:userStatus" },
        "displayAs": "tag"
      }
    ],
    "pagination": { "enabled": true, "pageSize": 20 }
  },
  "dicts": {
    "userStatus": [
      { "label": "正常", "value": "active", "color": "success" },
      { "label": "禁用", "value": "disabled", "color": "danger" }
    ]
  }
}
```

### 2. 使用 SchemlyRenderer 渲染

```vue
<template>
  <SchemlyRenderer
    :schema="schema"
    :data="tableData"
    :providers="providers"
    :loading="loading"
    @action="onAction"
    @page-change="onPageChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { SchemlyRenderer } from '@schemly/runtime'
import schema from './schemas/user-table.json'

const tableData = ref([])
const loading = ref(false)

const providers = {
  auth: {
    hasPermission: (code) => true // 根据实际业务实现
  }
}

const onAction = ({ key, row }) => {
  console.log('操作:', key, row)
}

const onPageChange = ({ page, pageSize }) => {
  // 重新请求分页数据
}
</script>
```

### 3. 使用 Designer 编辑

```vue
<template>
  <SchemlyDesigner
    :schema="schema"
    :mock-data="mockData"
    @save="onSave"
  />
</template>

<script setup>
import { SchemlyDesigner } from '@schemly/designer'

const schema = ref(null) // null 表示新建
const mockData = ref([
  { name: '张三', age: 28, email: 'zhangsan@example.com', status: 'active' },
  { name: '李四', age: 35, email: 'lisi@example.com', status: 'disabled' },
])

const onSave = ({ schema }) => {
  // 保存到后端或本地
  console.log(JSON.stringify(schema, null, 2))
}
</script>
```

## 下一步

- 了解 [Schema 顶层结构](/schema/top-level) 的完整字段
- 深入学习 [Cell 体系](/schema/cell)
- 查看 [完整示例](/reference/examples)
