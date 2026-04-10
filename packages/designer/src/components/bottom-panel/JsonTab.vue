<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const jsonStr = computed(() => JSON.stringify(store.schema, null, 2))

const copied = ref(false)

const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(jsonStr.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = jsonStr.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

const downloadJson = () => {
  const blob = new Blob([jsonStr.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${store.schemaId}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="json-tab">
    <div class="json-tab__toolbar">
      <ElButton size="small" @click="copyJson">{{ copied ? '已复制' : '复制' }}</ElButton>
      <ElButton size="small" @click="downloadJson">下载</ElButton>
    </div>
    <pre class="json-tab__code">{{ jsonStr }}</pre>
  </div>
</template>

<style scoped>
.json-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-tab__toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  flex-shrink: 0;
}

.json-tab__code {
  flex: 1;
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  font-family: 'Fira Code', 'Consolas', monospace;
  overflow: auto;
  color: var(--el-text-color-regular, #606266);
  white-space: pre;
}
</style>
