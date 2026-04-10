<script setup lang="ts">
import { useDesignerStore } from '../store/designer'

const store = useDesignerStore()
</script>

<template>
  <div class="designer-layout">
    <!-- 左侧面板 -->
    <div
      class="layout-left"
      :class="{ 'is-collapsed': store.leftCollapsed }"
    >
      <div v-show="!store.leftCollapsed" class="panel-content">
        <slot name="left" />
      </div>
      <button
        class="collapse-trigger collapse-trigger--left"
        @click="store.leftCollapsed = !store.leftCollapsed"
        :title="store.leftCollapsed ? '展开左侧面板' : '收起左侧面板'"
      >
        {{ store.leftCollapsed ? '›' : '‹' }}
      </button>
    </div>

    <!-- 中间主区域 -->
    <div class="layout-center">
      <slot name="center" />
    </div>

    <!-- 右侧面板 -->
    <div
      class="layout-right"
      :class="{ 'is-collapsed': store.rightCollapsed }"
    >
      <button
        class="collapse-trigger collapse-trigger--right"
        @click="store.rightCollapsed = !store.rightCollapsed"
        :title="store.rightCollapsed ? '展开右侧面板' : '收起右侧面板'"
      >
        {{ store.rightCollapsed ? '‹' : '›' }}
      </button>
      <div v-show="!store.rightCollapsed" class="panel-content">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.designer-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.layout-left {
  display: flex;
  width: 240px;
  border-right: 1px solid var(--el-border-color-light, #e4e7ed);
  background: var(--el-bg-color, #fff);
  transition: width 0.2s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.layout-left.is-collapsed {
  width: 20px;
}

.layout-left .panel-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.layout-center {
  flex: 1;
  overflow: auto;
  min-width: 0;
  background: var(--el-fill-color-lighter, #fafcff);
}

.layout-right {
  display: flex;
  width: 320px;
  border-left: 1px solid var(--el-border-color-light, #e4e7ed);
  background: var(--el-bg-color, #fff);
  transition: width 0.2s ease;
  flex-shrink: 0;
  overflow: hidden;
}

.layout-right.is-collapsed {
  width: 20px;
}

.layout-right .panel-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.15s;
}

.collapse-trigger:hover {
  background: var(--el-fill-color-light, #f5f7fa);
  color: var(--el-color-primary, #409eff);
}
</style>
