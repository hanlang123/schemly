import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { InputEditor, TextareaEditor, InputNumberEditor } from '../renderers/edit/basic-editors'
import { SelectEditor, RadioEditor, CheckboxEditor } from '../renderers/edit/enum-editors'
import { DatePickerEditor, DateRangePickerEditor, SwitchEditor } from '../renderers/edit/date-editors'
import ElementPlus from 'element-plus'

const globalPlugins = { plugins: [ElementPlus] }

describe('Edit Renderers', () => {
  describe('InputEditor', () => {
    it('渲染输入框', () => {
      const w = mount(InputEditor, {
        props: { modelValue: 'test' },
        global: globalPlugins,
      })
      expect(w.find('.el-input').exists()).toBe(true)
    })

    it('disabled 状态', () => {
      const w = mount(InputEditor, {
        props: { modelValue: '', disabled: true },
        global: globalPlugins,
      })
      expect(w.find('.is-disabled').exists()).toBe(true)
    })

    it('cellProps 传递 placeholder', () => {
      const w = mount(InputEditor, {
        props: { modelValue: '', cellProps: { placeholder: '请输入' } },
        global: globalPlugins,
      })
      expect(w.find('input').attributes('placeholder')).toBe('请输入')
    })
  })

  describe('TextareaEditor', () => {
    it('渲染多行输入框', () => {
      const w = mount(TextareaEditor, {
        props: { modelValue: 'multi\nline' },
        global: globalPlugins,
      })
      expect(w.find('textarea').exists()).toBe(true)
    })
  })

  describe('InputNumberEditor', () => {
    it('渲染数字输入框', () => {
      const w = mount(InputNumberEditor, {
        props: { modelValue: 42 },
        global: globalPlugins,
      })
      expect(w.find('.el-input-number').exists()).toBe(true)
    })

    it('disabled 状态', () => {
      const w = mount(InputNumberEditor, {
        props: { modelValue: 0, disabled: true },
        global: globalPlugins,
      })
      expect(w.find('.is-disabled').exists()).toBe(true)
    })
  })

  describe('SelectEditor', () => {
    it('渲染选择框', () => {
      const w = mount(SelectEditor, {
        props: {
          modelValue: 'a',
          dictItems: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
        global: globalPlugins,
      })
      expect(w.find('.el-select').exists()).toBe(true)
    })
  })

  describe('RadioEditor', () => {
    it('渲染单选组', () => {
      const w = mount(RadioEditor, {
        props: {
          modelValue: 'a',
          dictItems: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
        global: globalPlugins,
      })
      expect(w.find('.el-radio-group').exists()).toBe(true)
    })
  })

  describe('CheckboxEditor', () => {
    it('渲染多选组', () => {
      const w = mount(CheckboxEditor, {
        props: {
          modelValue: ['a'],
          dictItems: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
        global: globalPlugins,
      })
      expect(w.find('.el-checkbox-group').exists()).toBe(true)
    })
  })

  describe('DatePickerEditor', () => {
    it('渲染日期选择器', () => {
      const w = mount(DatePickerEditor, {
        props: { modelValue: '2024-01-01' },
        global: globalPlugins,
      })
      expect(w.find('.el-date-editor').exists()).toBe(true)
    })
  })

  describe('DateRangePickerEditor', () => {
    it('渲染日期范围选择器', () => {
      const w = mount(DateRangePickerEditor, {
        props: { modelValue: ['2024-01-01', '2024-12-31'] },
        global: globalPlugins,
      })
      expect(w.find('.el-date-editor').exists()).toBe(true)
    })
  })

  describe('SwitchEditor', () => {
    it('渲染开关', () => {
      const w = mount(SwitchEditor, {
        props: { modelValue: true },
        global: globalPlugins,
      })
      expect(w.find('.el-switch').exists()).toBe(true)
    })
  })
})
