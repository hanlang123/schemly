<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '../../store/designer'

const store = useDesignerStore()

const emit = defineEmits<{
  'edit-dict': [key: string]
  'add-dict': []
}>()

const dictEntries = computed(() => {
  return Object.entries(store.dicts).map(([key, items]) => ({
    key,
    count: items.length,
  }))
})

const deps = computed(() => store.schema.externalDeps)

const removeDict = (key: string) => {
  store.removeDict(key)
}
</script>

<template>
  <div class="global-config-panel">
    <div class="panel-header">Schema 配置</div>

    <!-- 基本信息 -->
    <ElCollapse model-value="basic">
      <ElCollapseItem title="基本信息" name="basic">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">ID:</span>
            <ElInput v-model="store.schemaId" size="small" />
          </div>
          <div class="config-row">
            <span class="config-label">名称:</span>
            <ElInput v-model="store.schemaName" size="small" />
          </div>
          <div class="config-row">
            <span class="config-label">类型:</span>
            <span class="config-value">{{ store.schemaType }}</span>
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 权限 -->
    <ElCollapse>
      <ElCollapseItem title="权限" name="permission">
        <div class="config-form">
          <div class="config-row">
            <span class="config-label">Type 级权限:</span>
            <ElSwitch :model-value="!!store.schemaPermission" @change="(v: boolean) => store.schemaPermission = v ? 'permission:code' : ''" />
          </div>
          <div v-if="store.schemaPermission" class="config-row">
            <span class="config-label">权限码:</span>
            <ElInput v-model="store.schemaPermission" size="small" />
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 字典管理 -->
    <ElCollapse>
      <ElCollapseItem title="字典管理" name="dicts">
        <div class="dict-list">
          <div v-for="entry in dictEntries" :key="entry.key" class="dict-item">
            <span class="dict-key">{{ entry.key }}</span>
            <span class="dict-count">({{ entry.count }}项)</span>
            <div class="dict-actions">
              <ElButton size="small" text type="primary" @click="emit('edit-dict', entry.key)">编辑</ElButton>
              <ElButton size="small" text type="danger" @click="removeDict(entry.key)">删除</ElButton>
            </div>
          </div>
          <div v-if="dictEntries.length === 0" class="dict-empty">暂无字典</div>
          <ElButton size="small" @click="emit('add-dict')" style="margin-top: 8px">+ 新增字典</ElButton>
        </div>
      </ElCollapseItem>
    </ElCollapse>

    <!-- 依赖清单 -->
    <ElCollapse>
      <ElCollapseItem title="依赖清单" name="deps">
        <div class="deps-summary">
          <div class="deps-row">
            <span>functions:</span>
            <span>{{ deps?.functions?.length ?? 0 }}</span>
          </div>
          <div class="deps-row">
            <span>permissions:</span>
            <span>{{ deps?.permissions?.length ?? 0 }}</span>
          </div>
        </div>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<style scoped>
.global-config-panel {
  padding: 0;
}

.panel-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
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

.config-value {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.dict-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dict-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.dict-key {
  font-size: 12px;
  font-weight: 500;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.dict-count {
  font-size: 11px;
  color: var(--el-text-color-secondary, #909399);
}

.dict-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
}

.dict-empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  padding: 8px 0;
}

.deps-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deps-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular, #606266);
}
</style>
