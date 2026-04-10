import { describe, it, expect } from 'vitest'
import {
  resolveDisplayAs,
  resolveEditAs,
  isValidDisplayCombination,
  isValidEditCombination,
  normalizePermission,
  checkPermission,
  checkCellViewPermission,
  checkCellEditPermission,
  mergeFieldPermission,
  parseOptionsPrefix,
  resolveDictItems,
  findDictLabel,
  findDictColor,
  parseSchema,
} from '../resolvers'
import type { CellDeclaration, SchemlySchema } from '../types'

describe('resolveDisplayAs', () => {
  it('返回显式指定的 displayAs', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text', displayAs: 'copy' }
    expect(resolveDisplayAs(cell)).toBe('copy')
  })

  it('返回默认 displayAs', () => {
    expect(resolveDisplayAs({ key: 'a', label: 'A', cell: 'text' })).toBe('text')
    expect(resolveDisplayAs({ key: 'a', label: 'A', cell: 'currency' })).toBe('currency')
    expect(resolveDisplayAs({ key: 'a', label: 'A', cell: 'enum' })).toBe('tag')
  })

  it('enum 远程搜索降级为 text', () => {
    const cell: CellDeclaration = {
      key: 'a', label: 'A', cell: 'enum',
      cellProps: { options: 'remote:searchUser' },
    }
    expect(resolveDisplayAs(cell)).toBe('text')
  })

  it('enum 非远程搜索保持 tag', () => {
    const cell: CellDeclaration = {
      key: 'a', label: 'A', cell: 'enum',
      cellProps: { options: 'dict:status' },
    }
    expect(resolveDisplayAs(cell)).toBe('tag')
  })
})

describe('resolveEditAs', () => {
  it('返回显式指定的 editAs', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text', editAs: 'textarea' }
    expect(resolveEditAs(cell)).toBe('textarea')
  })

  it('返回默认 editAs', () => {
    expect(resolveEditAs({ key: 'a', label: 'A', cell: 'text' })).toBe('input')
    expect(resolveEditAs({ key: 'a', label: 'A', cell: 'enum' })).toBe('select')
    expect(resolveEditAs({ key: 'a', label: 'A', cell: 'boolean' })).toBe('switch')
  })
})

describe('isValidDisplayCombination', () => {
  it('合法组合返回 true', () => {
    expect(isValidDisplayCombination('text', 'text')).toBe(true)
    expect(isValidDisplayCombination('text', 'copy')).toBe(true)
    expect(isValidDisplayCombination('enum', 'tag')).toBe(true)
    expect(isValidDisplayCombination('number', 'progress')).toBe(true)
  })

  it('非法组合返回 false', () => {
    expect(isValidDisplayCombination('text', 'tag')).toBe(false)
    expect(isValidDisplayCombination('enum', 'progress')).toBe(false)
  })
})

describe('isValidEditCombination', () => {
  it('合法组合返回 true', () => {
    expect(isValidEditCombination('text', 'input')).toBe(true)
    expect(isValidEditCombination('text', 'textarea')).toBe(true)
    expect(isValidEditCombination('enum', 'radio')).toBe(true)
  })

  it('非法组合返回 false', () => {
    expect(isValidEditCombination('text', 'select')).toBe(false)
    expect(isValidEditCombination('number', 'input')).toBe(false)
  })
})

describe('normalizePermission', () => {
  it('undefined 返回默认 { view: true, edit: true }', () => {
    expect(normalizePermission(undefined)).toEqual({ view: true, edit: true })
  })

  it('字符串简写展开', () => {
    expect(normalizePermission('order:view')).toEqual({ view: 'order:view', edit: 'order:view' })
  })

  it('对象格式填充默认值', () => {
    expect(normalizePermission({ edit: 'order:edit' })).toEqual({ view: true, edit: 'order:edit' })
  })
})

describe('checkPermission', () => {
  it('boolean 直接返回', () => {
    expect(checkPermission(true)).toBe(true)
    expect(checkPermission(false)).toBe(false)
  })

  it('无 hasPermission 函数时默认 true', () => {
    expect(checkPermission('order:view')).toBe(true)
  })

  it('调用 hasPermission', () => {
    const has = (code: string) => code === 'order:view'
    expect(checkPermission('order:view', has)).toBe(true)
    expect(checkPermission('order:edit', has)).toBe(false)
  })
})

