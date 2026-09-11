# myBlog Admin — Frontend Redesign

日期：2026-09-11
状态：P0 Active (Planning / Redesign)

## 背景

Phase C 的安全能力已经完成实现与多轮 Review，但连续人工验收暴露出一个更高层问题：当前 Admin 前端仍然是“功能逐块叠加”的工程型界面。局部 CSS polish 无法解决整体信息架构、内容维护效率和桌面空间利用问题。

最新人工验收明确指出：Phase B Test 内容维护列表仍然狭窄、重复展示稳定 ID、编辑按钮占用大量横向空间，页面左侧存在大片无效空白；整个维护台虽然功能可运行，但不适合作为长期日常内容管理工具。

因此停止继续做第三轮局部 CSS 补丁，改为一次有边界的 **Admin Frontend Redesign**。

## 目标

把 myBlog-admin 从“工程调试/功能堆叠页”重构为一个长期可用的个人内容维护与发布工作台。

目标不是追求复杂视觉效果，而是：

- 内容一眼可扫描；
- 编辑入口清楚；
- Test 维护与 Prod 发布职责清楚；
- 桌面空间有效利用；
- 技术信息按需出现，不持续干扰主操作；
- 高频动作路径短；
- 不改变已经通过 Review 的数据协议与安全发布模型。

## 信息架构

桌面端采用清晰的工作台结构，不再把所有功能从上到下无限堆叠。

### 1. 顶部工作台 Header

显示：

- `myBlog Admin`；
- 当前环境提示：`Test 内容维护 / Prod 受控发布`；
- Test 读取/连接状态；
- 必要的轻量状态信息。

不要把 PAT、SHA、stable ID 等技术字段作为顶部主视觉。

### 2. 主导航 / 工作模式

至少分成两个明确模式：

- **内容维护（Test）**：Phase B 的读取、创建、编辑、保存 Test 内容；
- **发布到 Prod**：Phase C 的差异读取、选择、人工验收、release plan、受控提交。

可采用 tab / segmented navigation / sidebar navigation，由 Executor 根据现有静态 HTML/JS 架构选择最小风险实现。默认进入“内容维护”。

不得因为切换模式而丢失已读取的数据或改变现有写入语义。

## 内容维护（Test）重新设计

这是本轮重点。

### 桌面布局

采用真正适合内容管理的 master-detail 工作区：

- 左侧/中间为 **内容库列表**，获得足够宽度；
- 右侧为 **编辑器/详情面板**；
- 比例建议约 40/60 或 45/55，由实际内容决定；
- 不允许再次出现“编辑器占大半屏但下方大片空白，内容列表缩成细长栏”的布局；
- 约 1440–1800 px 桌面宽度应自然利用空间；
- 小屏再堆叠。

### 内容库工具栏

内容列表顶部提供：

- 搜索：标题/正文摘要/稳定 ID；
- 类型过滤：全部 / article / note / topic；
- 合理的排序（优先现有日期倒序；如实现新排序行为需测试）；
- “新建”入口应明显但不抢占大量空间。

### 内容列表

每条内容以紧凑行/卡片展示：

- 标题为第一视觉层级；
- 类型 badge 与日期为第二层；
- 1 行摘要可选；
- stable ID 默认弱化或省略，允许通过详情/展开查看；
- 不为每条内容长期放置一个巨大的“编辑”按钮；整行可点击选中，或使用紧凑操作入口；
- 当前选中项有明确但克制的 selected 状态；
- 列表应支持高密度浏览，不用滚很久才能找到内容。

### 编辑器

编辑器区域明确显示当前状态：新建 / 编辑某内容。

- 表单 label、输入框、正文编辑区对齐；
- 主操作（保存 Test）固定在容易找到的位置；
- 危险/次要操作与主操作区分；
- 图片仍保持 Phase B 当前禁用边界，说明可以保留但视觉降级为提示，不要长期占据大块主区域；
- 不改变 Test-only PAT、Contents API、schema、stable ID 或保存逻辑。

## 发布到 Prod（Phase C）重新设计

保留当前已经通过安全 Review 的所有逻辑，只重新组织界面。

采用“发布向导/步骤式工作区”的视觉模型：

