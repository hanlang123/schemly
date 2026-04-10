import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDesignerStore } from '../store/designer'
import type { SchemlySchema } from '@schemly/core'

describe('useDesignerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态正确', () => {
    const store = useDesignerStore()
    expect(store.schemaId).toBe('new-schema')
    expect(store.schemaName).toBe('新建 Schema')
    expect(store.schemaType).toBe('DataTable')
    expect(store.columns).toHaveLength(0)
    expect(store.selectedFieldKey).toBeNull()
  })

  it('buildSchema 返回有效 schema', () => {
    const store = useDesignerStore()
    const schema = store.buildSchema()
    expect(schema.version).toBe('1.0')
    expect(schema.id).toBe('new-schema')
    expect(schema.type).toBe('DataTable')
    expect(schema.props).toBeDefined()
  })

  it('addField 添加字段到 DataTable columns', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    expect(store.columns).toHaveLength(1)
    expect(store.columns[0].key).toBe('name')
  })

  it('addField 添加字段到 Form fields', () => {
    const store = useDesignerStore()
    store.switchType('Form')
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    expect(store.formFields).toHaveLength(1)
  })

  it('addField 添加字段到 Descriptions items', () => {
    const store = useDesignerStore()
    store.switchType('Descriptions')
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    expect(store.descItems).toHaveLength(1)
  })

  it('removeField 移除字段', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    store.addField({ key: 'age', label: '年龄', cell: 'number' })
    store.removeField('name')
    expect(store.columns).toHaveLength(1)
    expect(store.columns[0].key).toBe('age')
  })

  it('removeField 清除选中状态', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    store.selectedFieldKey = 'name'
    store.removeField('name')
    expect(store.selectedFieldKey).toBeNull()
  })

  it('updateField 更新字段属性', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    store.updateField('name', { label: '用户名' })
    expect(store.columns[0].label).toBe('用户名')
  })

  it('moveField 移动字段顺序', () => {
    const store = useDesignerStore()
    store.addField({ key: 'a', label: 'A', cell: 'text' })
    store.addField({ key: 'b', label: 'B', cell: 'text' })
    store.addField({ key: 'c', label: 'C', cell: 'text' })
    store.moveField(0, 2)
    expect(store.columns[0].key).toBe('b')
    expect(store.columns[2].key).toBe('a')
  })

  it('switchType 切换类型', () => {
    const store = useDesignerStore()
    store.switchType('Form')
    expect(store.schemaType).toBe('Form')
    expect(store.selectedFieldKey).toBeNull()
  })

  it('currentFields 根据 type 返回正确列表', () => {
    const store = useDesignerStore()
    store.addField({ key: 'col1', label: 'Col1', cell: 'text' })
    expect(store.currentFields).toHaveLength(1)

    store.switchType('Form')
    expect(store.currentFields).toHaveLength(0)
    store.addField({ key: 'f1', label: 'F1', cell: 'text' })
    expect(store.currentFields).toHaveLength(1)
  })

  it('selectedField 返回选中的字段', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    expect(store.selectedField).toBeNull()
    store.selectedFieldKey = 'name'
    expect(store.selectedField?.key).toBe('name')
  })

  it('setDict / removeDict 管理字典', () => {
    const store = useDesignerStore()
    store.setDict('status', [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ])
    expect(Object.keys(store.dicts)).toHaveLength(1)
    expect(store.dicts.status).toHaveLength(2)

    store.removeDict('status')
    expect(Object.keys(store.dicts)).toHaveLength(0)
  })

  it('undo / redo 正确工作', () => {
    const store = useDesignerStore()
    store.addField({ key: 'a', label: 'A', cell: 'text' })
    store.addField({ key: 'b', label: 'B', cell: 'text' })
    expect(store.columns).toHaveLength(2)
    expect(store.undoStack).toHaveLength(2)

    store.undo()
    expect(store.columns).toHaveLength(1)
    expect(store.redoStack).toHaveLength(1)

    store.redo()
    expect(store.columns).toHaveLength(2)
    expect(store.redoStack).toHaveLength(0)
  })

  it('undo 栈溢出保护 (maxUndoSteps=50)', () => {
    const store = useDesignerStore()
    for (let i = 0; i < 55; i++) {
      store.addField({ key: `f${i}`, label: `F${i}`, cell: 'text' })
    }
    expect(store.undoStack.length).toBeLessThanOrEqual(50)
  })

  it('空 undo/redo 不报错', () => {
    const store = useDesignerStore()
    store.undo()
    store.redo()
    expect(store.columns).toHaveLength(0)
  })

  it('loadSchema 加载 DataTable schema', () => {
    const store = useDesignerStore()
    const schema: SchemlySchema = {
      version: '1.0',
      id: 'test',
      name: '测试',
      type: 'DataTable',
      dicts: {
        status: [{ label: '启用', value: 'active' }],
      },
      props: {
        columns: [
          { key: 'name', label: '姓名', cell: 'text' },
          { key: 'amount', label: '金额', cell: 'currency' },
        ],
        pagination: { enabled: true, pageSize: 10 },
        selection: { enabled: true, rowKey: 'uid' },
        toolbarActions: [{ key: 'add', label: '新增' }],
        rowActions: [{ key: 'edit', label: '编辑' }],
      },
    }
    store.loadSchema(schema)
    expect(store.schemaId).toBe('test')
    expect(store.schemaName).toBe('测试')
    expect(store.columns).toHaveLength(2)
    expect(store.pagination.pageSize).toBe(10)
    expect(store.selection.rowKey).toBe('uid')
    expect(store.toolbarActions).toHaveLength(1)
    expect(store.rowActions).toHaveLength(1)
    expect(store.dicts.status).toHaveLength(1)
  })

  it('loadSchema 加载 Form schema', () => {
    const store = useDesignerStore()
    const schema: SchemlySchema = {
      version: '1.0',
      id: 'form-test',
      name: '表单',
      type: 'Form',
      props: {
        fields: [{ key: 'keyword', label: '关键词', cell: 'text' }],
        layout: { columns: 2, labelWidth: '100px' },
        buttons: { submitText: '搜索', showReset: true },
      },
    }
    store.loadSchema(schema)
    expect(store.schemaType).toBe('Form')
    expect(store.formFields).toHaveLength(1)
    expect(store.formLayout.columns).toBe(2)
  })

  it('loadSchema 加载 Descriptions schema', () => {
    const store = useDesignerStore()
    const schema: SchemlySchema = {
      version: '1.0',
      id: 'desc-test',
      name: '详情',
      type: 'Descriptions',
      props: {
        column: 3,
        items: [{ key: 'name', label: '名称', cell: 'text' }],
      },
    }
    store.loadSchema(schema)
    expect(store.schemaType).toBe('Descriptions')
    expect(store.descItems).toHaveLength(1)
    expect(store.descColumn).toBe(3)
  })

  it('resetAll 重置所有状态', () => {
    const store = useDesignerStore()
    store.addField({ key: 'a', label: 'A', cell: 'text' })
    store.schemaName = '测试'
    store.resetAll()
    expect(store.schemaName).toBe('新建 Schema')
    expect(store.columns).toHaveLength(0)
    expect(store.formFields).toHaveLength(0)
    expect(store.descItems).toHaveLength(0)
  })

  it('buildSchema 包含 dicts 和 externalDeps', () => {
    const store = useDesignerStore()
    store.setDict('status', [{ label: '启用', value: 'active' }])
    store.addField({ key: 'status', label: '状态', cell: 'enum', cellProps: { options: 'dict:status' } })
    const schema = store.buildSchema()
    expect(schema.dicts).toBeDefined()
    expect(schema.externalDeps).toBeDefined()
  })

  it('buildSchema DataTable 包含 actions', () => {
    const store = useDesignerStore()
    store.toolbarActions.push({ key: 'add', label: '新增' })
    store.rowActions.push({ key: 'del', label: '删除', danger: true })
    const schema = store.buildSchema()
    const props = schema.props as any
    expect(props.toolbarActions).toHaveLength(1)
    expect(props.rowActions).toHaveLength(1)
    expect(props.rowActionStyle).toBeDefined()
  })

  it('buildSchema 含 permission', () => {
    const store = useDesignerStore()
    store.schemaPermission = 'order:view'
    const schema = store.buildSchema()
    expect(schema.permission).toBe('order:view')
  })

  it('buildSchema Form 包含 layout / buttons', () => {
    const store = useDesignerStore()
    store.switchType('Form')
    store.addField({ key: 'k', label: 'K', cell: 'text' })
    const schema = store.buildSchema()
    const props = schema.props as any
    expect(props.layout).toBeDefined()
    expect(props.fields).toHaveLength(1)
    expect(props.buttons).toBeDefined()
  })

  it('buildSchema Descriptions 包含 column / items', () => {
    const store = useDesignerStore()
    store.switchType('Descriptions')
    store.descColumn = 3
    store.addField({ key: 'k', label: 'K', cell: 'text' })
    const schema = store.buildSchema()
    const props = schema.props as any
    expect(props.column).toBe(3)
    expect(props.items).toHaveLength(1)
  })

  it('validationIssues 对空 schema 无问题', () => {
    const store = useDesignerStore()
    store.addField({ key: 'name', label: '姓名', cell: 'text' })
    expect(store.validationIssues.length).toBe(0)
  })

  it('loadSchema 有 createForm / updateForm', () => {
    const store = useDesignerStore()
    const schema: SchemlySchema = {
      version: '1.0',
      id: 'test',
      name: 'Test',
      type: 'DataTable',
      props: {
        columns: [{ key: 'name', label: 'Name', cell: 'text' }],
        createForm: {
          title: 'New',
          fields: ['name'],
          layout: { columns: 1, labelWidth: '80px' },
        },
        updateForm: {
          title: 'Edit',
          fields: ['name'],
          layout: { columns: 1, labelWidth: '80px' },
          overrides: { name: { disabled: true } },
        },
      },
    }
    store.loadSchema(schema)
    expect(store.createForm).toBeDefined()
    expect(store.updateForm).toBeDefined()
    expect(store.createForm?.title).toBe('New')
    expect(store.updateForm?.overrides?.name?.disabled).toBe(true)
  })

  it('loadSchema pagination boolean', () => {
    const store = useDesignerStore()
    const schema: SchemlySchema = {
      version: '1.0',
      id: 'test',
      name: 'Test',
      type: 'DataTable',
      props: {
        columns: [],
        pagination: true,
      },
    }
    store.loadSchema(schema)
    expect(store.pagination.enabled).toBe(true)
  })
})
