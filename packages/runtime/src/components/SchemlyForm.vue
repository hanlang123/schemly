<script lang="ts">
import { defineComponent, h, computed, reactive, ref, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import type { FormProps, DictItem, Providers } from '@schemly/core'
import { DEFAULT_FORM_LAYOUT, DEFAULT_FORM_BUTTONS, checkCellEditPermission } from '@schemly/core'
import FormField from './FormField.vue'

export default defineComponent({
  name: 'SchemlyForm',
  props: {
    formProps: { type: Object as PropType<FormProps>, required: true },
    data: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
  },
  emits: ['submit', 'reset'],
  setup(props, { emit }) {
    const formRef = ref<any>(null)

    const layout = computed(() => ({
      ...DEFAULT_FORM_LAYOUT,
      ...(props.formProps.layout ?? {}),
    }))

    const buttons = computed(() => ({
      ...DEFAULT_FORM_BUTTONS,
      ...(props.formProps.buttons ?? {}),
    }))

    // 表单数据
    const formData = reactive<Record<string, unknown>>({})

    // 初始化表单数据
    const initFormData = () => {
      for (const field of props.formProps.fields) {
        if (props.data && props.data[field.key] !== undefined) {
          formData[field.key] = props.data[field.key]
        } else if (field.defaultValue !== undefined) {
          formData[field.key] = field.defaultValue
        } else {
          formData[field.key] = undefined
        }
      }
    }
    initFormData()

    // 可见字段
    const visibleFields = computed(() => {
      return props.formProps.fields.filter((field) => {
        if (field.visible === false) return false
        const editMode = checkCellEditPermission(field, props.providers.auth?.hasPermission)
        return editMode !== 'hidden'
      })
    })

    // 折叠逻辑
    const collapsed = ref(props.formProps.layout?.defaultCollapsed ?? true)
    const isCollapsible = computed(() => props.formProps.layout?.collapsible === true)
    const visibleRows = computed(() => props.formProps.layout?.visibleRows ?? 1)

    const displayedFields = computed(() => {
      if (!isCollapsible.value || !collapsed.value) return visibleFields.value
      const cols = layout.value.columns ?? 1
      const maxFields = visibleRows.value * cols
      return visibleFields.value.slice(0, maxFields)
    })

    // 校验规则
    const formRules = computed(() => {
      const rules: Record<string, unknown[]> = {}
      for (const field of props.formProps.fields) {
        if (field.rules && field.rules.length > 0) {
          rules[field.key] = field.rules.map((rule) => {
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
      for (const field of props.formProps.fields) {
        if (field.cell === 'dateRange') {
          const cellProps = (field.cellProps ?? {}) as { startKey?: string; endKey?: string }
          const val = result[field.key]
          if (cellProps.startKey && cellProps.endKey && Array.isArray(val)) {
            result[cellProps.startKey] = val[0] ?? null
            result[cellProps.endKey] = val[1] ?? null
            delete result[field.key]
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
        emit('submit', { values: splitDateRangeValues(formData) })
      } catch {
        // validation failed
      }
    }

    const handleReset = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
      initFormData()
      emit('reset', {})
    }

    return () => {
      const ElForm = resolveComponent('ElForm')
      const ElFormItem = resolveComponent('ElFormItem')
      const ElRow = resolveComponent('ElRow')
      const ElCol = resolveComponent('ElCol')
      const ElButton = resolveComponent('ElButton')

      const cols = layout.value.columns ?? 1
      const span = Math.floor(24 / cols)

      const fieldNodes = displayedFields.value.map((field) => {
        const fieldSpan = (field.span ?? 1) * span

        return h(ElCol, { span: Math.min(24, fieldSpan), key: field.key }, () =>
          h(ElFormItem, {
            label: field.label,
            prop: field.key,
            rules: formRules.value[field.key],
          }, () =>
            h(FormField, {
              cell: field,
              modelValue: formData[field.key] as any,
              'onUpdate:modelValue': (val: unknown) => { formData[field.key] = val },
              schemaDicts: props.schemaDicts,
              providers: props.providers,
              disabled: field.disabled ?? false,
              rules: field.rules ?? [],
            }),
          ),
        )
      })

      // 按钮区域
      const buttonNodes = h(ElCol, { span: 24, style: { textAlign: 'right' } }, () => {
        const btns: ReturnType<typeof h>[] = []

        if (isCollapsible.value && visibleFields.value.length > displayedFields.value.length) {
          btns.push(h(ElButton, {
            link: true, type: 'primary',
            onClick: () => { collapsed.value = !collapsed.value },
          }, () => collapsed.value ? '展开' : '收起'))
        }

        if (buttons.value.showReset) {
          btns.push(h(ElButton, { onClick: handleReset }, () => buttons.value.resetText))
        }
        btns.push(h(ElButton, { type: 'primary', onClick: handleSubmit }, () => buttons.value.submitText))

        return btns
      })

      return h(ElForm, {
        ref: formRef,
        model: formData,
        labelWidth: layout.value.labelWidth,
        labelPosition: layout.value.labelPosition,
        class: 'schemly-form',
      }, () => h(ElRow, { gutter: 16 }, () => [...fieldNodes, buttonNodes]))
    }
  },
})
</script>