describe('checkCellViewPermission', () => {
  it('无权限声明默认可见', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text' }
    expect(checkCellViewPermission(cell)).toBe(true)
  })

  it('有 view 权限码且通过', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text', permission: { view: 'p1' } }
    expect(checkCellViewPermission(cell, () => true)).toBe(true)
  })

  it('有 view 权限码且不通过', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text', permission: { view: 'p1' } }
    expect(checkCellViewPermission(cell, () => false)).toBe(false)
  })
})

describe('checkCellEditPermission', () => {
  it('无权限声明返回 edit', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text' }
    expect(checkCellEditPermission(cell)).toBe('edit')
  })

  it('view 无权限返回 hidden', () => {
    const cell: CellDeclaration = { key: 'a', label: 'A', cell: 'text', permission: { view: 'p1' } }
    expect(checkCellEditPermission(cell, () => false)).toBe('hidden')
  })

  it('view 有权限但 edit 无权限返回 display', () => {
    const cell: CellDeclaration = {
      key: 'a', label: 'A', cell: 'text',
      permission: { view: true, edit: 'p2' },
    }
    expect(checkCellEditPermission(cell, () => false)).toBe('display')
  })

  it('overrides 覆盖权限', () => {
    const cell: CellDeclaration = {
      key: 'a', label: 'A', cell: 'text',
      permission: { view: true, edit: 'p2' },
    }
    expect(checkCellEditPermission(cell, () => false, { permission: { edit: true } })).toBe('edit')
  })
})

describe('mergeFieldPermission', () => {
  it('无 override 返回原始', () => {
    const perm = { view: true as const, edit: 'p1' }
    expect(mergeFieldPermission(perm)).toEqual(perm)
  })

  it('override 覆盖', () => {
    const perm = { view: true as const, edit: 'p1' as string | boolean }
    expect(mergeFieldPermission(perm, { permission: { edit: true } }))
      .toEqual({ view: true, edit: true })
  })
})

describe('parseOptionsPrefix', () => {
  it('解析 dict 前缀', () => {
    expect(parseOptionsPrefix('dict:orderStatus')).toEqual({ type: 'dict', key: 'orderStatus' })
  })

  it('解析 api 前缀', () => {
    expect(parseOptionsPrefix('api:fetchDept')).toEqual({ type: 'api', key: 'fetchDept' })
  })

  it('解析 remote 前缀', () => {
    expect(parseOptionsPrefix('remote:searchUser')).toEqual({ type: 'remote', key: 'searchUser' })
  })

  it('无效前缀返回 null', () => {
    expect(parseOptionsPrefix('invalid')).toBeNull()
  })
})

describe('resolveDictItems', () => {
  it('优先返回 schemaDicts', () => {
    const schema = { status: [{ label: 'A', value: 1 }] }
    const provider = { status: [{ label: 'B', value: 2 }] }
    expect(resolveDictItems('status', schema, provider)).toEqual(schema.status)
  })

  it('schemaDicts 不存在时返回 providerDicts', () => {
    const provider = { status: [{ label: 'B', value: 2 }] }
    expect(resolveDictItems('status', {}, provider)).toEqual(provider.status)
  })

  it('都不存在时返回 null', () => {
    expect(resolveDictItems('status', {}, {})).toBeNull()
  })
})

describe('findDictLabel', () => {
  const items = [
    { label: '待处理', value: 'pending' },
    { label: '已完成', value: 'done' },
  ]

  it('找到匹配项', () => {
    expect(findDictLabel('pending', items)).toBe('待处理')
  })

  it('未找到返回 undefined', () => {
    expect(findDictLabel('cancelled', items)).toBeUndefined()
  })
})

describe('findDictColor', () => {
  const items = [
    { label: '待处理', value: 'pending', color: 'warning' },
    { label: '已完成', value: 'done', color: 'success' },
  ]

  it('优先使用 colorsMap', () => {
    expect(findDictColor('pending', items, { pending: 'danger' })).toBe('danger')
  })

  it('其次使用 dict 项的 color', () => {
    expect(findDictColor('pending', items)).toBe('warning')
  })

  it('都没有时返回 info', () => {
    expect(findDictColor('unknown', items)).toBe('info')
  })
})

describe('parseSchema', () => {
  it('填充默认值', () => {
    const schema = {
      id: 'test', name: 'Test', type: 'DataTable' as const,
      props: { columns: [] },
    } as unknown as SchemlySchema

    const result = parseSchema(schema)
    expect(result.version).toBe('1.0')
    expect(result.dicts).toEqual({})
    expect(result.externalDeps).toEqual({ dicts: [], functions: [], permissions: [] })
  })
})
