<script lang="ts">
import { defineComponent, h, computed, resolveComponent, ref, watch, onMounted } from 'vue'
import type { PropType } from 'vue'
import type {
  CellDeclaration, DictItem, EditAs, FormLayout,
  FieldOverride, Providers, RuleItem,
} from '@schemly/core'
import {
  resolveEditAs, resolveDisplayAs, isValidEditCombination,
  parseOptionsPrefix, resolveDictItems,
  checkCellEditPermission,
} from '@schemly/core'
import { EDIT_RENDERER_MAP, DISPLAY_RENDERER_MAP } from '../renderers/renderer-map'

export default defineComponent({
  name: 'FormField',
  props: {
    cell: { type: Object as PropType<CellDeclaration>, required: true },
    modelValue: { type: null as unknown as PropType<unknown>, default: undefined },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    override: { type: Object as PropType<FieldOverride>, default: undefined },
    rules: { type: Array as PropType<RuleItem[]>, default: () => [] },
    disabled: { type: Boolean, default: false },
    row: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dictItems = computed(() => {
      const options = (props.cell.cellProps as { options?: string })?.options
      if (!options) return []
      const parsed = parseOptionsPrefix(options)
      if (!parsed) return []
      if (parsed.type === 'dict') {
        return resolveDictItems(parsed.key, props.schemaDicts, props.providers.dicts) ?? []
      }
      return []
    })

    const editMode = computed(() => {
      return checkCellEditPermission(props.cell, props.providers.auth?.hasPermission, props.override)
    })

    const effectiveEditAs = computed((): EditAs => {
      const ea = props.override?.editAs ?? props.cell.editAs
      const cell = { ...props.cell, editAs: ea }
      let editAs = resolveEditAs(cell)
      if (ea && !isValidEditCombination(props.cell.cell, ea)) {
        editAs = resolveEditAs({ ...props.cell, editAs: undefined })
      }
      return editAs
    })

    const isDisabled = computed(() => props.disabled || props.override?.disabled === true)

    // 构建校验规则（转换 validator 引用）
    const resolvedRules = computed(() => {
      return props.rules.map((rule) => {
        if (rule.validator) {
          const fn = props.providers.functions?.[rule.validator]
          if (fn) {
            return { ...rule, validator: fn }
          }
        }
        if (rule.pattern) {
          return { ...rule, pattern: new RegExp(rule.pattern) }
        }
        return rule
      })
    })

    return () => {
      if (editMode.value === 'hidden') return null

      // 降级为 display
      if (editMode.value === 'display') {
        const displayAs = resolveDisplayAs(props.cell)
        const Comp = DISPLAY_RENDERER_MAP[displayAs]
        if (!Comp) return h('span', String(props.modelValue ?? ''))
        return h(Comp, {
          value: props.modelValue,
          cellProps: props.cell.cellProps ?? {},
          row: props.row,
          dictItems: dictItems.value,
        })
      }

      // edit 模式
      const Comp = EDIT_RENDERER_MAP[effectiveEditAs.value]
      if (!Comp) return h('span', `[Unknown editor: ${effectiveEditAs.value}]`)

      const editorProps: Record<string, unknown> = {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (val: unknown) => emit('update:modelValue', val),
        cellProps: { ...(props.cell.cellProps ?? {}), ...(props.override?.cellProps ?? {}) },
        disabled: isDisabled.value,
        dictItems: dictItems.value,
        providers: props.providers,
        row: props.row,
      }

      // checkbox 使用 multiple
      if (effectiveEditAs.value === 'checkbox') {
        editorProps.multiple = true
      }

      return h(Comp, editorProps)
    }
  },
})
</script>
