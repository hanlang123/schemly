# 数据源与字典系统

## options 前缀协议

`enum` 类型通过 `cellProps.options` 的前缀区分数据来源：

| 前缀 | 格式 | 含义 | 获取时机 |
|------|------|------|----------|
| `dict:` | `dict:orderStatus` | 静态字典 | Schema 加载时即可用 |
| `api:` | `api:fetchDeptList` | 动态接口 | 组件挂载时调用一次并缓存 |
| `remote:` | `remote:searchUser` | 远程搜索 | 用户输入时实时调用 |

Schema 中保留 `api:` / `remote:` 前缀以保留语义（前端程序员一眼看出调用方式），但在 providers 层面统一为 `functions` 命名空间（详见 [Runtime 接口](/advanced/runtime)）。

**Runtime 解析映射：**

```
options = "dict:xxx"     → 从 dicts 中查找
options = "api:xxx"      → 从 providers.functions[xxx] 获取，按 api 签名调用
options = "remote:xxx"   → 从 providers.functions[xxx] 获取，按 remote 签名调用
```

## schema.dicts（Designer 预配置）

```json
{
  "dicts": {
    "orderStatus": [
      { "label": "待处理", "value": "pending", "color": "warning" },
      { "label": "已完成", "value": "done", "color": "success" },
      { "label": "已取消", "value": "cancelled", "color": "info" }
    ]
  }
}
```

**字典项结构：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `label` | string | ✅ | 显示文本 |
| `value` | string / number | ✅ | 数据值 |
| `color` | string | ❌ | Element Plus type（`primary` / `success` / `warning` / `danger` / `info`） |

## 字典解析优先级

```
dict:orderStatus
  → ① schema.dicts.orderStatus（Designer 预配置）
  → ② providers.dicts.orderStatus（Runtime 注入）
  → ③ 均未找到 → 控制台警告，渲染原始 value
```

## 远程搜索的 display 模式约定

远程搜索字段的数据层**必须同时返回 value 和 label**，避免列表场景 N 行数据触发 N 次反查请求：

```json
{ "assignee": 42, "assigneeName": "张三" }
```

Schema 中通过 `displayLabelKey: "assigneeName"` 声明，display 模式直接读取渲染。
