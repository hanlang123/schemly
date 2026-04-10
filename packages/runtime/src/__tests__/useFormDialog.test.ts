import { describe, it, expect } from 'vitest'
import { useFormDialog } from '../composables/useFormDialog'
import type { CellDeclaration, FormDialogConfig } from '@schemly/core'

describe('useFormDialog', () => {
  const columns: CellDeclaration[] = [
    { key: 'name', label: '姓名', cell: 'text' },
    { key: 'amount', label: '金额', cell: 'currency' },
    { key: 'status', label: '状态', cell: 'enum' },
  ]

  const config: FormDialogConfig = {
    title: '新增',
    fields: ['name', 'amount'],
    layout: { columns: 1, labelWidth: '80px' },
    rules: {
      name: [{ required: true, message: '请输入' }],
    },
    overrides: {
      amount: { defaultValue: 100 },
    },
  }

  it('初始状态', () => {
    const { state } = useFormDialog(config, columns, {})
    expect(state.visible).toBe(false)
    expect(state.isEdit).toBe(false)
    expect(state.currentRow).toBeNull()
  })

  it('openCreate 打开新增弹窗', () => {
    const { state, openCreate } = useFormDialog(config, columns, {})
    openCreate()
    expect(state.visible).toBe(true)
    expect(state.isEdit).toBe(false)
    expect(state.formData.amount).toBe(100) // override defaultValue
    expect(state.formData.name).toBeUndefined()
  })

  it('openUpdate 打开编辑弹窗并回填数据', () => {
    const { state, openUpdate } = useFormDialog(config, columns, {})
    openUpdate({ name: '张三', amount: 500 })
    expect(state.visible).toBe(true)
    expect(state.isEdit).toBe(true)
    expect(state.formData.name).toBe('张三')
    expect(state.formData.amount).toBe(500)
    expect(state.currentRow).toEqual({ name: '张三', amount: 500 })
  })

  it('close 关闭弹窗', () => {
    const { state, openCreate, close } = useFormDialog(config, columns, {})
    openCreate()
    close()
    expect(state.visible).toBe(false)
    expect(state.currentRow).toBeNull()
  })

  it('getFieldConfig 返回字段配置', () => {
    const { getFieldConfig } = useFormDialog(config, columns, {})
    const result = getFieldConfig('name')
    expect(result?.cell.key).toBe('name')
    expect(result?.override).toBeUndefined()

    const amountResult = getFieldConfig('amount')
    expect(amountResult?.override?.defaultValue).toBe(100)
  })

  it('getFieldConfig 字段不存在返回 null', () => {
    const { getFieldConfig } = useFormDialog(config, columns, {})
    expect(getFieldConfig('nonexistent')).toBeNull()
  })

  it('getFieldRules 返回校验规则', () => {
    const { getFieldRules } = useFormDialog(config, columns, {})
    expect(getFieldRules('name')).toHaveLength(1)
    expect(getFieldRules('amount')).toHaveLength(0)
  })

  it('markDirty 标记修改', () => {
    const { dirty, markDirty } = useFormDialog(config, columns, {})
    expect(dirty.value).toBe(false)
    markDirty()
    expect(dirty.value).toBe(true)
  })

  it('config undefined 时不报错', () => {
    const { state, openCreate, getFieldConfig } = useFormDialog(undefined, columns, {})
    openCreate()
    expect(state.formData).toEqual({})
    expect(getFieldConfig('name')?.cell.key).toBe('name')
  })

  it('openUpdate config undefined 时不报错', () => {
    const { state, openUpdate } = useFormDialog(undefined, columns, {})
    openUpdate({ name: 'test' })
    expect(state.formData).toEqual({})
  })
})
