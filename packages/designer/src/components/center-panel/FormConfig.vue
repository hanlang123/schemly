<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useDesignerStore } from '../../store/designer'
import { generateMockValue } from '../../utils/mock'
// @ts-ignore
import { FormField } from '@schemly/runtime'
import type { Providers } from '@schemly/core'

const props = defineProps<{
  mockData?: unknown
  providers?: Providers
}>()

const store = useDesignerStore()

const selectField = (key: string) => {
  store.selectedFieldKey = key
}

const clearSelection = () => {
  store.selectedFieldKey = null
}

const defaultProviders: Providers = {
  auth: { hasPermission: () => true },
}

const effectiveProviders = computed(() => ({
  ...defaultProviders,
  ...(props.providers ?? {}),
}))

// mock 表单数据
const formData = reactive<Record<string, unknown>>({})

const initMockData = () => {
  const external = props.mockData as Record<string, unknown> | undefined
  for (const field of store.formFields) {
    if (external && external[field.key] !== undefined) {
      formData[field.key] = external[field.key]
    } else {
      formData[field.key] = generateMockValue(field.cell, field.key, 0)
    }
  }
}

initMockData()
watch(() => store.formFields.length, initMockData)
</script>

<template>
  <div class="form-config" @click.self="clearSelection">
    <!-- 全局配置 -->
    <div class="config-section">
      <div class="config-row">
        <span class="config-label">列数:</span>
        <ElInputNumber v-model="store.formLayout.columns" size="small" :min="1" :max="4" style="width: 100px" />
      </div>
      <div class="config-row">
        <span class="config-label">标签宽度:</span>
        <ElInput v-model="store.formLayout.labelWidth" size="small" style="width: 100px" />
      </div>
      <div class="config-row">
        <span class="config-label">标签位置:</span>
        <ElSelect v-model="store.formLayout.labelPosition" size="small" style="width: 100px">
          <ElOption label="left" value="left" />
          <ElOption label="right" value="right" />
          <ElOption label="top" value="top" />
        </ElSelect>
      </div>
      <div class="config-row">
        <span class="config-label">可折叠:</span>
        <ElSwitch v-model="store.formLayout.collapsible" />
      </div>
      <template v-if="store.formLayout.collapsible">
        <div class="config-row">
          <span class="config-label">默认折叠:</span>
          <ElSwitch v-model="store.formLayout.defaultCollapsed" />
        </div>
        <div class="config-row">
          <span class="config-label">显示行数:</span>
          <ElInputNumber v-model="store.formLayout.visibleRows" size="small" :min="1" :max="10" style="width: 100px" />
        </div>
      </template>
    </div>

    <ElDivider style="margin: 12px 0" />

    <!-- 表单预览 -->
    <div class="form-preview">
      <ElForm
        :label-width="store.formLayout.labelWidth || '100px'"
        :label-position="store.formLayout.labelPosition || 'right'"
        size="default"
      >
        <ElRow :gutter="16">
          <ElCol
            v-for="field in store.formFields"
            :key="field.key"
            :span="Math.floor(24 / (store.formLayout.columns ?? 1)) * (field.span ?? 1)"
          >
            <ElFormItem
              :label="field.label"
              class="preview-form-item"
              :class="{ 'is-selected': store.selectedFieldKey === field.key }"
              @click.stop="selectField(field.key)"
            >
              <FormField
                :cell="field"
                :model-value="formData[field.key]"
                :schema-dicts="store.dicts"
                :providers="effectiveProviders"
                :disabled="field.disabled ?? false"
                @update:model-value="(val: unknown) => { formData[field.key] = val }"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <p class="hint-text">点击表单字段可选中，右侧面板显示配置</p>
  </div>
</template>

<style scoped>
.form-config {
  min-height: 100%;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-label {
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  white-space: nowrap;
  min-width: 70px;
}

.form-preview {
  margin-top: 8px;
  padding: 16px;
  border: 1px dashed var(--el-border-color-light, #e4e7ed);
  border-radius: 4px;
}

.preview-form-item {
  cursor: pointer;
  transition: outline 0.15s;
  border-radius: 4px;
  padding: 4px;
}

.preview-form-item.is-selected {
  outline: 2px solid var(--el-color-primary, #409eff);
  outline-offset: 2px;
}

.hint-text {
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  margin-top: 12px;
}
</style>
