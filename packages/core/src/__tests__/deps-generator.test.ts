import { describe, it, expect } from 'vitest'
import { generateExternalDeps } from '../deps-generator'
import type { SchemlySchema } from '../types'

describe('generateExternalDeps', () => {
  it('扫描 Type 级权限', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      permission: 'order:view',
      props: { columns: [{ key: 'name', label: '姓名', cell: 'text' }] },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.permissions).toContainEqual(
      expect.objectContaining({ code: 'order:view', scope: 'type' }),
    )
  })

  it('扫描 Cell 级权限', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      props: {
        columns: [{
          key: 'amount', label: '金额', cell: 'currency',
          permission: { view: true, edit: 'order:amount:edit' },
        }],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.permissions).toContainEqual(
      expect.objectContaining({ code: 'order:amount:edit', scope: 'cell:edit' }),
    )
  })

  it('扫描 api/remote 函数', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      props: {
        columns: [
          { key: 'dept', label: '部门', cell: 'enum', cellProps: { options: 'api:fetchDept' } },
          { key: 'user', label: '用户', cell: 'enum', cellProps: { options: 'remote:searchUser' } },
        ],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'fetchDept', type: 'api' }))
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'searchUser', type: 'remote' }))
  })

  it('扫描上传函数', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      props: {
        columns: [
          { key: 'photo', label: '图片', cell: 'image' },
          { key: 'doc', label: '文件', cell: 'file', cellProps: { uploadFn: 'customUpload' } },
        ],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'uploadImage', type: 'upload:image' }))
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'customUpload', type: 'upload:file' }))
  })

  it('扫描 Action 权限', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      props: {
        columns: [{ key: 'name', label: '姓名', cell: 'text' }],
        toolbarActions: [{ key: 'create', label: '新增', permission: 'order:create' }],
        rowActions: [{ key: 'delete', label: '删除', permission: 'order:delete' }],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.permissions).toContainEqual(expect.objectContaining({ code: 'order:create', scope: 'action' }))
    expect(deps.permissions).toContainEqual(expect.objectContaining({ code: 'order:delete', scope: 'action' }))
  })

  it('外部字典依赖（不在 schema.dicts 中）', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      dicts: { status: [{ label: 'A', value: 1 }] },
      props: {
        columns: [
          { key: 's', label: '状态', cell: 'enum', cellProps: { options: 'dict:status' } },
          { key: 'r', label: '角色', cell: 'enum', cellProps: { options: 'dict:roleList' } },
        ],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.dicts).toContain('roleList')
    expect(deps.dicts).not.toContain('status')
  })

  it('扫描表单 overrides 权限和 rules validator', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'DataTable',
      props: {
        columns: [
          { key: 'amount', label: '金额', cell: 'currency' },
        ],
        createForm: {
          title: '新增',
          fields: ['amount'],
          overrides: { amount: { permission: { edit: 'order:amount:edit' } } },
          rules: { amount: [{ validator: 'validateAmount', message: '金额不合法' }] },
        },
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.permissions).toContainEqual(expect.objectContaining({ code: 'order:amount:edit' }))
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'validateAmount', type: 'validator' }))
  })

  it('Form 类型扫描', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'Form',
      props: {
        fields: [
          { key: 'status', label: '状态', cell: 'enum', cellProps: { options: 'api:fetchStatus' } },
        ],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.functions).toContainEqual(expect.objectContaining({ key: 'fetchStatus', type: 'api' }))
  })

  it('Descriptions 类型扫描', () => {
    const schema: SchemlySchema = {
      version: '1.0', id: 'test', name: 'Test', type: 'Descriptions',
      permission: 'order:detail:view',
      props: {
        items: [{ key: 'name', label: '姓名', cell: 'text' }],
      },
    }
    const deps = generateExternalDeps(schema)
    expect(deps.permissions).toContainEqual(expect.objectContaining({ code: 'order:detail:view' }))
  })
})
