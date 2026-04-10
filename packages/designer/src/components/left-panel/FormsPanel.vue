<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormDialogConfig } from '@schemly/core'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const activeFormTab = ref<'create' | 'update'>('create')

// 确保 createForm / updateForm 存在
const ensureCreateForm = () => {
  if (!store.createForm) {
    store.pushUndo()
    store.createForm = {
      title: '新增',
      width: '600px',
      layout: { columns: 1, labelWidth: '80px' },
      fields: [],
    }
  }
}

const ensureUpdateForm = () => {
  if (!store.updateForm) {
    store.pushUndo()
    store.updateForm = {
      title: '编辑',
      width: '600px',
      layout: { columns: 1, labelWidth: '80px' },
      fields: [],
    }
  }
}

const removeCreateForm = () => {
  store.pushUndo()
  store.createForm = null
}

const removeUpdateForm = () => {
  store.pushUndo()
  store.updateForm = null
}

// 字段矩阵：展示每个 column 在 create/update 中的状态
const fieldMatrix = computed(() => {
  return store.columns.map((col) => {
    const inCreate = store.createForm?.fields?.includes(col.key) ?? false
    const inUpdate = store.updateForm?.fields?.includes(col.key) ?? false
    const createOverride = store.createForm?.overrides?.[col.key]
    const updateOverride = store.updateForm?.overrides?.[col.key]
    return {
      key: col.key,
      label: col.label,
      inCreate,
      inUpdate,
      createDisabled: createOverride?.disabled ?? false,
      updateDisabled: updateOverride?.disabled ?? false,
    }
  })
})

const toggleFieldInForm = (key: string, form: 'create' | 'update') => {
  store.pushUndo()
  const config = form === 'create' ? store.createForm : store.updateForm
  if (!config) return
  const idx = config.fields.indexOf(key)
  if (idx >= 0) {
    config.fields.splice(idx, 1)
  } else {
    config.fields.push(key)
  }
}

const toggleFieldDisabled = (key: string, form: 'create' | 'update') => {
  store.pushUndo()
  const config = form === 'create' ? store.createForm : store.updateForm
  if (!config) return
  if (!config.overrides) config.overrides = {}
  if (!config.overrides[key]) config.overrides[key] = {}
  config.overrides[key].disabled = !config.overrides[key].disabled
}

const updateFormConfig = (form: 'create' | 'update', field: string, value: unknown) => {
  store.pushUndo()
  const config = form === 'create' ? store.createForm : store.updateForm
  if (!config) return
  ;(config as Record<string, unknown>)[field] = value
}

const updateFormLayout = (form: 'create' | 'update', field: string, value: unknown) => {
  store.pushUndo()
  const config = form === 'create' ? store.createForm : store.updateForm
  if (!config) return
  if (!config.layout) config.layout = { columns: 1, labelWidth: '80px' }
  ;(config.layout as Record<string, unknown>)[field] = value
}
</script>

