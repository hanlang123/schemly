import { describe, it, expect } from 'vitest'
import { validateSchema } from '../validator'
import type { SchemlySchema } from '../types'

function makeSchema(overrides: Partial<SchemlySchema> = {}): SchemlySchema {
  return {
    version: '1.0',
    id: 'test',
    name: 'Test',
    type: 'DataTable',
    props: {
      columns: [
        { key: 'name', label: '姓名', cell: 'text' },
      ],
    },
    ...overrides,
  } as SchemlySchema
}

describe('validateSchema', () => {
  it('合法 schema 无问题', () => {
    const issues = validateSchema(makeSchema())
    expect(issues).toHaveLength(0)
  })

  it('缺少必填字段报错', () => {
    const issues = validateSchema({} as SchemlySchema)
    expect(issues.some((i) => i.path === 'version')).toBe(true)
    expect(issues.some((i) => i.path === 'id')).toBe(true)
    expect(issues.some((i) => i.path === 'type')).toBe(true)
  })

  it('无效的 type 报错', () => {
    const issues = validateSchema(makeSchema({ type: 'Invalid' as any }))
    expect(issues.some((i) => i.message.includes('无效的 type'))).toBe(true)
  })

  it('空 columns 报错', () => {
    const issues = validateSchema(makeSchema({ props: { columns: [] } } as any))
    expect(issues.some((i) => i.message.includes('columns 不能为空'))).toBe(true)
  })

  it('重复 key 报错', () => {
    const issues = validateSchema(makeSchema({
      props: {
        columns: [
          { key: 'name', label: '姓名', cell: 'text' },
          { key: 'name', label: '名字', cell: 'text' },
        ],
      },
    } as any))
    expect(issues.some((i) => i.message.includes('重复的 key'))).toBe(true)
  })

  it('非法 displayAs 组合警告', () => {
    const issues = validateSchema(makeSchema({
      props: {
        columns: [
          { key: 'name', label: '姓名', cell: 'text', displayAs: 'progress' },
        ],
      },
    } as any))
    expect(issues.some((i) => i.severity === 'warning' && i.message.includes('不是合法组合'))).toBe(true)
  })

  it('非法 editAs 组合警告', () => {
    const issues = validateSchema(makeSchema({
      props: {
        columns: [
          { key: 'name', label: '姓名', cell: 'text', editAs: 'select' },
        ],
      },
    } as any))
    expect(issues.some((i) => i.message.includes('editAs'))).toBe(true)
  })

  it('createForm 引用不存在的字段警告', () => {
    const issues = validateSchema(makeSchema({
      props: {
        columns: [{ key: 'name', label: '姓名', cell: 'text' }],
        createForm: {
          title: '新增',
          fields: ['name', 'notExist'],
        },
      },
    } as any))
    expect(issues.some((i) => i.message.includes('notExist'))).toBe(true)
  })

  it('updateForm overrides 引用不存在的字段警告', () => {
    const issues = validateSchema(makeSchema({
      props: {
        columns: [{ key: 'name', label: '姓名', cell: 'text' }],
        updateForm: {
          title: '编辑',
          fields: ['name'],
          overrides: { notExist: { disabled: true } },
        },
      },
    } as any))
    expect(issues.some((i) => i.message.includes('notExist'))).toBe(true)
  })

  it('Form 类型校验', () => {
    const issues = validateSchema({
      version: '1.0', id: 'f', name: 'F', type: 'Form',
      props: { fields: [] },
    } as SchemlySchema)
    expect(issues.some((i) => i.message.includes('fields 不能为空'))).toBe(true)
  })

  it('Descriptions 类型校验', () => {
    const issues = validateSchema({
      version: '1.0', id: 'd', name: 'D', type: 'Descriptions',
      props: { items: [] },
    } as SchemlySchema)
    expect(issues.some((i) => i.message.includes('items 不能为空'))).toBe(true)
  })
})