1. **准备**：确认 Test 已读取，读取 Prod baseline；
2. **选择变更**：默认聚焦 `新增 / 更新`，可查看无变化；
3. **Test 人工验收**：Pages URL、accepted Test SHA、operator、确认 checkbox；
4. **Release Plan**：生成、展示、复核；
5. **受控提交**：提交 publisher session，明确 GitHub Environment approval 仍是最终 gate。

可以在单页中使用 stepper + 分区，也可以使用阶段面板；不要求做复杂 SPA。

内容选择继续显示可读标题、类型、日期、摘要、差异状态；stable ID 降级为技术详情。

## 视觉原则

- 优先使用现有项目视觉语言，不引入前端框架或 build system；
- 保持静态 HTML/CSS/JS 架构；
- 桌面端最大内容宽度应合理扩大，避免在 1800 px 屏幕上只使用中间狭窄区域；
- 统一 spacing、border radius、button 高度、label、badge、muted text；
- 主色只用于主操作、选中状态和关键状态，不要每个区域都高亮；
- 长 SHA / stable ID 使用 monospace、可截断、按需展示；
- 技术错误信息仍必须明确可见，但不占据正常状态下的大块空间；
- 支持 keyboard focus，label 与 checkbox/input 正确关联；
- 不做无意义动画。

## 性能 / 用户机器友好原则

用户明确要求对本机友好。本轮不得为了视觉重构引入重型依赖。

- 不新增 React/Vue/Svelte/Tailwind 等框架；
- 不新增 CDN 运行时依赖；
- 不新增构建步骤；
- 优先原生 CSS Grid/Flex 与现有 JS；
- 搜索/过滤对当前几十到数百条内容应即时完成，不进行不必要网络请求；
- 切换 Test / Prod 工作模式不得重复请求远端数据，除非用户显式刷新/读取；
- 避免大面积持续动画、轮询和昂贵 DOM 重绘。

## 明确不变的功能 / 安全边界

Frontend Redesign **不得**改变：

- Phase B 只写 `myBlog-test`；
- Phase B 当前图片禁用边界；
- `content.json` schema 与 stable ID 规则；
- Phase C C1–C9；
- Prod PAT 不进入浏览器；
- baseline / blob / planHash / target-before / image hash 校验；
- GitHub Environment approval；
- Phase C v1 不支持删除；
- 不真实写 Prod 做开发测试；
- 不修改 myBlog-test / myBlog-prod 业务代码或内容协议。

## 实施策略

这不是“推倒重写业务逻辑”。优先复用现有 `admin.js` / `phase-c.js` 的数据与安全逻辑，把 UI rendering / event wiring 与布局重新组织。

建议 Executor 先盘点 DOM ID、现有事件绑定和测试依赖，再实施；若某个 DOM 结构被测试或逻辑依赖，必须同步安全迁移，不能为了视觉直接删除导致功能静默失效。

允许修改：

- `index.html`
- `admin.css`
- `admin.js` 中纯 UI/render/filter/selection 相关部分
- `phase-c.js` 中纯 UI/render/wiring 相关部分
- 相关 UI helper/tests/fixtures
- 治理文档

若需要改变 publisher、安全校验、release plan 数据语义、Test 写入协议，必须 STOP 给 ChatGPT，不属于本轮授权。

## 测试 / Review

至少保持：

- Phase B 全部现有回归测试；
- Phase C plan safety；
- Phase C boundary；
- publisher mock 行为测试；
- diff 分类/过滤；
- review boundary；
- `git diff --check`。

新增的搜索、类型过滤、导航/模式切换等 JS 行为必须增加测试。

Executor 完成后 commit + push 到现有 `codex/admin-phase-c-implementation` 分支，STOP 在 `Awaiting ChatGPT Review`。

ChatGPT Review PASS 后必须再次由用户进行桌面人工验收；在用户明确通过前，不得 merge main、不得执行真实 Prod 发布。

## 人工验收标准

在约 1440–1800 px 桌面浏览器：

- 打开页面后能立刻理解“内容维护”和“发布到 Prod”是两个工作模式；
- Test 内容列表占据合理空间，标题易读，能搜索/过滤，不再依赖一排排“编辑”按钮；
- 选择内容后编辑器清楚、稳定，不出现大片无意义空白；
- Phase C 是明确的发布流程，不像调试表单集合；
- stable ID/SHA 等技术信息不会压过标题和业务动作；
- 页面整体可以作为长期个人博客维护工具正常使用。
