<script setup lang="ts">
import { computed } from 'vue'
import type { CellType, DisplayAs, EditAs } from '@schemly/core'
import {
  BUILT_IN_CELL_TYPES,
  VALID_DISPLAY_COMBINATIONS,
  VALID_EDIT_COMBINATIONS,
  DEFAULT_DISPLAY_AS,
  DEFAULT_EDIT_AS,
} from '@schemly/core'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const field = computed(() => store.selectedField!)

const cellTypeOptions = BUILT_IN_CELL_TYPES.map((t) => ({ label: t, value: t }))

const validDisplayOptions = computed(() => {
  const cellType = field.value.cell as CellType
  const valid = VALID_DISPLAY_COMBINATIONS[cellType] ?? []
  return valid.map((v) => ({ label: v, value: v }))
})

const validEditOptions = computed(() => {
  const cellType = field.value.cell as CellType
  const valid = VALID_EDIT_COMBINATIONS[cellType] ?? []
  return valid.map((v) => ({ label: v, value: v }))
})

const effectiveDisplayAs = computed(() => {
  return field.value.displayAs ?? DEFAULT_DISPLAY_AS[field.value.cell as CellType] ?? 'text'
})

const effectiveEditAs = computed(() => {
  return field.value.editAs ?? DEFAULT_EDIT_AS[field.value.cell as CellType] ?? 'input'
})

const updateFieldProp = (key: string, value: unknown) => {
  store.updateField(field.value.key, { [key]: value })
}

const updateCellProps = (propKey: string, value: unknown) => {
  const current = field.value.cellProps ?? {}
  store.updateField(field.value.key, {
    cellProps: { ...current, [propKey]: value },
  })
}

const updateColumnProp = (propKey: string, value: unknown) => {
  const current = field.value.column ?? {}
  store.updateField(field.value.key, {
    column: { ...current, [propKey]: value },
  })
}

const updatePermission = (permKey: string, value: unknown) => {
  const current = typeof field.value.permission === 'object' ? (field.value.permission ?? {}) : {}
  store.updateField(field.value.key, {
    permission: { ...current, [permKey]: value },
  })
}

const permissionObj = computed(() => {
  const p = field.value.permission
  if (!p || typeof p === 'string') return {} as import('@schemly/core').CellPermission
  return p
})

const goBack = () => {
  store.selectedFieldKey = null
}

// options 来源判断
const optionsSource = computed(() => {
  const opts = field.value.cellProps?.options as string | undefined
  if (!opts) return 'none'
  if (opts.startsWith('dict:')) return 'dict'
  if (opts.startsWith('api:')) return 'api'
  if (opts.startsWith('remote:')) return 'remote'
  return 'none'
})

const dictKeys = computed(() => Object.keys(store.dicts))
</script>

