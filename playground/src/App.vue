<script setup lang="ts">
import { ref } from 'vue'
import { SchemlyRenderer } from '@schemly/runtime'
import { SchemlyDesigner } from '@schemly/designer'
import type { SchemlySchema, Providers } from '@schemly/core'

const activeTab = ref('designer')

const tableSchema: SchemlySchema = {
  version: '1.0',
  id: 'order-table',
  name: '订单列表',
  type: 'DataTable',
  dicts: {
    orderStatus: [
      { label: '待处理', value: 'pending', color: 'warning' },
      { label: '已完成', value: 'done', color: 'success' },
      { label: '已取消', value: 'cancelled', color: 'info' },
    ],
  },
  props: {
    columns: [
      { key: 'orderNo', label: '订单号', cell: 'text', displayAs: 'copy', column: { width: 180, fixed: 'left' } },
      { key: 'amount', label: '金额', cell: 'currency', column: { sortable: true, align: 'right' } },
      { key: 'status', label: '状态', cell: 'enum', cellProps: { options: 'dict:orderStatus' }, displayAs: 'tag' },
      { key: 'createTime', label: '创建时间', cell: 'datetime', cellProps: { format: 'YYYY-MM-DD' }, column: { sortable: true } },
    ],
    pagination: { enabled: true, pageSize: 10 },
    selection: { enabled: true, rowKey: 'id' },
    toolbarActions: [
      { key: 'create', label: '新增', trigger: 'createForm' },
    ],
    rowActions: [
      { key: 'view', label: '查看' },
      { key: 'edit', label: '编辑', trigger: 'updateForm' },
      { key: 'delete', label: '删除', danger: true, confirm: '确认删除？' },
    ],
    createForm: {
      title: '新增订单',
      width: '600px',
      layout: { columns: 1, labelWidth: '80px' },
      fields: ['amount', 'status'],
      rules: {
        amount: [{ required: true, message: '请输入金额' }],
        status: [{ required: true, message: '请选择状态' }],
      },
    },
    updateForm: {
      title: '编辑订单',
      width: '600px',
      layout: { columns: 1, labelWidth: '80px' },
      fields: ['orderNo', 'amount', 'status'],
      overrides: { orderNo: { disabled: true } },
      rules: { amount: [{ required: true, message: '请输入金额' }] },
    },
  },
}

const descSchema: SchemlySchema = {
  version: '1.0',
  id: 'order-detail',
  name: '订单详情',
  type: 'Descriptions',
  dicts: {
    orderStatus: [
      { label: '待处理', value: 'pending', color: 'warning' },
      { label: '已完成', value: 'done', color: 'success' },
    ],
  },
  props: {
    column: 2,
    items: [
      { key: 'orderNo', label: '订单号', cell: 'text', displayAs: 'copy' },
      { key: 'amount', label: '金额', cell: 'currency' },
      { key: 'status', label: '状态', cell: 'enum', cellProps: { options: 'dict:orderStatus' }, displayAs: 'tag' },
      { key: 'createTime', label: '创建时间', cell: 'datetime', cellProps: { format: 'YYYY-MM-DD HH:mm' } },
    ],
  },
}

const tableData = ref([
  { id: 1, orderNo: 'ORD-001', amount: 9999.5, status: 'pending', createTime: '2024-03-01' },
  { id: 2, orderNo: 'ORD-002', amount: 1234, status: 'done', createTime: '2024-03-02' },
  { id: 3, orderNo: 'ORD-003', amount: 5678.9, status: 'cancelled', createTime: '2024-03-03' },
])

const detailData = ref({
  orderNo: 'ORD-001',
  amount: 9999.5,
  status: 'pending',
  createTime: '2024-03-01T10:30:00',
})

const providers: Providers = {
  auth: { hasPermission: () => true },
}

const loading = ref(false)

const onAction = (payload: any) => {
  console.log('action:', payload)
}
const onCreateSubmit = (payload: any) => {
  console.log('createSubmit:', payload)
}
const onUpdateSubmit = (payload: any) => {
  console.log('updateSubmit:', payload)
}

const onDesignerSave = (payload: { schema: SchemlySchema }) => {
  console.log('designer save:', payload.schema)
}

const onDesignerChange = (payload: { schema: SchemlySchema }) => {
  // console.log('designer change:', payload.schema)
}
</script>

<template>
  <div class="app-root">
    <div class="app-tabs">
      <button
        class="app-tab"
        :class="{ 'is-active': activeTab === 'designer' }"
        @click="activeTab = 'designer'"
      >
        Designer
      </button>
      <button
        class="app-tab"
        :class="{ 'is-active': activeTab === 'runtime' }"
        @click="activeTab = 'runtime'"
      >
        Runtime
      </button>
    </div>

    <!-- Designer -->
    <div v-if="activeTab === 'designer'" class="designer-container">
      <SchemlyDesigner
        :schema="tableSchema"
        :mock-data="tableData"
        :providers="providers"
        @save="onDesignerSave"
        @change="onDesignerChange"
      />
    </div>

    <!-- Runtime -->
    <div v-if="activeTab === 'runtime'" class="runtime-container">
      <h1>Schemly Playground</h1>

      <h2 style="margin-top: 24px">DataTable</h2>
      <SchemlyRenderer
        :schema="tableSchema"
        :data="tableData"
        :providers="providers"
        :loading="loading"
        @action="onAction"
        @create-submit="onCreateSubmit"
        @update-submit="onUpdateSubmit"
      />

      <h2 style="margin-top: 48px">Descriptions</h2>
      <SchemlyRenderer
        :schema="descSchema"
        :data="detailData"
        :providers="providers"
      />
    </div>
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>

<style scoped>
.app-root {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  background: #fff;
}

.app-tab {
  padding: 10px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.app-tab:hover {
  color: #409eff;
}

.app-tab.is-active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: 500;
}

.designer-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.runtime-container {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: auto;
}
</style>
