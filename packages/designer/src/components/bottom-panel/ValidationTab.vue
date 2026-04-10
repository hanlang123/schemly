<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const issues = computed(() => store.validationIssues)

const severityIcon = (severity: string) => {
  switch (severity) {
    case 'error': return '❌'
    case 'warning': return '⚠️'
    default: return 'ℹ️'
  }
}

const handleClickIssue = (issue: { path?: string }) => {
  // 如果 issue 的 path 指向某个字段，可以定位到该字段
  if (issue.path) {
    const match = issue.path.match(/columns\.(\w+)|fields\.(\w+)|items\.(\w+)/)
    if (match) {
      const key = match[1] || match[2] || match[3]
      store.selectedFieldKey = key
    }
  }
}
</script>

<template>
  <div class="validation-tab">
    <div v-if="issues.length === 0" class="validation-ok">
      <span class="ok-icon">✅</span>
      <span>所有配置均合法</span>
    </div>
    <div v-else class="validation-list">
      <div
        v-for="(issue, idx) in issues"
        :key="idx"
        class="validation-item"
        :class="`severity--${issue.severity}`"
        @click="handleClickIssue(issue)"
      >
        <span class="validation-icon">{{ severityIcon(issue.severity) }}</span>
        <span class="validation-path" v-if="issue.path">{{ issue.path }}</span>
        <span class="validation-msg">{{ issue.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.validation-tab {
  padding: 12px;
}

.validation-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-color-success, #67c23a);
}

.ok-icon {
  font-size: 16px;
}

.validation-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.validation-item:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.severity--error {
  color: var(--el-color-danger, #f56c6c);
}

.severity--warning {
  color: var(--el-color-warning, #e6a23c);
}

.validation-icon {
  flex-shrink: 0;
}

.validation-path {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: var(--el-text-color-secondary, #909399);
  flex-shrink: 0;
}

.validation-msg {
  flex: 1;
}
</style>
