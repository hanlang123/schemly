<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  import: [schema: unknown]
}>()

const jsonInput = ref('')
const parseError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const handlePaste = () => {
  parseError.value = ''
  try {
    const data = JSON.parse(jsonInput.value)
    emit('import', data)
    jsonInput.value = ''
    emit('update:visible', false)
  } catch {
    parseError.value = 'JSON 解析失败'
  }
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      emit('import', data)
      emit('update:visible', false)
    } catch {
      parseError.value = 'JSON 文件解析失败'
    }
  }
  reader.readAsText(file)
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    title="导入 Schema"
    width="500px"
    @update:model-value="handleClose"
    destroy-on-close
  >
    <div class="import-dialog">
      <div class="import-section">
        <p class="section-title">从文件导入</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="handleFileUpload"
        />
        <ElButton size="small" @click="fileInput?.click()">选择 JSON 文件</ElButton>
      </div>

      <ElDivider>或</ElDivider>

      <div class="import-section">
        <p class="section-title">从剪贴板导入</p>
        <ElInput
          v-model="jsonInput"
          type="textarea"
          :rows="8"
          placeholder="粘贴 JSON..."
        />
        <div class="paste-actions">
          <ElButton size="small" type="primary" @click="handlePaste" :disabled="!jsonInput.trim()">导入</ElButton>
          <span v-if="parseError" class="parse-error">{{ parseError }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton size="small" @click="handleClose">取消</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.import-dialog {
  display: flex;
  flex-direction: column;
}

.import-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
}

.paste-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.parse-error {
  font-size: 12px;
  color: var(--el-color-danger, #f56c6c);
}
</style>