<template>
  <div class="forms-panel">
    <!-- 字段矩阵 -->
    <div class="section">
      <div class="section-title">字段配置矩阵</div>
      <table class="field-matrix">
        <thead>
          <tr>
            <th>字段</th>
            <th>新增</th>
            <th>编辑</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in fieldMatrix" :key="row.key">
            <td class="field-name">{{ row.label }}</td>
            <td class="field-check">
              <template v-if="store.createForm">
                <ElCheckbox
                  :model-value="row.inCreate"
                  @change="() => toggleFieldInForm(row.key, 'create')"
                  size="small"
                />
                <span
                  v-if="row.inCreate"
                  class="readonly-badge"
                  :class="{ 'is-active': row.createDisabled }"
                  @click="toggleFieldDisabled(row.key, 'create')"
                  title="只读"
                >
                  🔒
                </span>
              </template>
              <span v-else class="form-na">—</span>
            </td>
            <td class="field-check">
              <template v-if="store.updateForm">
                <ElCheckbox
                  :model-value="row.inUpdate"
                  @change="() => toggleFieldInForm(row.key, 'update')"
                  size="small"
                />
                <span
                  v-if="row.inUpdate"
                  class="readonly-badge"
                  :class="{ 'is-active': row.updateDisabled }"
                  @click="toggleFieldDisabled(row.key, 'update')"
                  title="只读"
                >
                  🔒
                </span>
              </template>
              <span v-else class="form-na">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 表单设置 -->
    <div class="section">
      <div class="section-title">表单设置</div>
      <div class="form-tabs">
        <button
          class="form-tab"
          :class="{ 'is-active': activeFormTab === 'create' }"
          @click="activeFormTab = 'create'"
        >
          新增
        </button>
        <button
          class="form-tab"
          :class="{ 'is-active': activeFormTab === 'update' }"
          @click="activeFormTab = 'update'"
        >
          编辑
        </button>
      </div>

      <!-- 新增表单设置 -->
      <div v-if="activeFormTab === 'create'" class="form-config">
        <div v-if="!store.createForm" class="form-enable">
          <ElButton size="small" @click="ensureCreateForm">启用新增表单</ElButton>
        </div>
        <template v-else>
          <div class="form-row">
            <span class="form-label">标题:</span>
            <ElInput :model-value="store.createForm.title" size="small" @input="(v: string) => updateFormConfig('create', 'title', v)" />
          </div>
          <div class="form-row">
            <span class="form-label">宽度:</span>
            <ElInput :model-value="store.createForm.width" size="small" @input="(v: string) => updateFormConfig('create', 'width', v)" />
          </div>
          <div class="form-row">
            <span class="form-label">列数:</span>
            <ElInputNumber :model-value="store.createForm.layout?.columns ?? 1" size="small" :min="1" :max="4" @change="(v: number) => updateFormLayout('create', 'columns', v)" />
          </div>
          <div class="form-row">
            <span class="form-label">连续新增:</span>
            <ElSwitch :model-value="store.createForm.keepAfterSubmit ?? false" @change="(v: boolean) => updateFormConfig('create', 'keepAfterSubmit', v)" />
          </div>
          <ElButton size="small" text type="danger" @click="removeCreateForm" style="margin-top: 4px">移除新增表单</ElButton>
        </template>
      </div>

      <!-- 编辑表单设置 -->
      <div v-if="activeFormTab === 'update'" class="form-config">
        <div v-if="!store.updateForm" class="form-enable">
          <ElButton size="small" @click="ensureUpdateForm">启用编辑表单</ElButton>
        </div>
        <template v-else>
          <div class="form-row">
            <span class="form-label">标题:</span>
            <ElInput :model-value="store.updateForm.title" size="small" @input="(v: string) => updateFormConfig('update', 'title', v)" />
          </div>
          <div class="form-row">
            <span class="form-label">宽度:</span>
            <ElInput :model-value="store.updateForm.width" size="small" @input="(v: string) => updateFormConfig('update', 'width', v)" />
          </div>
          <div class="form-row">
            <span class="form-label">列数:</span>
            <ElInputNumber :model-value="store.updateForm.layout?.columns ?? 1" size="small" :min="1" :max="4" @change="(v: number) => updateFormLayout('update', 'columns', v)" />
          </div>
          <ElButton size="small" text type="danger" @click="removeUpdateForm" style="margin-top: 4px">移除编辑表单</ElButton>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forms-panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary, #909399);
  margin-bottom: 6px;
}

.field-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.field-matrix th {
  text-align: left;
  padding: 4px 6px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  font-weight: 500;
  color: var(--el-text-color-secondary, #909399);
}

.field-matrix td {
  padding: 4px 6px;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}

.field-name {
  font-weight: 500;
}

.field-check {
  display: flex;
  align-items: center;
  gap: 2px;
}

.form-na {
  color: var(--el-text-color-placeholder, #a8abb2);
}

.readonly-badge {
  cursor: pointer;
  opacity: 0.3;
  font-size: 11px;
}

.readonly-badge.is-active {
  opacity: 1;
}

.form-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.form-tab {
  padding: 4px 12px;
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.15s;
}

.form-tab.is-active {
  background: var(--el-color-primary-light-9, #ecf5ff);
  border-color: var(--el-color-primary, #409eff);
  color: var(--el-color-primary, #409eff);
}

.form-config {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
  min-width: 60px;
}

.form-enable {
  padding: 12px;
  text-align: center;
}
</style>