<template>
  <div class="field-config-panel">
    <div class="panel-header">
      <ElButton text type="primary" size="small" @click="goBack">← 返回</ElButton>
      <span class="panel-title">字段: {{ field.key }}</span>
    </div>

    <!-- 基础信息 -->
    <ElCollapse model-value="basic">
      <ElCollapseItem title="基础信息" name="basic">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">key:</span>
            <ElInput :model-value="field.key" size="small" @input="(v: string) => updateFieldProp('key', v)" />
          </div>
          <div class="config-row">
            <span class="config-label">label:</span>
            <ElInput :model-value="field.label" size="small" @input="(v: string) => updateFieldProp('label', v)" />
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- Cell 配置 -->
    <ElCollapse model-value="cell">
      <ElCollapseItem title="Cell 配置" name="cell">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">类型:</span>
            <ElSelect :model-value="field.cell" size="small" @change="(v: string) => updateFieldProp('cell', v)">
              <ElOption v-for="opt in cellTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </ElSelect>
          </div>

          <!-- enum 特殊配置 -->
          <template v-if="field.cell === 'enum'">
            <div class="config-row">
              <span class="config-label">options 来源:</span>
              <ElRadioGroup :model-value="optionsSource" size="small" @change="(v: string) => {
                if (v === 'dict') updateCellProps('options', 'dict:' + (dictKeys[0] || 'dictName'))
                else if (v === 'api') updateCellProps('options', 'api:fetchList')
                else if (v === 'remote') updateCellProps('options', 'remote:searchFn')
                else updateCellProps('options', undefined)
              }">
                <ElRadio value="dict">静态字典</ElRadio>
                <ElRadio value="api">动态接口</ElRadio>
                <ElRadio value="remote">远程搜索</ElRadio>
              </ElRadioGroup>
            </div>
            <div v-if="optionsSource === 'dict'" class="config-row">
              <span class="config-label">字典:</span>
              <ElSelect
                :model-value="(field.cellProps?.options as string)?.replace('dict:', '')"
                size="small"
                @change="(v: string) => updateCellProps('options', 'dict:' + v)"
              >
                <ElOption v-for="dk in dictKeys" :key="dk" :label="dk" :value="dk" />
              </ElSelect>
            </div>
            <div v-if="optionsSource === 'api'" class="config-row">
              <span class="config-label">函数名:</span>
              <ElInput
                :model-value="(field.cellProps?.options as string)?.replace('api:', '')"
                size="small"
                @input="(v: string) => updateCellProps('options', 'api:' + v)"
              />
            </div>
            <div v-if="optionsSource === 'remote'" class="config-row">
              <span class="config-label">函数名:</span>
              <ElInput
                :model-value="(field.cellProps?.options as string)?.replace('remote:', '')"
                size="small"
                @input="(v: string) => updateCellProps('options', 'remote:' + v)"
              />
            </div>
          </template>

          <!-- currency 特殊配置 -->
          <template v-if="field.cell === 'currency'">
            <div class="config-row">
              <span class="config-label">精度:</span>
              <ElInputNumber :model-value="(field.cellProps as any)?.precision ?? 2" size="small" :min="0" :max="6" @change="(v: number) => updateCellProps('precision', v)" />
            </div>
            <div class="config-row">
              <span class="config-label">货币符号:</span>
              <ElInput :model-value="(field.cellProps as any)?.prefix ?? '¥'" size="small" style="width: 60px" @input="(v: string) => updateCellProps('prefix', v)" />
            </div>
          </template>

          <!-- datetime 特殊配置 -->
          <template v-if="field.cell === 'datetime'">
            <div class="config-row">
              <span class="config-label">格式:</span>
              <ElInput :model-value="(field.cellProps as any)?.format ?? 'YYYY-MM-DD'" size="small" @input="(v: string) => updateCellProps('format', v)" />
            </div>
          </template>

          <!-- image 特殊配置 -->
          <template v-if="field.cell === 'image'">
            <div class="config-row">
              <span class="config-label">多图:</span>
              <ElSwitch :model-value="(field.cellProps as any)?.multiple ?? false" @change="(v: boolean) => updateCellProps('multiple', v)" />
            </div>
            <div class="config-row">
              <span class="config-label">缩略图宽:</span>
              <ElInputNumber :model-value="(field.cellProps as any)?.width ?? 60" size="small" @change="(v: number) => updateCellProps('width', v)" />
            </div>
            <div class="config-row">
              <span class="config-label">缩略图高:</span>
              <ElInputNumber :model-value="(field.cellProps as any)?.height ?? 60" size="small" @change="(v: number) => updateCellProps('height', v)" />
            </div>
          </template>

          <!-- displayAs / editAs 覆盖 -->
          <ElDivider style="margin: 8px 0" />
          <div class="config-row">
            <span class="config-label">displayAs:</span>
            <ElSelect :model-value="effectiveDisplayAs" size="small" @change="(v: string) => updateFieldProp('displayAs', v)">
              <ElOption v-for="opt in validDisplayOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </ElSelect>
          </div>
          <div class="config-row">
            <span class="config-label">editAs:</span>
            <ElSelect :model-value="effectiveEditAs" size="small" @change="(v: string) => updateFieldProp('editAs', v)">
              <ElOption v-for="opt in validEditOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </ElSelect>
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 列配置 (DataTable) -->
    <ElCollapse v-if="store.schemaType === 'DataTable'">
      <ElCollapseItem title="列配置" name="column">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">宽度:</span>
            <ElInputNumber :model-value="field.column?.width" size="small" :min="0" placeholder="auto" @change="(v: number | undefined) => updateColumnProp('width', v)" />
          </div>
          <div class="config-row">
            <span class="config-label">最小宽度:</span>
            <ElInputNumber :model-value="field.column?.minWidth" size="small" :min="0" @change="(v: number | undefined) => updateColumnProp('minWidth', v)" />
          </div>
          <div class="config-row">
            <span class="config-label">固定:</span>
            <ElSelect :model-value="field.column?.fixed || ''" size="small" clearable @change="(v: string) => updateColumnProp('fixed', v || undefined)">
              <ElOption label="无" value="" />
              <ElOption label="left" value="left" />
              <ElOption label="right" value="right" />
            </ElSelect>
          </div>
          <div class="config-row">
            <span class="config-label">对齐:</span>
            <ElSelect :model-value="field.column?.align || 'left'" size="small" @change="(v: string) => updateColumnProp('align', v)">
              <ElOption label="left" value="left" />
              <ElOption label="center" value="center" />
              <ElOption label="right" value="right" />
            </ElSelect>
          </div>
          <div class="config-row">
            <span class="config-label">可排序:</span>
            <ElSwitch :model-value="field.column?.sortable ?? false" @change="(v: boolean) => updateColumnProp('sortable', v)" />
          </div>
          <div class="config-row">
            <span class="config-label">可调宽:</span>
            <ElSwitch :model-value="field.column?.resizable ?? true" @change="(v: boolean) => updateColumnProp('resizable', v)" />
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 权限配置 -->
    <ElCollapse>
      <ElCollapseItem title="权限配置" name="permission">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">查看权限:</span>
            <ElSwitch :model-value="!!permissionObj.view" @change="(v: boolean) => updatePermission('view', v ? 'view:code' : undefined)" />
          </div>
          <div v-if="permissionObj.view && typeof permissionObj.view === 'string'" class="config-row">
            <span class="config-label">权限码:</span>
            <ElInput :model-value="permissionObj.view as string" size="small" @input="(v: string) => updatePermission('view', v)" />
          </div>
          <div class="config-row">
            <span class="config-label">编辑权限:</span>
            <ElSwitch :model-value="!!permissionObj.edit" @change="(v: boolean) => updatePermission('edit', v ? 'edit:code' : undefined)" />
          </div>
          <div v-if="permissionObj.edit && typeof permissionObj.edit === 'string'" class="config-row">
            <span class="config-label">权限码:</span>
            <ElInput :model-value="permissionObj.edit as string" size="small" @input="(v: string) => updatePermission('edit', v)" />
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<style scoped>
.field-config-panel {
  padding: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.panel-title {
  font-weight: 600;
  font-size: 13px;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-label {
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
  min-width: 70px;
}
</style>
