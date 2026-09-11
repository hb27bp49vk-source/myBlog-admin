# myBlog Admin Frontend Redesign — ChatGPT Review

日期：2026-09-11
Review 对象：`b511148b22c0b811a17aaf5d2a25eb79720a53a2`
基线：`3ab1e6132b106ae4f94e9fb44f92b24643b88d40`
结论：**FAIL — 需要一轮小范围 Redesign Review Fixes，暂不得进入 User Acceptance。**

## 已确认通过

1. 已建立 `内容维护（Test） / 发布到 Prod` 两个明确工作模式；
2. Test 内容库改为 master-detail 思路，整行点击进入编辑，不再每条放大号“编辑”按钮；
3. 已增加搜索、类型过滤、日期倒序和紧凑内容摘要；
4. Phase C 保留原安全实现并作为独立发布模式；
5. 未引入框架、build system 或 CDN 运行时依赖；
6. 未发现对 Phase B Test-only 写入边界或 Phase C C1–C9 安全逻辑的修改。

## Blocker 1 — 全局 Header 仍把整个 Admin 错误描述为“Test 内容维护”

Redesign 的核心信息架构已经变成两个工作模式，但当前页面顶部仍显示：

- 页面标题：`Test 内容维护`
- 环境 badge：`仅写入 Test / 测试站`
- HTML `<title>`：`myBlog Test 内容维护`

这在用户切换到 `发布到 Prod` 模式时会产生直接语义冲突：页面正在展示受控 Prod 发布能力，但全局 Header 仍告诉用户这是“仅写入 Test”的页面。

### 必须修复

全局 Header 应描述整个 Admin，而不是某一个模式，例如：

- 主标题：`myBlog Admin` / `内容工作台`；
- 辅助说明：`Test 内容维护 · Prod 受控发布`；
- badge 可改为不会误导的安全边界提示，例如 `Test 可写 / Prod 受控发布`。

模式级的 `Test-only` 与 `Prod 受控` 语义应留在各自模式内部表达。

不得让 Header 在 Prod 模式下仍呈现“仅写入 Test”的全局语义。

## Blocker 2 — 新增交互测试仍只是源码字符串检查，不能证明实际行为

本轮新增 `tests/frontend-redesign.test.js` 目前只对 `admin.js` 做正则字符串断言，例如检查是否存在：

- `library-search`
- `library-filter`
- `data-mode`
- `localeCompare`

这不能证明 Redesign Plan 明确要求的新行为实际工作：

- 搜索是否真的过滤标题/摘要/正文/ID；
- 类型过滤是否真的筛选 article/note/topic；
- 日期排序是否真的按预期倒序；
- 模式切换是否真的只显示对应工作区，并保留已读取的 state；
- 选中列表项是否进入编辑态且 selected 状态正确。

Plan 明确要求：“新增的搜索、类型过滤、导航/模式切换等 JS 行为必须增加测试。”源码字符串存在性检查不足以满足这一要求。

### 必须修复

至少把这些新增行为拆成可测试 helper，或使用轻量 DOM/fake DOM 测试，验证真实输入→输出/状态变化，而不是只查源码字符串。

无需引入重型测试框架；可以继续使用 Node + assert。

最低覆盖：

1. 搜索匹配标题/摘要/正文/稳定 ID；
2. 类型过滤；
3. 日期倒序；
4. Test/Prod 模式切换的可见状态；
5. 切换模式不清空已加载的 `state.document` / `blobSha`。

## 非 blocker 观察

当前左侧 `side-stack` 仍把“写入 Test”面板放在“内容库”上方。代码层面不阻止使用，但人工验收时需要重点看：高频内容库是否应该成为左栏首要区域。如果实际使用仍觉得“写入 Test”面板抢占空间，可在 User Acceptance 后再做纯视觉调整；本轮不作为阻塞项。

## 安全边界继续有效

本轮 Review Fixes 只允许修：

- Header / 全局信息架构文案；
- Redesign 新交互的可测试性与行为测试；
- 为测试拆出的纯 UI helper。

继续禁止：

- 改变 Phase B Test-only 写入语义；
- 改变 content schema / stable ID；
- 改变 Phase C C1–C9；
- 让 Prod PAT 进入浏览器；
- 真实写 Prod；
- 修改 myBlog-test / myBlog-prod 业务代码；
- merge main；
- reset / clean / force / 重写历史。

## Review 通过条件

1. Header 在两个工作模式下都不产生误导；
2. 新增交互具备真实行为测试，而非仅源码字符串断言；
3. 既有 Phase B、Phase C safety / boundary / publisher mock / diff tests 继续通过；
4. `git diff --check` 通过；
5. fix commit + push 到同一 `codex/admin-phase-c-implementation` 分支；
6. STOP 在 `Awaiting ChatGPT Review`。
