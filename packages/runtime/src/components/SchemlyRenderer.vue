<script lang="ts">
import { defineComponent, h, computed, ref } from 'vue'
import type { PropType } from 'vue'
import type { SchemlySchema, Providers, DataTableProps, FormProps, DescriptionsProps } from '@schemly/core'
import { parseSchema, checkPermission, validateSchema } from '@schemly/core'
import SchemlyDataTable from './SchemlyDataTable.vue'
import SchemlyForm from './SchemlyForm.vue'
import SchemlyDescriptions from './SchemlyDescriptions.vue'
import SchemaFormDialog from './SchemaFormDialog.vue'

export default defineComponent({
  name: 'SchemlyRenderer',
  props: {
    schema: { type: Object as PropType<SchemlySchema>, required: true },
    data: { type: [Array, Object] as PropType<Record<string, unknown>[] | Record<string, unknown>>, default: undefined },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
    emptyImage: { type: String, default: undefined },
  },
  emits: [
    'action', 'createSubmit', 'updateSubmit',
    'submit', 'reset',
    'sort-change', 'page-change', 'selection-change',
    'denied',
  ],
  setup(props, { emit }) {
    const parsedSchema = computed(() => parseSchema(props.schema))

    // Dev mode: 校验 schema 并输出警告
    if (import.meta.env?.DEV) {
      const issues = validateSchema(props.schema)
      if (issues.length > 0) {
        console.warn(
          `[Schemly] Schema "${props.schema.id}" 存在 ${issues.length} 个校验问题:`,
          issues.map((i) => `[${i.severity}] ${i.path}: ${i.message}`),
        )
      }
    }

    // Type 级权限检查
    const hasAccess = computed(() => {
      const permission = parsedSchema.value.permission
      if (!permission) return true
      return checkPermission(permission, props.providers.auth?.hasPermission)
    })

    // 表单弹窗状态
    const createFormVisible = ref(false)
    const updateFormVisible = ref(false)
    const currentEditRow = ref<Record<string, unknown> | null>(null)

    const handleAction = (payload: { key: string; row?: Record<string, unknown>; rows?: Record<string, unknown>[] }) => {
      const tableProps = parsedSchema.value.props as DataTableProps

      // 检查 trigger
      const allActions = [...(tableProps.toolbarActions ?? []), ...(tableProps.rowActions ?? [])]
      const action = allActions.find((a) => a.key === payload.key)

      if (action?.trigger === 'createForm') {
        createFormVisible.value = true
        return
      }
      if (action?.trigger === 'updateForm' && payload.row) {
        currentEditRow.value = payload.row
        updateFormVisible.value = true
        return
      }

      emit('action', payload)
    }

    const handleCreateSubmit = (payload: Record<string, unknown>) => {
      emit('createSubmit', payload)
      createFormVisible.value = false
    }

    const handleUpdateSubmit = (payload: Record<string, unknown>) => {
      emit('updateSubmit', payload)
      updateFormVisible.value = false
    }

    return () => {
      // 权限检查
      if (!hasAccess.value) {
        emit('denied', { permission: parsedSchema.value.permission })
        return null
      }

      const schema = parsedSchema.value
      const schemaDicts = schema.dicts ?? {}

      if (schema.type === 'DataTable') {
        const tableProps = schema.props as DataTableProps
        const children: ReturnType<typeof h>[] = [
          h(SchemlyDataTable, {
            tableProps,
            data: (props.data ?? []) as Record<string, unknown>[],
            schemaDicts,
            providers: props.providers,
            loading: props.loading,
            emptyText: props.emptyText,
            onAction: handleAction,
            'onSort-change': (p: unknown) => emit('sort-change', p),
            'onPage-change': (p: unknown) => emit('page-change', p),
            'onSelection-change': (p: unknown) => emit('selection-change', p),
          }),
        ]

        // createForm dialog
        if (tableProps.createForm) {
          children.push(h(SchemaFormDialog, {
            config: tableProps.createForm,
            columns: tableProps.columns,
            visible: createFormVisible.value,
            'onUpdate:visible': (val: boolean) => { createFormVisible.value = val },
            isEdit: false,
            schemaDicts,
            providers: props.providers,
            onSubmit: handleCreateSubmit,
          }))
        }

        // updateForm dialog
        if (tableProps.updateForm) {
          children.push(h(SchemaFormDialog, {
            config: tableProps.updateForm,
            columns: tableProps.columns,
            visible: updateFormVisible.value,
            'onUpdate:visible': (val: boolean) => { updateFormVisible.value = val },
            isEdit: true,
            row: currentEditRow.value,
            schemaDicts,
            providers: props.providers,
            onSubmit: handleUpdateSubmit,
          }))
        }

        return h('div', { class: 'schemly-renderer schemly-renderer--data-table' }, children)
      }

      if (schema.type === 'Form') {
        return h('div', { class: 'schemly-renderer schemly-renderer--form' }, [
          h(SchemlyForm, {
            formProps: schema.props as FormProps,
            data: props.data as Record<string, unknown> | undefined,
            schemaDicts,
            providers: props.providers,
            onSubmit: (p: unknown) => emit('submit', p),
            onReset: (p: unknown) => emit('reset', p),
          }),
        ])
      }

      if (schema.type === 'Descriptions') {
        return h('div', { class: 'schemly-renderer schemly-renderer--descriptions' }, [
          h(SchemlyDescriptions, {
            descProps: schema.props as DescriptionsProps,
            data: (props.data ?? {}) as Record<string, unknown>,
            schemaDicts,
            providers: props.providers,
          }),
        ])
      }

      return h('div', { class: 'schemly-renderer' }, `未知的 schema type: ${schema.type}`)
    }
  },
})
</script>
