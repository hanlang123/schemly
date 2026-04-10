<script lang="ts">
import { defineComponent, h, computed, ref, reactive, resolveComponent, watch } from 'vue'
import type { PropType } from 'vue'
import type {
  FormDialogConfig, CellDeclaration, DictItem, Providers,
} from '@schemly/core'
import { DEFAULT_FORM_LAYOUT, checkCellEditPermission } from '@schemly/core'
import FormField from './FormField.vue'

export default defineComponent({
  name: 'SchemaFormDialog',
  props: {
    config: { type: Object as PropType<FormDialogConfig>, required: true },
    columns: { type: Array as PropType<CellDeclaration[]>, required: true },
    visible: { type: Boolean, default: false },
    row: { type: Object as PropType<Record<string, unknown> | null>, default: null },
    isEdit: { type: Boolean, default: false },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
  },
  emits: ['update:visible', 'submit'],
  setup(props, { emit }) {
    const formRef = ref<any>(null)
    const formData = reactive<Record<string, unknown>>({})
    const dirty = ref(false)

    const layout = computed(() => ({
      ...DEFAULT_FORM_LAYOUT,
      ...(props.config.layout ?? {}),
    }))

    // 初始化表单数据
    const initFormData = () => {
      for (const key of props.config.fields) {
        const override = props.config.overrides?.[key]
        if (props.isEdit && props.row) {
          formData[key] = props.row[key] ?? undefined
        } else if (override?.defaultValue !== undefined) {
          formData[key] = override.defaultValue
        } else {
          formData[key] = undefined
        }
      }
      dirty.value = false
    }

    watch(() => props.visible, (val) => {
      if (val) initFormData()
    })

    // 可见字段列表
    const visibleFields = computed(() => {
      return props.config.fields
        .map((key) => {
          const cell = props.columns.find((c) => c.key === key)
          if (!cell) return null
          const override = props.config.overrides?.[key]
          if (override?.visible === false) return null
          const editMode = checkCellEditPermission(cell, props.providers.auth?.hasPermission, override)
          if (editMode === 'hidden') return null
          return { cell, override, editMode }
        })
        .filter(Boolean) as { cell: CellDeclaration; override?: any; editMode: string }[]
    })

    // 校验规则
    const formRules = computed(() => {
      const rules: Record<string, unknown[]> = {}
      if (props.config.rules) {
        for (const [key, ruleList] of Object.entries(props.config.rules)) {
          rules[key] = ruleList.map((rule) => {
            if (rule.validator) {
              const fn = props.providers.functions?.[rule.validator]
              if (fn) return { ...rule, validator: fn }
            }
            if (rule.pattern) {
              return { ...rule, pattern: new RegExp(rule.pattern) }
            }
            return rule
          })
        }
      }
      return rules
    })

    // 处理 dateRange 的 startKey/endKey 拆分
    const splitDateRangeValues = (values: Record<string, unknown>): Record<string, unknown> => {
      const result = { ...values }
      for (const key of props.config.fields) {
        const cell = props.columns.find((c) => c.key === key)
        if (cell?.cell === 'dateRange') {
          const cellProps = (cell.cellProps ?? {}) as { startKey?: string; endKey?: string }
          const val = result[key]
          if (cellProps.startKey && cellProps.endKey && Array.isArray(val)) {
            result[cellProps.startKey] = val[0] ?? null
            result[cellProps.endKey] = val[1] ?? null
            delete result[key]
          }
        }
      }
      return result
    }

    const handleSubmit = async () => {
      try {
        if (formRef.value) {
          await formRef.value.validate()
        }
        const payload: Record<string, unknown> = { values: splitDateRangeValues(formData) }
        if (props.isEdit && props.row) {
          payload.row = props.row
        }
        emit('submit', payload)

        if (!props.isEdit && props.config.keepAfterSubmit) {
          initFormData()
        } else {
          emit('update:visible', false)
        }
      } catch {
        // validation failed
      }
    }

    const handleClose = () => {
      if (dirty.value && props.config.closeConfirm !== false) {
        const confirmed = window.confirm('表单已修改，确定关闭？')
        if (!confirmed) return
      }
      emit('update:visible', false)
    }

    return () => {
      const ElDialog = resolveComponent('ElDialog')
      const ElForm = resolveComponent('ElForm')
      const ElFormItem = resolveComponent('ElFormItem')
      const ElRow = resolveComponent('ElRow')
      const ElCol = resolveComponent('ElCol')
      const ElButton = resolveComponent('ElButton')

      const cols = layout.value.columns ?? 1
      const span = Math.floor(24 / cols)

      const fieldNodes = visibleFields.value.map(({ cell, override, editMode }) => {
        const fieldSpan = (override?.span ?? 1) * span
        const isDisabled = override?.disabled === true || editMode === 'display'

        return h(ElCol, { span: Math.min(24, fieldSpan), key: cell.key }, () =>
          h(ElFormItem, {
            label: cell.label,
            prop: cell.key,
            rules: formRules.value[cell.key],
          }, () =>
            h(FormField, {
              cell,
              modelValue: formData[cell.key] as any,
              'onUpdate:modelValue': (val: unknown) => {
                formData[cell.key] = val
                dirty.value = true
              },
              schemaDicts: props.schemaDicts,
              providers: props.providers,
              override,
              disabled: isDisabled,
              rules: props.config.rules?.[cell.key] ?? [],
            }),
          ),
        )
      })

      return h(ElDialog, {
        modelValue: props.visible,
        'onUpdate:modelValue': (val: boolean) => {
          if (!val) handleClose()
        },
        title: props.config.title,
        width: props.config.width ?? '600px',
        appendToBody: true,
        closeOnClickModal: false,
        beforeClose: (done: () => void) => {
          if (dirty.value && props.config.closeConfirm !== false) {
            const confirmed = window.confirm('表单已修改，确定关闭？')
            if (!confirmed) return
          }
          done()
        },
      }, {
        default: () => h(ElForm, {
          ref: formRef,
          model: formData,
          labelWidth: layout.value.labelWidth,
          labelPosition: layout.value.labelPosition,
        }, () => h(ElRow, { gutter: 16 }, () => fieldNodes)),
        footer: () => h('div', [
          h(ElButton, { onClick: handleClose }, () => '取消'),
          h(ElButton, { type: 'primary', onClick: handleSubmit }, () => '确定'),
        ]),
      })
    }
  },
})
</script>
