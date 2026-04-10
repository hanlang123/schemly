import { describe, it, expect } from 'vitest'
import { inferFieldsFromData } from '../utils/infer'

describe('inferFieldsFromData', () => {
  it('推断字符串字段为 text', () => {
    const result = inferFieldsFromData({ name: '张三' })
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('name')
    expect(result[0].cell).toBe('text')
  })

  it('推断数字字段为 number', () => {
    const result = inferFieldsFromData({ amount: 1234.56 })
    expect(result[0].cell).toBe('number')
  })

  it('推断布尔字段为 boolean', () => {
    const result = inferFieldsFromData({ isActive: true })
    expect(result[0].cell).toBe('boolean')
  })

  it('推断 ISO 日期字符串为 datetime', () => {
    const result = inferFieldsFromData({ createTime: '2024-01-01T10:30:00' })
    expect(result[0].cell).toBe('datetime')
  })

  it('推断 URL 字符串为 link', () => {
    const result = inferFieldsFromData({ website: 'https://example.com' })
    expect(result[0].cell).toBe('link')
  })

  it('推断 URL 数组为 image', () => {
    const result = inferFieldsFromData({
      images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
    })
    expect(result[0].cell).toBe('image')
  })

  it('推断 file 对象为 file', () => {
    const result = inferFieldsFromData({
      attachment: { name: 'file.pdf', url: 'https://example.com/file.pdf' },
    })
    expect(result[0].cell).toBe('file')
  })

  it('推断 file 对象数组为 file', () => {
    const result = inferFieldsFromData({
      files: [{ name: 'a.pdf', url: '/a.pdf' }],
    })
    expect(result[0].cell).toBe('file')
  })

  it('null 值推断为 text', () => {
    const result = inferFieldsFromData({ note: null })
    expect(result[0].cell).toBe('text')
  })

  it('生成正确的 label', () => {
    const result = inferFieldsFromData({ createTime: '2024-01-01' })
    expect(result[0].label).toBe('Create Time')
  })

  it('多字段综合推断', () => {
    const data = {
      orderNo: 'ORD-001',
      amount: 1299.00,
      status: 'pending',
      createTime: '2024-01-01',
      isActive: false,
    }
    const result = inferFieldsFromData(data)
    expect(result).toHaveLength(5)
    expect(result.find((f) => f.key === 'orderNo')?.cell).toBe('text')
    expect(result.find((f) => f.key === 'amount')?.cell).toBe('number')
    expect(result.find((f) => f.key === 'createTime')?.cell).toBe('datetime')
    expect(result.find((f) => f.key === 'isActive')?.cell).toBe('boolean')
  })
})
