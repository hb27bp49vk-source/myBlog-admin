# myBlog Admin — Workbench V2

日期：2026-09-11
状态：P0 Active (Implementation)

## 目标

放弃继续修补上一版维护台布局，按已确认的新原型方向重做 Admin 前端工作台。

本轮是 **前端工作台重构**，不是业务协议重写。保留 Phase B Test-only 写入与 Phase C 已通过 Review 的安全发布逻辑，只重组信息架构、布局、交互和视觉层级。

## 已确认的产品方向

参考 Git-based CMS 的成熟交互，但不直接引入外部框架：

- Sveltia CMS：轻量、现代内容工作台结构；
- Keystatic：内容列表 + 主编辑区的 master-detail 思路；
- Decap CMS：简单清晰的内容编辑路径；
- TinaCMS：编辑 / 预览关系与非技术用户体验。

继续保持原生 HTML / CSS / JS，不新增 React/Vue/Svelte/Tailwind，不新增 build system，不新增 CDN 运行时依赖。

## 信息架构

### 左侧一级导航

只保留高频入口：

- 文章
- 短记
- 发布

底部可保留弱化入口：

- 设置
- 帮助

### 不再作为一级导航

- 专题不再显示为高频一级入口；
- `AI 实验`、`会议纪要`、`项目现场`、`傍晚散步`、`阅读摘记` 等具体 type / 标签不能和内容类型混为一级导航。

底层兼容字段与历史数据不在本轮删除；只是 UI 不把它们当作一级入口。

## 文章分类

文章页使用现有真实分类：

- 项目（project）
- AI（ai）
- 生活（life）

更具体的 `type` 作为次级标签 / 筛选条件，不进入全局主导航。

## 桌面布局

目标窗口：常规 16:9 桌面，重点保证约 1366×768、1440×810、1536×864、1920×1080。

采用三段式工作区：

1. 左侧窄导航栏；
2. 中间内容列表；
3. 右侧主编辑区。

要求：

- 不允许任何横向内容侵入相邻列；
- 所有 Grid/Flex 子项必须处理 `min-width: 0`；
- 长标题、摘要、ID、SHA 必须截断或换行在自己的容器内；
- 在不足以维持三栏可用宽度时必须响应式降级，不得硬挤；
- 小屏优先转双栏或单栏，而不是制造横向滚动和重叠。

## 中间内容列表

目标是高密度、易扫描。

每条默认只显示：

- 标题；
- 日期；
- 分类 / type tag；
- 一行摘要。

要求：

- 整行点击选中；
- 当前选中项清晰；
- 不再给每条内容常驻一个巨大“编辑”按钮；
- 支持搜索；
- 支持分类筛选；
- 支持 type / 内容类型筛选（如需要）；
- 默认日期倒序；
- 一屏尽量展示更多内容。

stable ID 不作为默认主信息；如需要，放到元数据区。

## 右侧主编辑区

右侧是主要工作区，不再把编辑器挤成窄条。

### 顶部

只展示：

- 当前内容标题；
- 内容类型 / 分类状态；
- 必要的保存 / Test 提交状态。

技术信息（stable ID、创建时间、最后修改时间等）收进“元数据”tab，不持续占据主视觉。

### 编辑模式

默认显示“编辑”，正文占满主要区域。

提供：

- 编辑
- 预览
- 元数据

可额外提供“分屏”按钮，但分屏不是默认状态。

### Markdown 编辑器

- 编辑区获得最大可用空间；
- 预览单独切换；
- 分屏时必须保证双方最低可用宽度，否则自动退回单视图；
- 不做窄条式双栏预览。

## Test / Prod 语义

顶部不再把 Test / Prod 做成普通环境切换器。

默认工作环境明确为：

`Test`

Prod 发布只能通过左侧“发布”入口进入独立发布页面。

避免任何“切一下环境就进入 Prod 编辑”的语义。

## 保存语义

不要使用会误导远端状态的“自动保存”。

允许的文案：

- 本地草稿已保存
- 尚未提交到 Test
- 提交到 Test
- Test 已提交（带回执）

如果当前实现没有真实本地草稿持久化，则不要伪造“本地草稿已保存”。

## 发布页

“发布”作为独立一级页面，承载 Phase C：

1. 准备 / 读取 Test 状态；
2. 读取 Prod baseline；
3. 查看 Test → Prod 差异；
4. 选择新增 / 更新内容；
5. 填写并确认 Test Pages 人工验收；
6. 生成 release plan；
7. 提交受控发布会话；
8. GitHub Environment approval 仍为最终 gate。

不得把 Prod 编辑能力混进文章编辑页。

## 性能与机器友好

- 不新增重型框架；
- 不新增 build system；
- 不新增 CDN 运行时依赖；
- 不轮询；
- 不做大面积动画；
- 搜索 / 过滤只针对本地已加载数据；
- 模式切换不得重复拉取远端数据；
- 避免不必要 DOM 全量重绘。

## 保持不变的安全边界

不得改变：

- Phase B 只写 myBlog-test；
- content schema / stable ID；
- Phase B 当前图片禁用边界；
- Phase C C1–C9；
- Prod PAT 不进入浏览器；
- baseline / blob / planHash / target-before / image hash 校验；
- GitHub Environment approval；
- Phase C v1 不支持删除；
- 不真实写 Prod 做开发测试；
- 不修改 myBlog-test / myBlog-prod 业务代码或内容协议。

## 允许修改

- `index.html`
- `admin.css`
- `admin.js` 中 UI/render/filter/navigation/editor-view 相关部分
- `phase-c.js` 中纯 UI/render/wiring 相关部分
- 前端行为测试与 fixtures
- 治理文档

如果必须修改 publisher、安全校验、release plan 语义、Test 写入协议，立即 STOP。

## 测试要求

必须保持现有：

- Phase B 回归；
- Phase C plan safety；
- Phase C boundary；
- publisher mock；
- diff 分类/过滤；
- review boundary；
- `git diff --check`。

新增 / 更新行为测试至少覆盖：

- 一级导航文章 / 短记 / 发布；
- 分类筛选 project / ai / life；
- 搜索；
- 日期倒序；
- 选中列表项进入编辑；
- 编辑 / 预览 / 元数据切换；
- Test 数据与 baseline 在页面模式切换后保留；
- 响应式布局关键断点不得出现横向重叠（可通过可测试 layout helper / CSS contract 检查，不强制引入浏览器依赖）。

## 人工验收标准

在 16:9 常规桌面窗口：

- 左侧导航清晰且不混淆内容类型与具体 type；
- 文章分类显示为项目 / AI / 生活；
- 内容列表紧凑、可扫描、可搜索、可筛选；
- 右侧编辑区是主视觉，不再被挤窄；
- 不出现跨栏、遮挡、横向侵占；
- 默认编辑单视图足够宽；
- 预览 / 元数据可切换；
- 发布被独立为单独工作流；
- 整体能作为长期个人博客后台正常使用。

## STOP

实现完成后 commit + push 到现有 `codex/admin-phase-c-implementation` 分支，STOP 在 `Awaiting ChatGPT Review`。

在 ChatGPT Review 和用户人工验收通过前，不得 merge main，不得真实 Prod 发布。
