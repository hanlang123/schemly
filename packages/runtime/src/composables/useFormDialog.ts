import { ref, reactive, nextTick } from 'vue'
import type { CellDeclaration, FormDialogConfig, FieldOverride, Providers, RuleItem } from '@schemly/core'

export interface FormDialogState {
  visible: boolean
  formData: Record<string, unknown>
  isEdit: boolean
  currentRow: Record<string, unknown> | null
}

/**
 * 表单弹窗 composable（createForm / updateForm）
 */
export function useFormDialog(
  config: FormDialogConfig | undefined,
  columns: CellDeclaration[],
  providers: Providers,
) {
  const state = reactive<FormDialogState>({
    visible: false,
    formData: {},
    isEdit: false,
    currentRow: null,
  })

  const formRef = ref<{ validate: () => Promise<boolean>; resetFields: () => void } | null>(null)
  const dirty = ref(false)

  /**
   * 打开新增弹窗
   */
  const openCreate = () => {
    state.isEdit = false
    state.currentRow = null
    state.formData = buildDefaultValues()
    state.visible = true
    dirty.value = false
  }

  /**
   * 打开编辑弹窗，回填行数据
   */
  const openUpdate = (row: Record<string, unknown>) => {
    state.isEdit = true
    state.currentRow = row
    state.formData = buildFormDataFromRow(row)
    state.visible = true
    dirty.value = false
  }

  /**
   * 关闭弹窗
   */
  const close = () => {
    state.visible = false
    state.formData = {}
    state.currentRow = null
    dirty.value = false
  }

  /**
   * 构建默认值
   */
  const buildDefaultValues = (): Record<string, unknown> => {
    if (!config) return {}
    const data: Record<string, unknown> = {}
    for (const fieldKey of config.fields) {
      const override = config.overrides?.[fieldKey]
      if (override?.defaultValue !== undefined) {
        data[fieldKey] = override.defaultValue
      } else {
        data[fieldKey] = undefined
      }
    }
    return data
  }

  /**
   * 从行数据构建表单数据
   */
  const buildFormDataFromRow = (row: Record<string, unknown>): Record<string, unknown> => {
    if (!config) return {}
    const data: Record<string, unknown> = {}
    for (const fieldKey of config.fields) {
      data[fieldKey] = row[fieldKey] ?? undefined
    }
    return data
  }

  /**
   * 获取字段的最终配置（合并 overrides）
   */
  const getFieldConfig = (fieldKey: string): { cell: CellDeclaration; override?: FieldOverride } | null => {
    const cell = columns.find((c) => c.key === fieldKey)
    if (!cell) return null
    const override = config?.overrides?.[fieldKey]
    return { cell, override }
  }

  /**
   * 获取字段的校验规则
   */
  const getFieldRules = (fieldKey: string): RuleItem[] => {
    return config?.rules?.[fieldKey] ?? []
  }

  /**
   * 标记数据已修改
   */
  const markDirty = () => {
    dirty.value = true
  }

  return {
    state,
    formRef,
    dirty,
    openCreate,
    openUpdate,
    close,
    getFieldConfig,
    getFieldRules,
    markDirty,
  }
}
