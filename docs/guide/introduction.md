# 概述

Schemly 是一个基于 **Vue 3 + Element Plus** 的 Schema 驱动业务展示类库，面向后台管理系统。一份 Schema 描述一个组件实例的完整展示行为，由 Designer 产出，由 Runtime 消费渲染。

## 核心原则

- **一个 schema = 一个组件实例**：Schema 描述局部区域（页面主体、弹窗、抽屉等），不描述完整页面
- **Cell 是最小原子单元**：所有高级展示形式（表格列、描述项、表单字段）都消费 Cell
- **cell type = 数据语义**：Cell 描述"这个字段是什么类型的数据"，而非"用什么组件渲染"
- **双模态派生**：每个 cell type 默认推导出 display 渲染器和 edit 渲染器，大多数场景无需显式指定
- **schema 纯展示描述**：不包含请求逻辑、路由逻辑，数据由 Runtime props 传入
- **组件间联动交给业务代码**：Schema 不管组件间的交互关系
- **声明与实现分离**：Schema 只声明 key，Runtime 注入具体实现

## 分层模型

```
Schema 协议层
├── Cell（原子单元，数据语义层）
│   ├── displayAs → 展示渲染器
│   └── editAs   → 编辑渲染器
├── Field = Cell + 表单行为（rules、disabled 等）
└── Type（布局容器，消费 Cell 或 Field）
    ├── DataTable：用 Cell 渲染列，支持 createForm / updateForm
    ├── Form：通用表单，适用于搜索、筛选、独立编辑等
    └── Descriptions：用 Cell 渲染描述项
```

## 适用场景

Schemly 特别适合以下场景：

- 后台管理系统中的 **CRUD 页面**
- 需要快速搭建的 **数据展示 / 表单编辑** 页面
- 有 **权限控制** 需求的管理后台
- 需要 **可视化配置** 替代手写 JSON 的团队
