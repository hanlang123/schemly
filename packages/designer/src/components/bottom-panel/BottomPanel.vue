<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '../../store/designer'
import { generateExternalDeps } from '@schemly/core'
import type { ExternalDeps } from '@schemly/core'
import JsonTab from './JsonTab.vue'
import DepsTab from './DepsTab.vue'
import ValidationTab from './ValidationTab.vue'

const store = useDesignerStore()

const issueCount = computed(() => store.validationIssues.length)

const deps = computed<ExternalDeps | undefined>(() => {
  return store.schema.externalDeps
})
</script>

<template>
  <div class="bottom-panel" :class="{ 'is-collapsed': store.bottomCollapsed }">
    <div class="bottom-panel__header">
      <div class="bottom-tabs" v-show="!store.bottomCollapsed">
        <button
          class="bottom-tab"
          :class="{ 'is-active': store.bottomTab === 'json' }"
          @click="store.bottomTab = 'json'"
        >
          JSON 输出
        </button>
        <button
          class="bottom-tab"
          :class="{ 'is-active': store.bottomTab === 'deps' }"
          @click="store.bottomTab = 'deps'"
        >
          依赖清单
        </button>
        <button
          class="bottom-tab"
          :class="{ 'is-active': store.bottomTab === 'validation' }"
          @click="store.bottomTab = 'validation'"
        >
          校验信息
          <span v-if="issueCount > 0" class="issue-badge">{{ issueCount }}</span>
        </button>
      </div>
      <button
        class="collapse-btn"
        @click="store.bottomCollapsed = !store.bottomCollapsed"
      >
        {{ store.bottomCollapsed ? '展开 ▲' : '收起 ▼' }}
      </button>
    </div>
    <div v-show="!store.bottomCollapsed" class="bottom-panel__body">
      <JsonTab v-if="store.bottomTab === 'json'" />
      <DepsTab v-else-if="store.bottomTab === 'deps'" :deps="deps" />
      <ValidationTab v-else-if="store.bottomTab === 'validation'" />
    </div>
  </div>
</template>

<style scoped>
.bottom-panel {
  border-top: 1px solid var(--el-border-color-light, #e4e7ed);
  background: var(--el-bg-color, #fff);
}

.bottom-panel.is-collapsed .bottom-panel__body {
  display: none;
}

.bottom-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
}

.bottom-tabs {
  display: flex;
  gap: 4px;
}

.bottom-tab {
  padding: 4px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular, #606266);
  border-radius: 4px;
  transition: all 0.15s;
}

.bottom-tab:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.bottom-tab.is-active {
  color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  font-weight: 500;
}

.issue-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  border-radius: 8px;
  background: var(--el-color-warning, #e6a23c);
  color: #fff;
  font-size: 11px;
  line-height: 1;
}

.collapse-btn {
  padding: 2px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.collapse-btn:hover {
  color: var(--el-color-primary, #409eff);
}

.bottom-panel__body {
  height: 200px;
  overflow: auto;
}
</style>
