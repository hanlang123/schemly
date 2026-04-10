<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { CellType } from '@schemly/core'
import { inferFieldsFromData } from '../../utils/infer'

const props = defineProps<{
  visible: boolean
  existingKeys: string[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [fields: Array<{ key: string; label: string; cell: CellType; selected: boolean }>]
}>()

const jsonInput = ref('')
const parseError = ref('')
const inferredFields = ref<Array<{ key: string; label: string; cell: CellType; selected: boolean }>>([])

const handleParse = () => {
  parseError.value = ''
  try {
    let data = JSON.parse(jsonInput.value)
    // 如果是数组取第一个
    if (Array.isArray(data)) {
      data = data[0]
    }
    if (typeof data !== 'object' || data === null) {
      parseError.value = '请输入 JSON 对象或对象数组'
      return
    }
    inferredFields.value = inferFieldsFromData(data).map((f) => ({
      ...f,
      selected: !props.existingKeys.includes(f.key),
    }))
  } catch {
    parseError.value = 'JSON 解析失败，请检查格式'
  }
}

const selectedFields = computed(() => inferredFields.value.filter((f) => f.selected))

const handleConfirm = () => {
  emit('confirm', selectedFields.value)
  jsonInput.value = ''
  inferredFields.value = []
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="从数据推断字段"
    width="600px"
    @update:model-value="handleClose"
    destroy-on-close
  >
    <div class="infer-dialog">
      <div class="json-input-section">
        <p class="section-hint">粘贴接口返回的 JSON 数据:</p>
        <ElInput
          v-model="jsonInput"
          type="textarea"
          :rows="8"
          placeholder='{ "name": "张三", "age": 25, "createTime": "2024-01-01" }'
        />
        <div class="parse-actions">
          <ElButton size="small" type="primary" @click="handleParse" :disabled="!jsonInput.trim()">推断</ElButton>
          <span v-if="parseError" class="parse-error">{{ parseError }}</span>
        </div>
      </div>

      <div v-if="inferredFields.length > 0" class="infer-result">
        <p class="section-hint">推断结果:</p>
        <table class="infer-table">
          <thead>
            <tr>
              <th style="width: 40px"></th>
              <th>key</th>
              <th>类型</th>
              <th>label</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in inferredFields" :key="field.key" :class="{ 'is-existing': existingKeys.includes(field.key) }">
              <td>
                <ElCheckbox v-model="field.selected" size="small" />
              </td>
              <td class="field-key">{{ field.key }}</td>
              <td>
                <ElSelect v-model="field.cell" size="small" style="width: 100px">
                  <ElOption label="text" value="text" />
                  <ElOption label="number" value="number" />
                  <ElOption label="currency" value="currency" />
                  <ElOption label="enum" value="enum" />
                  <ElOption label="boolean" value="boolean" />
                  <ElOption label="datetime" value="datetime" />
                  <ElOption label="image" value="image" />
                  <ElOption label="file" value="file" />
                  <ElOption label="link" value="link" />
                </ElSelect>
              </td>
              <td>
                <ElInput v-model="field.label" size="small" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <ElButton size="small" @click="handleClose">取消</ElButton>
      <ElButton size="small" type="primary" :disabled="selectedFields.length === 0" @click="handleConfirm">
        添加选中字段 ({{ selectedFields.length }})
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.infer-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-hint {
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--el-text-color-regular, #606266);
}

.parse-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.parse-error {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}

.infer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.infer-table th {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
  font-weight: 500;
  color: var(--el-text-color-secondary, #909399);
}

.infer-table td {
  padding: 4px 8px;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}

.field-key {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-weight: 500;
}

.is-existing {
  opacity: 0.5;
}
</style>
