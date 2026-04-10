import { describe, it, expect } from 'vitest'
import { DISPLAY_RENDERER_MAP, EDIT_RENDERER_MAP } from '../renderers/renderer-map'

describe('渲染器映射表', () => {
  it('所有 display 渲染器已注册', () => {
    const expected = ['text', 'number', 'currency', 'tag', 'status', 'date', 'copy', 'link', 'progress', 'image', 'file', 'detail']
    for (const key of expected) {
      expect(DISPLAY_RENDERER_MAP[key as keyof typeof DISPLAY_RENDERER_MAP]).toBeDefined()
    }
  })

  it('所有 edit 渲染器已注册', () => {
    const expected = ['input', 'textarea', 'inputNumber', 'select', 'radio', 'checkbox', 'datePicker', 'dateRangePicker', 'switch', 'imageUpload', 'fileUpload']
    for (const key of expected) {
      expect(EDIT_RENDERER_MAP[key as keyof typeof EDIT_RENDERER_MAP]).toBeDefined()
    }
  })

  it('display 渲染器共 12 个', () => {
    expect(Object.keys(DISPLAY_RENDERER_MAP)).toHaveLength(12)
  })

  it('edit 渲染器共 11 个', () => {
    expect(Object.keys(EDIT_RENDERER_MAP)).toHaveLength(11)
  })
})
