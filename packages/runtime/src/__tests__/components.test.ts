import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { CellRenderer } from '../components/CellRenderer'
import { ImageDisplay, FileDisplay } from '../renderers/display/media-renderers'
import { DetailDisplay } from '../renderers/display/detail-renderer'
import ElementPlus from 'element-plus'

const globalPlugins = { plugins: [ElementPlus] }

describe('CellRenderer', () => {
  it('渲染 text cell', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'name', label: '姓名', cell: 'text' },
        value: 'hello',
      },
      global: globalPlugins,
    })
    expect(w.text()).toBe('hello')
  })

  it('渲染 currency cell', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'amount', label: '金额', cell: 'currency' },
        value: 1234.5,
      },
      global: globalPlugins,
    })
    expect(w.text()).toContain('¥')
    expect(w.text()).toContain('1,234.50')
  })

  it('渲染 enum cell with dict', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'status', label: '状态', cell: 'enum', cellProps: { options: 'dict:status' }, displayAs: 'tag' },
        value: 'active',
        schemaDicts: {
          status: [{ label: '启用', value: 'active', color: 'success' }],
        },
      },
      global: globalPlugins,
    })
    expect(w.text()).toBe('启用')
  })

  it('edit 模式回退为纯文本', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'name', label: '姓名', cell: 'text' },
        value: 'test',
        mode: 'edit',
      },
      global: globalPlugins,
    })
    expect(w.text()).toBe('test')
  })

  it('未知 displayAs 回退为纯文本', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'x', label: 'X', cell: 'text', displayAs: 'unknown-renderer' as any },
        value: 'val',
      },
      global: globalPlugins,
    })
    expect(w.text()).toBe('val')
  })

  it('value 为 null 时渲染空字符串', () => {
    const w = mount(CellRenderer, {
      props: {
        cell: { key: 'name', label: '姓名', cell: 'text' },
        value: null,
      },
      global: globalPlugins,
    })
    expect(w.text()).toBe('')
  })
})

describe('ImageDisplay', () => {
  it('渲染单张图片', () => {
    const w = mount(ImageDisplay, {
      props: {
        value: 'https://example.com/img.jpg',
        cellProps: {},
      },
      global: globalPlugins,
    })
    expect(w.find('.el-image').exists()).toBe(true)
  })

  it('渲染多张图片', () => {
    const w = mount(ImageDisplay, {
      props: {
        value: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
        cellProps: { multiple: true },
      },
      global: globalPlugins,
    })
    const images = w.findAll('.el-image')
    expect(images.length).toBe(2)
  })

  it('空值渲染占位符', () => {
    const w = mount(ImageDisplay, {
      props: { value: '', cellProps: {} },
      global: globalPlugins,
    })
    expect(w.text()).toBe('—')
  })
})

describe('FileDisplay', () => {
  it('渲染单个文件', () => {
    const w = mount(FileDisplay, {
      props: {
        value: { name: 'test.pdf', url: '/test.pdf' },
        cellProps: {},
      },
      global: globalPlugins,
    })
    expect(w.text()).toContain('test.pdf')
  })

  it('渲染文件列表', () => {
    const w = mount(FileDisplay, {
      props: {
        value: [
          { name: 'a.pdf', url: '/a.pdf' },
          { name: 'b.doc', url: '/b.doc' },
        ],
        cellProps: { multiple: true },
      },
      global: globalPlugins,
    })
    expect(w.text()).toContain('a.pdf')
    expect(w.text()).toContain('b.doc')
  })

  it('空值显示占位', () => {
    const w = mount(FileDisplay, {
      props: { value: null as any, cellProps: {} },
      global: globalPlugins,
    })
    expect(w.text()).toBe('—')
  })
})

describe('DetailDisplay', () => {
  it('渲染详情按钮', () => {
    const w = mount(DetailDisplay, {
      props: {
        value: '这是一段详情文本',
        cellProps: {},
      },
      global: globalPlugins,
    })
    expect(w.text()).toContain('查看')
  })

  it('link 触发方式', () => {
    const w = mount(DetailDisplay, {
      props: {
        value: '详情内容',
        cellProps: { triggerMode: 'link' },
      },
      global: globalPlugins,
    })
    expect(w.text()).toContain('查看')
  })
})
