import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { TextDisplay, NumberDisplay, CurrencyDisplay } from '../renderers/display/text-renderers'
import { DateDisplay } from '../renderers/display/date-renderer'
import { TagDisplay, StatusDisplay } from '../renderers/display/enum-renderers'
import { CopyDisplay, LinkDisplay, ProgressDisplay } from '../renderers/display/misc-renderers'
import ElementPlus from 'element-plus'

const globalPlugins = { plugins: [ElementPlus] }

describe('Display Renderers', () => {
  // TextDisplay
  describe('TextDisplay', () => {
    it('渲染文本值', () => {
      const w = mount(TextDisplay, { props: { value: 'hello' }, global: globalPlugins })
      expect(w.text()).toBe('hello')
    })

    it('null 值渲染空字符串', () => {
      const w = mount(TextDisplay, { props: { value: null as any }, global: globalPlugins })
      expect(w.text()).toBe('')
    })

    it('数字值转字符串', () => {
      const w = mount(TextDisplay, { props: { value: 42 }, global: globalPlugins })
      expect(w.text()).toBe('42')
    })
  })

  // NumberDisplay
  describe('NumberDisplay', () => {
    it('千分位格式化', () => {
      const w = mount(NumberDisplay, {
        props: { value: 1234567, cellProps: {} },
        global: globalPlugins,
      })
      expect(w.text()).toBe('1,234,567')
    })

    it('精度控制', () => {
      const w = mount(NumberDisplay, {
        props: { value: 1234.5, cellProps: { precision: 2 } },
        global: globalPlugins,
      })
      expect(w.text()).toBe('1,234.50')
    })

    it('关闭千分位', () => {
      const w = mount(NumberDisplay, {
        props: { value: 1234567, cellProps: { thousandSep: false } },
        global: globalPlugins,
      })
      expect(w.text()).toBe('1234567')
    })

    it('NaN 值显示原值', () => {
      const w = mount(NumberDisplay, {
        props: { value: 'abc', cellProps: {} },
        global: globalPlugins,
      })
      expect(w.text()).toBe('abc')
    })
  })

  // CurrencyDisplay
  describe('CurrencyDisplay', () => {
    it('默认 ¥ 前缀和 2 位精度', () => {
      const w = mount(CurrencyDisplay, {
        props: { value: 9999.5, cellProps: {} },
        global: globalPlugins,
      })
      expect(w.text()).toBe('¥9,999.50')
    })

    it('自定义前缀和精度', () => {
      const w = mount(CurrencyDisplay, {
        props: { value: 1234, cellProps: { prefix: '$', precision: 0 } },
        global: globalPlugins,
      })
      expect(w.text()).toBe('$1,234')
    })

    it('NaN 值显示原值', () => {
      const w = mount(CurrencyDisplay, {
        props: { value: 'abc', cellProps: {} },
        global: globalPlugins,
      })
      expect(w.text()).toBe('abc')
    })
  })

  // DateDisplay
  describe('DateDisplay', () => {
    it('格式化日期', () => {
      const w = mount(DateDisplay, {
        props: { value: '2024-03-01', cellProps: { format: 'YYYY-MM-DD' } },
        global: globalPlugins,
      })
      expect(w.text()).toBe('2024-03-01')
    })

    it('日期范围格式化', () => {
      const w = mount(DateDisplay, {
        props: { value: ['2024-01-01', '2024-12-31'], cellProps: { format: 'YYYY-MM-DD' } },
        global: globalPlugins,
      })
      expect(w.text()).toBe('2024-01-01 ~ 2024-12-31')
    })

    it('空值返回空', () => {
      const w = mount(DateDisplay, {
        props: { value: '', cellProps: {} },
        global: globalPlugins,
      })
      expect(w.text()).toBe('')
    })

    it('日期范围中含空值', () => {
      const w = mount(DateDisplay, {
        props: { value: ['2024-01-01', ''], cellProps: { format: 'YYYY-MM-DD' } },
        global: globalPlugins,
      })
      expect(w.text()).toContain('2024-01-01')
    })
  })

  // TagDisplay
  describe('TagDisplay', () => {
    it('渲染 dict 标签', () => {
      const w = mount(TagDisplay, {
        props: {
          value: 'active',
          dictItems: [
            { label: '启用', value: 'active', color: 'success' },
            { label: '禁用', value: 'inactive', color: 'danger' },
          ],
        },
        global: globalPlugins,
      })
      expect(w.text()).toBe('启用')
    })

    it('未匹配值显示原值', () => {
      const w = mount(TagDisplay, {
        props: { value: 'unknown', dictItems: [] },
        global: globalPlugins,
      })
      expect(w.text()).toBe('unknown')
    })

    it('使用 cellProps.colors 覆盖颜色', () => {
      const w = mount(TagDisplay, {
        props: {
          value: 'active',
          dictItems: [{ label: '启用', value: 'active' }],
          cellProps: { colors: { active: 'warning' } },
        },
        global: globalPlugins,
      })
      expect(w.text()).toBe('启用')
    })
  })

  // StatusDisplay
  describe('StatusDisplay', () => {
    it('渲染状态点和文字', () => {
      const w = mount(StatusDisplay, {
        props: {
          value: 'done',
          dictItems: [{ label: '已完成', value: 'done', color: 'success' }],
        },
        global: globalPlugins,
      })
      expect(w.text()).toBe('已完成')
      expect(w.find('.schemly-status-dot').exists()).toBe(true)
    })

    it('颜色映射正确', () => {
      const w = mount(StatusDisplay, {
        props: {
          value: 'done',
          dictItems: [{ label: '完成', value: 'done', color: 'success' }],
        },
        global: globalPlugins,
      })
      const dot = w.find('.schemly-status-dot')
      const style = dot.attributes('style') ?? ''
      // jsdom may render as rgb(103, 194, 58) or #67c23a
      expect(style.includes('#67c23a') || style.includes('103, 194, 58')).toBe(true)
    })

    it('cellProps.colors 覆盖', () => {
      const w = mount(StatusDisplay, {
        props: {
          value: 'x',
          dictItems: [],
          cellProps: { colors: { x: 'danger' } },
        },
        global: globalPlugins,
      })
      const dot = w.find('.schemly-status-dot')
      const style = dot.attributes('style') ?? ''
      expect(style.includes('#f56c6c') || style.includes('245, 108, 108')).toBe(true)
    })
  })

  // CopyDisplay
  describe('CopyDisplay', () => {
    it('渲染文本和复制按钮', () => {
      const w = mount(CopyDisplay, {
        props: { value: 'test' },
        global: globalPlugins,
      })
      expect(w.text()).toContain('test')
      expect(w.text()).toContain('⧉')
    })
  })

  // LinkDisplay
  describe('LinkDisplay', () => {
    it('渲染链接', () => {
      const w = mount(LinkDisplay, {
        props: { value: 'https://example.com' },
        global: globalPlugins,
      })
      expect(w.text()).toBe('https://example.com')
    })
  })

  // ProgressDisplay
  describe('ProgressDisplay', () => {
    it('渲染进度条', () => {
      const w = mount(ProgressDisplay, {
        props: { value: 75 },
        global: globalPlugins,
      })
      expect(w.find('.el-progress').exists()).toBe(true)
    })

    it('超出 100 截断', () => {
      const w = mount(ProgressDisplay, {
        props: { value: 150 },
        global: globalPlugins,
      })
      expect(w.find('.el-progress').exists()).toBe(true)
    })
  })
})
