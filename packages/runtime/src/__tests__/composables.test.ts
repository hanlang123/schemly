import { describe, it, expect } from 'vitest'
import { useCellResolver } from '../composables/useCellResolver'
import type { CellDeclaration, DictItem, Providers } from '@schemly/core'

describe('useCellResolver', () => {
  const schemaDicts: Record<string, DictItem[]> = {
    status: [
      { label: '待处理', value: 'pending', color: 'warning' },
      { label: '已完成', value: 'done', color: 'success' },
    ],
  }

  it('解析基础 text cell', () => {
    const cell: CellDeclaration = { key: 'name', label: '姓名', cell: 'text' }
    const result = useCellResolver(cell, schemaDicts, {})
    expect(result.displayAs).toBe('text')
    expect(result.editAs).toBe('input')
    expect(result.viewVisible).toBe(true)
    expect(result.editMode).toBe('edit')
  })

  it('解析 enum cell 并获取 dict items', () => {
    const cell: CellDeclaration = {
      key: 'status', label: '状态', cell: 'enum',
      cellProps: { options: 'dict:status' },
    }
    const result = useCellResolver(cell, schemaDicts, {})
    expect(result.displayAs).toBe('tag')
    expect(result.dictItems).toHaveLength(2)
    expect(result.dictItems[0].label).toBe('待处理')
  })

  it('enum 远程搜索降级 displayAs 为 text', () => {
    const cell: CellDeclaration = {
      key: 'user', label: '用户', cell: 'enum',
      cellProps: { options: 'remote:searchUser' },
    }
    const result = useCellResolver(cell, schemaDicts, {})
    expect(result.displayAs).toBe('text')
  })

  it('权限检查 — view 无权限时 viewVisible 为 false', () => {
    const cell: CellDeclaration = {
      key: 'cost', label: '成本', cell: 'currency',
      permission: { view: 'cost:view' },
    }
    const providers: Providers = { auth: { hasPermission: () => false } }
    const result = useCellResolver(cell, schemaDicts, providers)
    expect(result.viewVisible).toBe(false)
  })

  it('权限检查 — edit 无权限降级为 display', () => {
    const cell: CellDeclaration = {
      key: 'amount', label: '金额', cell: 'currency',
      permission: { view: true, edit: 'amount:edit' },
    }
    const providers: Providers = { auth: { hasPermission: () => false } }
    const result = useCellResolver(cell, schemaDicts, providers)
    expect(result.viewVisible).toBe(true)
    expect(result.editMode).toBe('display')
  })

  it('override 覆盖权限', () => {
    const cell: CellDeclaration = {
      key: 'amount', label: '金额', cell: 'currency',
      permission: { view: true, edit: 'amount:edit' },
    }
    const providers: Providers = { auth: { hasPermission: () => false } }
    const result = useCellResolver(cell, schemaDicts, providers, { permission: { edit: true } })
    expect(result.editMode).toBe('edit')
  })
})
