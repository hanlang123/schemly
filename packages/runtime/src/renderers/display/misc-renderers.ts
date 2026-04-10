import { defineComponent, h, ref, resolveComponent } from 'vue'
import type { PropType } from 'vue'

/** 复制按钮渲染器 */
export const CopyDisplay = defineComponent({
  name: 'CopyDisplay',
  props: {
    value: { type: [String, Number] as PropType<unknown>, default: '' },
  },
  setup(props) {
    const copied = ref(false)

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(String(props.value ?? ''))
        copied.value = true
        setTimeout(() => { copied.value = false }, 1500)
      } catch {
        // fallback
      }
    }

    return () => {
      const ElIcon = resolveComponent('ElIcon')
      return h('span', { class: 'schemly-copy-display', style: { cursor: 'pointer' } }, [
        h('span', String(props.value ?? '')),
        h('span', {
          style: { marginLeft: '4px', color: copied.value ? '#67c23a' : '#409eff', cursor: 'pointer' },
          onClick: handleCopy,
          title: '复制',
        }, copied.value ? '✓' : '⧉'),
      ])
    }
  },
})

/** 链接渲染器 */
export const LinkDisplay = defineComponent({
  name: 'LinkDisplay',
  props: {
    value: { type: [String] as PropType<unknown>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    row: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const target = (props.cellProps.target as string) ?? '_blank'
      const hrefField = props.cellProps.href as string | undefined
      const href = hrefField ? String(props.row[hrefField] ?? props.value ?? '') : String(props.value ?? '')
      const text = String(props.value ?? '')

      const ElLink = resolveComponent('ElLink')
      return h(ElLink, { href, target, type: 'primary', underline: true }, () => text)
    }
  },
})

/** 进度条渲染器 */
export const ProgressDisplay = defineComponent({
  name: 'ProgressDisplay',
  props: {
    value: { type: [Number, String] as PropType<unknown>, default: 0 },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const percentage = Math.min(100, Math.max(0, Number(props.value) || 0))
      const ElProgress = resolveComponent('ElProgress')
      return h(ElProgress, { percentage, strokeWidth: 8 })
    }
  },
})
