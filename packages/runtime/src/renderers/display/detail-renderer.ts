import { defineComponent, h, ref, resolveComponent } from 'vue'
import type { PropType } from 'vue'

/** Detail 渲染器 — 按钮/链接触发弹窗 */
export const DetailDisplay = defineComponent({
  name: 'DetailDisplay',
  props: {
    value: { type: [String] as PropType<unknown>, default: '' },
    cellProps: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
    row: { type: Object as PropType<Record<string, unknown>>, default: () => ({}) },
  },
  setup(props) {
    const visible = ref(false)

    return () => {
      const trigger = (props.cellProps.trigger as string) ?? 'button'
      const buttonText = (props.cellProps.buttonText as string) ?? '查看'
      const mode = (props.cellProps.mode as string) ?? 'text'
      const dialogTitle = (props.cellProps.dialogTitle as string) ?? '详情'
      const dialogWidth = (props.cellProps.dialogWidth as string) ?? '600px'
      const highlightKey = props.cellProps.highlightKey as string | undefined

      const content = String(props.value ?? '')

      // 构建弹窗内容
      let dialogContent: ReturnType<typeof h>
      if (mode === 'highlight' && highlightKey) {
        const keywords: string[] = (() => {
          const raw = props.row[highlightKey]
          if (Array.isArray(raw)) return raw as string[]
          if (typeof raw === 'string') return [raw]
          return []
        })()

        if (keywords.length > 0) {
          const regex = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi')
          const parts = content.split(regex)
          dialogContent = h('div', { class: 'schemly-detail-content' },
            parts.map((part, i) => {
              const isMatch = keywords.some((kw) => kw.toLowerCase() === part.toLowerCase())
              return isMatch
                ? h('mark', { key: i, style: { backgroundColor: '#ffd54f', padding: '0 2px' } }, part)
                : h('span', { key: i }, part)
            }),
          )
        } else {
          dialogContent = h('div', { class: 'schemly-detail-content' }, content)
        }
      } else {
        dialogContent = h('div', {
          class: 'schemly-detail-content',
          style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
        }, content)
      }

      const ElDialog = resolveComponent('ElDialog')
      const ElButton = resolveComponent('ElButton')
      const ElLink = resolveComponent('ElLink')

      const triggerEl = trigger === 'link'
        ? h(ElLink, { type: 'primary', onClick: () => { visible.value = true } }, () => buttonText)
        : h(ElButton, { size: 'small', type: 'primary', link: true, onClick: () => { visible.value = true } }, () => buttonText)

      return h('span', { class: 'schemly-detail-display' }, [
        triggerEl,
        h(ElDialog, {
          modelValue: visible.value,
          'onUpdate:modelValue': (val: boolean) => { visible.value = val },
          title: dialogTitle,
          width: dialogWidth,
          appendToBody: true,
        }, () => dialogContent),
      ])
    }
  },
})

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
