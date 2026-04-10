<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExternalDeps } from '@schemly/core'

const props = defineProps<{
  deps?: ExternalDeps
}>()

const copied = ref(false)

const functionsList = computed(() => {
  if (!props.deps?.functions) return []
  return props.deps.functions.map((f) => ({
    name: f.key,
    type: f.type,
  }))
})

const permissionsList = computed(() => {
  if (!props.deps?.permissions) return []
  return props.deps.permissions.map((p) => ({
    code: p.code,
    level: p.scope,
  }))
})

const generateTemplate = () => {
  const lines: string[] = ['const providers = {']
  lines.push('  dicts: {},')

  if (functionsList.value.length > 0) {
    lines.push('  functions: {')
    for (const fn of functionsList.value) {
      lines.push(`    // ${fn.type}`)
      if (fn.type === 'remote') {
        lines.push(`    ${fn.name}: (query) => { /* TODO */ },`)
      } else if (fn.type.startsWith('upload')) {
        lines.push(`    ${fn.name}: (file) => { /* TODO */ },`)
      } else {
        lines.push(`    ${fn.name}: () => { /* TODO */ },`)
      }
    }
    lines.push('  },')
  }

  lines.push('  auth: {')
  lines.push('    hasPermission: (code) => { /* TODO */ }')
  lines.push('  }')
  lines.push('}')

  return lines.join('\n')
}

const copyTemplate = async () => {
  try {
    await navigator.clipboard.writeText(generateTemplate())
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // silent
  }
}
</script>

<template>
  <div class="deps-tab">
    <div class="deps-tab__section">
      <div class="deps-section-title">functions ({{ functionsList.length }})</div>
      <div v-if="functionsList.length === 0" class="deps-empty">无外部函数依赖</div>
      <div v-else class="deps-list">
        <div v-for="fn in functionsList" :key="fn.name" class="deps-item">
          <span class="deps-item__name">{{ fn.name }}</span>
          <ElTag size="small" type="info">{{ fn.type }}</ElTag>
        </div>
      </div>
    </div>

    <div class="deps-tab__section">
      <div class="deps-section-title">permissions ({{ permissionsList.length }})</div>
      <div v-if="permissionsList.length === 0" class="deps-empty">无权限依赖</div>
      <div v-else class="deps-list">
        <div v-for="p in permissionsList" :key="p.code" class="deps-item">
          <span class="deps-item__name">{{ p.code }}</span>
          <ElTag size="small" type="info">{{ p.level }}</ElTag>
        </div>
      </div>
    </div>

    <div class="deps-tab__footer">
      <ElButton size="small" @click="copyTemplate">{{ copied ? '已复制' : '复制 providers 模板' }}</ElButton>
    </div>
  </div>
</template>

<style scoped>
.deps-tab {
  padding: 12px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.deps-tab__section {
  min-width: 200px;
}

.deps-section-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--el-text-color-primary, #303133);
}

.deps-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
}

.deps-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deps-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.deps-item__name {
  font-family: 'Fira Code', 'Consolas', monospace;
}

.deps-tab__footer {
  width: 100%;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}
</style>
