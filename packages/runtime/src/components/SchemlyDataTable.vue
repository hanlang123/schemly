<script lang="ts">
import { defineComponent, h, computed, resolveComponent, ref } from 'vue'
import type { PropType } from 'vue'
import type {
  DataTableProps, DictItem, Providers, RowAction, ToolbarAction,
} from '@schemly/core'
import {
  DEFAULT_PAGINATION, DEFAULT_ROW_ACTION_STYLE,
  checkPermission, checkCellViewPermission,
} from '@schemly/core'
import { CellRenderer } from './CellRenderer'

export default defineComponent({
  name: 'SchemlyDataTable',
  props: {
    tableProps: { type: Object as PropType<DataTableProps>, required: true },
    data: { type: Array as PropType<Record<string, unknown>[]>, default: () => [] },
    schemaDicts: { type: Object as PropType<Record<string, DictItem[]>>, default: () => ({}) },
    providers: { type: Object as PropType<Providers>, default: () => ({}) },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: '暂无数据' },
  },
  emits: ['action', 'createSubmit', 'updateSubmit', 'sort-change', 'page-change', 'selection-change'],
  setup(props, { emit }) {
    const currentPage = ref(1)
    const currentPageSize = ref(20)
    const selectedRows = ref<Record<string, unknown>[]>([])

    // Pagination
    const pagination = computed(() => {
      const p = props.tableProps.pagination
      if (p === false || p === undefined) return null
      if (p === true) return { ...DEFAULT_PAGINATION }
      return { ...DEFAULT_PAGINATION, ...p }
    })

    // Selection
    const selection = computed(() => props.tableProps.selection)

    // Row action style
    const rowActionStyle = computed(() => ({
      ...DEFAULT_ROW_ACTION_STYLE,
      ...(props.tableProps.rowActionStyle ?? {}),
    }))

    // 可见 columns（权限过滤）
    const visibleColumns = computed(() => {
      return props.tableProps.columns.filter((col) => {
        return checkCellViewPermission(col, props.providers.auth?.hasPermission)
      })
    })

    // 工具栏 actions（权限过滤）
    const visibleToolbarActions = computed(() => {
      return (props.tableProps.toolbarActions ?? []).filter((action) => {
        if (!action.permission) return true
        return checkPermission(action.permission, props.providers.auth?.hasPermission)
      })
    })

    // 行 actions（权限过滤，行级控制）
    const getVisibleRowActions = (row: Record<string, unknown>) => {
      return (props.tableProps.rowActions ?? []).filter((action) => {
        // 权限检查
        if (action.permission && !checkPermission(action.permission, props.providers.auth?.hasPermission)) {
          return false
        }
        // 行级控制
        if (props.providers.actionControl) {
          const control = props.providers.actionControl(row)
          if (control[action.key] === false) return false
        }
        return true
      }).map((action) => {
        let disabled = false
        if (props.providers.actionControl) {
          const control = props.providers.actionControl(row)
          if (control[action.key] === 'disabled') disabled = true
        }
        return { ...action, _disabled: disabled }
      })
    }

    const handleAction = (action: RowAction | ToolbarAction, row?: Record<string, unknown>) => {
      const isBatch = 'batch' in action && action.batch

      if (action.confirm) {
        // 使用 ElMessageBox confirm
        const ElMessageBox = (window as any).ElMessageBox
        if (ElMessageBox) {
          ElMessageBox.confirm(action.confirm, '确认', { type: 'warning' }).then(() => {
            doAction(action, row, isBatch)
          }).catch(() => {})
        } else {
          doAction(action, row, isBatch)
        }
      } else {
        doAction(action, row, isBatch)
      }
    }

    const doAction = (action: RowAction | ToolbarAction, row?: Record<string, unknown>, isBatch?: boolean) => {
      if (isBatch) {
        emit('action', { key: action.key, rows: selectedRows.value })
      } else {
        emit('action', { key: action.key, row })
      }
    }

    return () => {
      const ElTable = resolveComponent('ElTable')
      const ElTableColumn = resolveComponent('ElTableColumn')
      const ElPagination = resolveComponent('ElPagination')
      const ElButton = resolveComponent('ElButton')
      const ElLink = resolveComponent('ElLink')
      const ElDropdown = resolveComponent('ElDropdown')
      const ElDropdownMenu = resolveComponent('ElDropdownMenu')
      const ElDropdownItem = resolveComponent('ElDropdownItem')

      // 构建列
      const columnNodes: ReturnType<typeof h>[] = []

      // Selection column
      if (selection.value?.enabled) {
        columnNodes.push(h(ElTableColumn, { type: 'selection', width: 55 }))
      }

      // Data columns
      for (const col of visibleColumns.value) {
        columnNodes.push(h(ElTableColumn, {
          prop: col.key,
          label: col.label,
          width: col.column?.width,
          minWidth: col.column?.minWidth,
          fixed: col.column?.fixed,
          align: col.column?.align ?? 'left',
          sortable: col.column?.sortable ? 'custom' : false,
          resizable: col.column?.resizable ?? true,
          showOverflowTooltip: col.column?.showOverflowTooltip ?? true,
        }, {
          default: ({ row }: { row: Record<string, unknown> }) => {
            return h(CellRenderer, {
              cell: col,
              value: row[col.key] as any,
              row,
              schemaDicts: props.schemaDicts,
              providers: props.providers,
              mode: 'display',
            })
          },
        }))
      }

      // Row actions column
      const rowActions = props.tableProps.rowActions
      if (rowActions && rowActions.length > 0) {
        columnNodes.push(h(ElTableColumn, {
          label: '操作',
          fixed: 'right',
          width: Math.max(80, rowActions.length * 60),
          align: 'center',
        }, {
          default: ({ row }: { row: Record<string, unknown> }) => {
            const actions = getVisibleRowActions(row)
            const maxVisible = rowActionStyle.value.maxVisible
            const visible = actions.slice(0, maxVisible)
            const overflow = actions.slice(maxVisible)

            const actionButtons = visible.map((action) => {
              if (rowActionStyle.value.type === 'link') {
                return h(ElLink, {
                  key: action.key,
                  type: action.danger ? 'danger' : 'primary',
                  underline: false,
                  disabled: (action as any)._disabled,
                  style: { marginRight: '8px' },
                  onClick: () => handleAction(action, row),
                }, () => action.label)
              }
              return h(ElButton, {
                key: action.key,
                type: action.danger ? 'danger' : 'primary',
                size: 'small',
                link: true,
                disabled: (action as any)._disabled,
                onClick: () => handleAction(action, row),
              }, () => action.label)
            })

            if (overflow.length > 0) {
              actionButtons.push(
                h(ElDropdown, { key: '__more', trigger: 'click' }, {
                  default: () => h(ElLink, {
                    type: 'primary', underline: false, style: { marginLeft: '8px' },
                  }, () => rowActionStyle.value.moreText),
                  dropdown: () => h(ElDropdownMenu, {}, () =>
                    overflow.map((action) =>
                      h(ElDropdownItem, {
                        key: action.key,
                        disabled: (action as any)._disabled,
                        onClick: () => handleAction(action, row),
                      }, () => action.label),
                    ),
                  ),
                }),
              )
            }

            return h('div', { class: 'schemly-row-actions' }, actionButtons)
          },
        }))
      }

      // Toolbar（支持 toolbarControl 动态控制）
      const toolbarControl = props.providers.toolbarControl?.() ?? {}
      const toolbarNode = visibleToolbarActions.value.length > 0
        ? h('div', {
          class: 'schemly-toolbar',
          style: { marginBottom: '12px', display: 'flex', gap: '8px' },
        }, visibleToolbarActions.value
          .filter((action) => toolbarControl[action.key] !== false)
          .map((action) => {
            const isBatch = action.batch
            const isControlDisabled = toolbarControl[action.key] === 'disabled'
            return h(ElButton, {
              key: action.key,
              type: action.key === 'create' ? 'primary' : 'default',
              size: 'default',
              disabled: isControlDisabled || (isBatch && selectedRows.value.length === 0),
              onClick: () => handleAction(action),
            }, () => action.label)
          }))
        : null

      // Table
      const tableNode = h(ElTable, {
        data: props.data,
        loading: props.loading,
        border: true,
        stripe: true,
        rowKey: selection.value?.rowKey ?? 'id',
        emptyText: props.emptyText,
        onSortChange: ({ prop, order }: { prop: string; order: string | null }) => {
          emit('sort-change', { key: prop, order })
        },
        onSelectionChange: (rows: Record<string, unknown>[]) => {
          selectedRows.value = rows
          emit('selection-change', { rows })
        },
      }, () => columnNodes)

      // Pagination
      const paginationNode = pagination.value
        ? h('div', {
          class: 'schemly-pagination',
          style: { marginTop: '12px', display: 'flex', justifyContent: 'flex-end' },
        }, [
          h(ElPagination, {
            currentPage: currentPage.value,
            pageSize: currentPageSize.value,
            pageSizes: pagination.value.pageSizes,
            layout: pagination.value.layout,
            total: props.data.length,
            'onUpdate:currentPage': (val: number) => {
              currentPage.value = val
              emit('page-change', { page: val, pageSize: currentPageSize.value })
            },
            'onUpdate:pageSize': (val: number) => {
              currentPageSize.value = val
              currentPage.value = 1
              emit('page-change', { page: 1, pageSize: val })
            },
          }),
        ])
        : null

      return h('div', { class: 'schemly-data-table' }, [
        toolbarNode,
        tableNode,
        paginationNode,
      ])
    }
  },
})
</script>
