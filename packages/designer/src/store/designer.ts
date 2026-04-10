import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  SchemlySchema, SchemaType, CellDeclaration, DictItem,
  DataTableProps, FormProps, DescriptionsProps,
  ToolbarAction, RowAction, RowActionStyle, FormDialogConfig,
  PaginationConfig, SelectionConfig, FormFieldDeclaration,
} from '@schemly/core'
import {
  CURRENT_SCHEMA_VERSION, DEFAULT_PAGINATION, DEFAULT_ROW_ACTION_STYLE,
  DEFAULT_FORM_LAYOUT, DEFAULT_FORM_BUTTONS,
  validateSchema, generateExternalDeps,
} from '@schemly/core'
import type { ValidationIssue } from '@schemly/core'

// Vue reactive Proxy 对象无法被 deepClone 处理，使用 JSON 序列化替代
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export const useDesignerStore = defineStore('schemly-designer', () => {
  // ============ 基础状态 ============
  const schemaId = ref('new-schema')
  const schemaName = ref('新建 Schema')
  const schemaType = ref<SchemaType>('DataTable')
  const schemaPermission = ref<string>('')
  const dicts = ref<Record<string, DictItem[]>>({})

  // ============ DataTable 状态 ============
  const columns = ref<CellDeclaration[]>([])
  const pagination = ref<PaginationConfig>({ ...DEFAULT_PAGINATION, pageSizes: [...DEFAULT_PAGINATION.pageSizes] })
  const selection = ref<SelectionConfig>({ enabled: false, rowKey: 'id' })
  const toolbarActions = ref<ToolbarAction[]>([])
  const rowActions = ref<RowAction[]>([])
  const rowActionStyle = ref<RowActionStyle>({ ...DEFAULT_ROW_ACTION_STYLE })
  const createForm = ref<FormDialogConfig | null>(null)
  const updateForm = ref<FormDialogConfig | null>(null)

  // ============ Form 状态 ============
  const formFields = ref<FormFieldDeclaration[]>([])
  const formLayout = ref({ ...(DEFAULT_FORM_LAYOUT as any), collapsible: false, defaultCollapsed: true, visibleRows: 1 })
  const formButtons = ref({ ...(DEFAULT_FORM_BUTTONS as any) })

  // ============ Descriptions 状态 ============
  const descItems = ref<CellDeclaration[]>([])
  const descColumn = ref(2)

  // ============ UI 状态 ============
  const selectedFieldKey = ref<string | null>(null)
  const previewMode = ref(false)
  const bottomTab = ref<'json' | 'deps' | 'validation'>('json')
  const bottomCollapsed = ref(false)
  const leftCollapsed = ref(false)
  const rightCollapsed = ref(false)
  const leftTab = ref<'fields' | 'actions' | 'forms'>('fields')

  // ============ Undo/Redo ============
  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])
  const maxUndoSteps = 50

  const pushUndo = () => {
    const snapshot = JSON.stringify(buildSchema())
    undoStack.value.push(snapshot)
    if (undoStack.value.length > maxUndoSteps) {
      undoStack.value.shift()
    }
    redoStack.value = []
  }

  const undo = () => {
    if (undoStack.value.length === 0) return
    const currentSnapshot = JSON.stringify(buildSchema())
    redoStack.value.push(currentSnapshot)
    const prev = undoStack.value.pop()!
    loadSchema(JSON.parse(prev), false)
  }

  const redo = () => {
    if (redoStack.value.length === 0) return
    const currentSnapshot = JSON.stringify(buildSchema())
    undoStack.value.push(currentSnapshot)
    const next = redoStack.value.pop()!
    loadSchema(JSON.parse(next), false)
  }

  // ============ 当前字段列表（按 type 切换） ============
  const currentFields = computed((): CellDeclaration[] => {
    switch (schemaType.value) {
      case 'DataTable': return columns.value
      case 'Form': return formFields.value
      case 'Descriptions': return descItems.value
      default: return []
    }
  })

  const selectedField = computed(() => {
    if (!selectedFieldKey.value) return null
    return currentFields.value.find((f) => f.key === selectedFieldKey.value) ?? null
  })

  // ============ Schema 构建 ============
  const buildSchema = (): SchemlySchema => {
    const base: Partial<SchemlySchema> = {
      version: CURRENT_SCHEMA_VERSION,
      id: schemaId.value,
      name: schemaName.value,
      type: schemaType.value,
    }

    if (schemaPermission.value) {
      base.permission = schemaPermission.value
    }

    if (Object.keys(dicts.value).length > 0) {
      base.dicts = deepClone(dicts.value)
    }

    let props: DataTableProps | FormProps | DescriptionsProps

    switch (schemaType.value) {
      case 'DataTable': {
        const tp: DataTableProps = {
          columns: deepClone(columns.value),
        }
        if (pagination.value.enabled !== false) tp.pagination = deepClone(pagination.value)
        if (selection.value.enabled) tp.selection = deepClone(selection.value)
        if (toolbarActions.value.length > 0) tp.toolbarActions = deepClone(toolbarActions.value)
        if (rowActions.value.length > 0) tp.rowActions = deepClone(rowActions.value)
        if (rowActions.value.length > 0) tp.rowActionStyle = deepClone(rowActionStyle.value)
        if (createForm.value) tp.createForm = deepClone(createForm.value)
        if (updateForm.value) tp.updateForm = deepClone(updateForm.value)
        props = tp
        break
      }
      case 'Form': {
        props = {
          layout: deepClone(formLayout.value),
          fields: deepClone(formFields.value),
          buttons: deepClone(formButtons.value),
        }
        break
      }
      case 'Descriptions': {
        props = {
          column: descColumn.value,
          items: deepClone(descItems.value),
        }
        break
      }
      default:
        props = { columns: [] } as DataTableProps
    }

    const schema = { ...base, props } as SchemlySchema
    schema.externalDeps = generateExternalDeps(schema)

    return schema
  }

  const schema = computed(() => buildSchema())

  // ============ 校验 ============
  const validationIssues = computed((): ValidationIssue[] => {
    return validateSchema(schema.value)
  })

  // ============ Schema 加载 ============
  const loadSchema = (s: SchemlySchema, trackUndo = true) => {
    if (trackUndo) pushUndo()

    schemaId.value = s.id ?? 'new-schema'
    schemaName.value = s.name ?? '新建 Schema'
    schemaType.value = s.type ?? 'DataTable'
    schemaPermission.value = s.permission ?? ''
    dicts.value = s.dicts ? deepClone(s.dicts) : {}

    switch (s.type) {
      case 'DataTable': {
        const tp = s.props as DataTableProps
        columns.value = deepClone(tp.columns ?? [])
        pagination.value = typeof tp.pagination === 'boolean'
          ? { ...DEFAULT_PAGINATION, pageSizes: [...DEFAULT_PAGINATION.pageSizes], enabled: tp.pagination }
          : { ...DEFAULT_PAGINATION, pageSizes: [...DEFAULT_PAGINATION.pageSizes], ...(tp.pagination ?? {}) }
        selection.value = tp.selection ? deepClone(tp.selection) : { enabled: false, rowKey: 'id' }
        toolbarActions.value = deepClone(tp.toolbarActions ?? [])
        rowActions.value = deepClone(tp.rowActions ?? [])
        rowActionStyle.value = { ...DEFAULT_ROW_ACTION_STYLE, ...(tp.rowActionStyle ?? {}) }
        createForm.value = tp.createForm ? deepClone(tp.createForm) : null
        updateForm.value = tp.updateForm ? deepClone(tp.updateForm) : null
        break
      }
      case 'Form': {
        const fp = s.props as FormProps
        formFields.value = deepClone(fp.fields ?? [])
        formLayout.value = { ...(DEFAULT_FORM_LAYOUT as any), collapsible: false, defaultCollapsed: true, visibleRows: 1, ...(fp.layout ?? {}) }
        formButtons.value = { ...(DEFAULT_FORM_BUTTONS as any), ...(fp.buttons ?? {}) }
        break
      }
      case 'Descriptions': {
        const dp = s.props as DescriptionsProps
        descItems.value = deepClone(dp.items ?? [])
        descColumn.value = dp.column ?? 2
        break
      }
    }

    selectedFieldKey.value = null
  }

  // ============ 字段操作 ============
  const addField = (field: CellDeclaration) => {
    pushUndo()
    switch (schemaType.value) {
      case 'DataTable': columns.value.push(field); break
      case 'Form': formFields.value.push(field as FormFieldDeclaration); break
      case 'Descriptions': descItems.value.push(field); break
    }
  }

  const removeField = (key: string) => {
    pushUndo()
    switch (schemaType.value) {
      case 'DataTable':
        columns.value = columns.value.filter((c) => c.key !== key)
        break
      case 'Form':
        formFields.value = formFields.value.filter((f) => f.key !== key)
        break
      case 'Descriptions':
        descItems.value = descItems.value.filter((i) => i.key !== key)
        break
    }
    if (selectedFieldKey.value === key) selectedFieldKey.value = null
  }

  const updateField = (key: string, updates: Partial<CellDeclaration>) => {
    pushUndo()
    const findAndUpdate = (list: CellDeclaration[]) => {
      const idx = list.findIndex((f) => f.key === key)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates }
      }
    }
    switch (schemaType.value) {
      case 'DataTable': findAndUpdate(columns.value); break
      case 'Form': findAndUpdate(formFields.value); break
      case 'Descriptions': findAndUpdate(descItems.value); break
    }
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    pushUndo()
    const getList = (): CellDeclaration[] => {
      switch (schemaType.value) {
        case 'DataTable': return columns.value
        case 'Form': return formFields.value
        case 'Descriptions': return descItems.value
        default: return []
      }
    }
    const list = getList()
    const [item] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, item)
  }

  // ============ Type 切换 ============
  const switchType = (newType: SchemaType) => {
    pushUndo()
    schemaType.value = newType
    selectedFieldKey.value = null
    // 不清空字段 — 保留以便用户切换回来时恢复
  }

  // ============ 字典操作 ============
  const setDict = (key: string, items: DictItem[]) => {
    pushUndo()
    dicts.value = { ...dicts.value, [key]: items }
  }

  const removeDict = (key: string) => {
    pushUndo()
    const { [key]: _, ...rest } = dicts.value
    dicts.value = rest
  }

  // ============ 重置 ============
  const resetAll = () => {
    pushUndo()
    schemaId.value = 'new-schema'
    schemaName.value = '新建 Schema'
    schemaType.value = 'DataTable'
    schemaPermission.value = ''
    dicts.value = {}
    columns.value = []
    pagination.value = { ...DEFAULT_PAGINATION, pageSizes: [...DEFAULT_PAGINATION.pageSizes] }
    selection.value = { enabled: false, rowKey: 'id' }
    toolbarActions.value = []
    rowActions.value = []
    rowActionStyle.value = { ...DEFAULT_ROW_ACTION_STYLE }
    createForm.value = null
    updateForm.value = null
    formFields.value = []
    formLayout.value = { ...(DEFAULT_FORM_LAYOUT as any), collapsible: false, defaultCollapsed: true, visibleRows: 1 }
    formButtons.value = { ...(DEFAULT_FORM_BUTTONS as any) }
    descItems.value = []
    descColumn.value = 2
    selectedFieldKey.value = null
  }

  return {
    // 基础状态
    schemaId, schemaName, schemaType, schemaPermission, dicts,
    // DataTable 状态
    columns, pagination, selection, toolbarActions, rowActions, rowActionStyle, createForm, updateForm,
    // Form 状态
    formFields, formLayout, formButtons,
    // Descriptions 状态
    descItems, descColumn,
    // UI 状态
    selectedFieldKey, selectedField, previewMode, bottomTab, bottomCollapsed,
    leftCollapsed, rightCollapsed, leftTab,
    // Computed
    currentFields, schema, validationIssues,
    // Actions
    buildSchema, loadSchema, addField, removeField, updateField, moveField,
    switchType, setDict, removeDict, resetAll,
    pushUndo, undo, redo, undoStack, redoStack,
  }
})
