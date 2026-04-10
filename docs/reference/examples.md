# 完整 Schema 示例

## 订单列表表格

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

## 订单搜索表单

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
    "layout": {
      "columns": 3,
      "labelWidth": "80px",
      "collapsible": true,
      "defaultCollapsed": true,
      "visibleRows": 1
    },
    "fields": [
      { "key": "keyword", "label": "关键词", "cell": "text", "cellProps": { "placeholder": "订单号 / 客户名" } },
      { "key": "status", "label": "状态", "cell": "enum", "cellProps": { "options": "dict:orderStatus" } },
      { "key": "dateRange", "label": "创建日期", "cell": "dateRange", "cellProps": { "startKey": "startDate", "endKey": "endDate" } }
    ],
    "buttons": { "submitText": "搜索", "resetText": "重置", "showReset": true }
  }
}
```

## 订单详情

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

## 业务页面组装

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
