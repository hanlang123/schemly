# 编辑渲染器（editAs）

编辑渲染器决定 Cell 在 edit 模式下对应的表单组件。

## 渲染器列表

| editAs | 渲染组件 | 说明 |
|--------|----------|------|
| `input` | el-input | 单行文本 |
| `textarea` | el-input[textarea] | 多行文本 |
| `inputNumber` | el-input-number | 数字输入 |
| `select` | el-select | 下拉选择（支持远程搜索） |
| `radio` | el-radio-group | 单选（选项 ≤ 5 时适用） |
| `checkbox` | el-checkbox-group | 多选，值为数组 |
| `datePicker` | el-date-picker | 日期选择 |
| `dateRangePicker` | el-date-picker[range] | 日期范围 |
| `switch` | el-switch | 开关 |
| `imageUpload` | el-upload（图片模式） | 图片上传，支持预览、单图/多图 |
| `fileUpload` | el-upload（文件模式） | 文件上传，展示文件列表 |

## 合法的 editAs 覆盖组合

| cell \ editAs | input | textarea | inputNumber | select | radio | checkbox | datePicker | dateRangePicker | switch | imageUpload | fileUpload |
|--------------|-------|----------|-------------|--------|-------|----------|------------|-----------------|--------|-------------|------------|
| `text` | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| `number` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `currency` | — | — | ✅ | — | — | — | — | — | — | — | — |
| `enum` | — | — | — | ✅ | ✅ | ✅ | — | — | — | — | — |
| `boolean` | — | — | — | — | ✅ | — | — | — | ✅ | — | — |
| `datetime` | — | — | — | — | — | — | ✅ | — | — | — | — |
| `dateRange` | — | — | — | — | — | — | — | ✅ | — | — | — |
| `image` | — | — | — | — | — | — | — | — | — | ✅ | — |
| `file` | — | — | — | — | — | — | — | — | — | — | ✅ |
| `link` | ✅ | — | — | — | — | — | — | — | — | — | — |
| `detail` | — | ✅ | — | — | — | — | — | — | — | — | — |

::: warning 注意
Runtime 加载时应校验组合合法性，非法组合开发模式下警告并回退到默认渲染器。
:::
