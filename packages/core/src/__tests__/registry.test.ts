import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerCellType,
  getCustomCellType,
  registerDisplayRenderer,
  getDisplayRenderer,
  registerEditRenderer,
  getEditRenderer,
  registerMigration,
  migrateSchema,
  checkVersionCompatibility,
  resetRegistry,
} from '../registry'
import { resolveDisplayAs, resolveEditAs } from '../resolvers'
import type { SchemlySchema } from '../types'

beforeEach(() => {
  resetRegistry()
})

describe('自定义 Cell Type', () => {
  it('注册和获取自定义类型', () => {
    registerCellType('employee', { defaultDisplayAs: 'employeeCard', defaultEditAs: 'employeeSelect' })
    const config = getCustomCellType('employee')
    expect(config).toEqual({ defaultDisplayAs: 'employeeCard', defaultEditAs: 'employeeSelect' })
  })

  it('未注册返回 undefined', () => {
    expect(getCustomCellType('notExist')).toBeUndefined()
  })

  it('自定义类型通过 resolveDisplayAs/resolveEditAs 工作', () => {
    registerCellType('employee', { defaultDisplayAs: 'employeeCard', defaultEditAs: 'employeeSelect' })
    const cell = { key: 'mgr', label: '经理', cell: 'employee' as any }
    expect(resolveDisplayAs(cell)).toBe('employeeCard')
    expect(resolveEditAs(cell)).toBe('employeeSelect')
  })
})

describe('自定义渲染器', () => {
  it('注册和获取 display 渲染器', () => {
    const fn = () => 'rendered'
    registerDisplayRenderer('card', fn)
    expect(getDisplayRenderer('card')).toBe(fn)
  })

  it('注册和获取 edit 渲染器', () => {
    const fn = () => 'editor'
    registerEditRenderer('picker', fn)
    expect(getEditRenderer('picker')).toBe(fn)
  })
})

describe('版本迁移', () => {
  it('不需要迁移时返回原 schema', () => {
    const schema = { version: '1.0' } as SchemlySchema
    expect(migrateSchema(schema, '1.0')).toBe(schema)
  })

  it('链式迁移', () => {
    registerMigration('1.0', '1.1', (s) => ({ ...s, version: '1.1', name: s.name + '_v1.1' }))
    registerMigration('1.1', '2.0', (s) => ({ ...s, version: '2.0', name: s.name + '_v2.0' }))

    const schema = { version: '1.0', name: 'test' } as SchemlySchema
    const result = migrateSchema(schema, '2.0')
    expect(result.version).toBe('2.0')
    expect(result.name).toBe('test_v1.1_v2.0')
  })
})

describe('checkVersionCompatibility', () => {
  it('major 一致为 compatible', () => {
    expect(checkVersionCompatibility('1.0', '1.1')).toBe('compatible')
  })

  it('schema major 低于 runtime 为 migrate', () => {
    expect(checkVersionCompatibility('1.0', '2.0')).toBe('migrate')
  })

  it('schema major 高于 runtime 为 incompatible', () => {
    expect(checkVersionCompatibility('2.0', '1.0')).toBe('incompatible')
  })
})
