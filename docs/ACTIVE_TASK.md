# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Frontend Redesign Review FAIL，进入 Review Fixes）

## Status

`P0 Active (Review Fixes)`（myBlog Admin Frontend Redesign）

Frontend Redesign implementation commit `b511148b22c0b811a17aaf5d2a25eb79720a53a2` 已完成 ChatGPT Review，结论为 **FAIL**。当前不得进入 User Acceptance、不得 merge main、不得执行真实 Prod 发布。

权威 Redesign Plan：

`docs/plans/2026-09-11-admin-frontend-redesign.md`

权威 Redesign Review：

`docs/reviews/2026-09-11-admin-frontend-redesign-review.md`

Phase C 安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 当前 Review 结论

已确认通过：

- 已建立 `内容维护（Test） / 发布到 Prod` 两个工作模式；
- Test 内容库改为 master-detail 工作台，整行点击进入编辑；
- 已增加搜索、类型过滤、日期倒序和摘要；
- Phase C 安全实现未被改动；
- 未引入框架、build system 或 CDN 运行时依赖；
- 未发现 Phase B Test-only 或 Phase C C1–C9 安全边界被削弱。

当前 blocker：

1. 全局 Header / `<title>` 仍把整个 Admin 描述成 `Test 内容维护` / `仅写入 Test`，与新增的 `发布到 Prod` 工作模式直接冲突；
2. 新增 `tests/frontend-redesign.test.js` 仍只是源码字符串正则检查，不能证明搜索、类型过滤、日期排序、模式切换、state 保留等新增交互真实工作，不满足 Redesign Plan 的行为测试要求。

完整要求见 Redesign Review 文档。

## Executor 授权边界

继续在现有 `codex/admin-phase-c-implementation` 分支追加修复，不得重建或丢弃已有 Redesign 历史。

开始前必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Redesign Plan、Redesign Review、Phase C 安全 Review；
4. 当前环境继续使用已验证正常的 shell / PowerShell 文件修改路径，避免已知异常的内置 patch/helper；
5. 分支、治理、工作区异常立即 STOP，不得 reset / clean / force。

本轮允许：

- 修正 `index.html` 的全局标题 / Header / badge 文案与必要展示结构；
- 将新增 UI 过滤/排序/模式切换行为拆为可测试 helper；
- 增加 Node + assert 或轻量 fake DOM 行为测试；
- 对 `admin.js` 做仅为测试性和 UI wiring 所需的最小重构；
- 更新相关治理文档。

本轮禁止：

- 改变 Phase B Test-only 写入逻辑；
- 改变 content schema / stable ID；
- 改变 Phase C C1–C9、安全 publisher、release plan 数据语义；
- Prod PAT 进入浏览器；
- 真实 Prod 写入；
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- merge main；
- reset / clean / force / 重写历史。

## 测试要求

新增行为测试至少覆盖：

- 搜索匹配标题/摘要/正文/稳定 ID；
- 类型过滤；
- 日期倒序；
- Test / Prod 模式切换可见状态；
- 模式切换不清空已加载的 `state.document` / `blobSha`。

并保持通过：

- Phase B 回归；
- Phase C plan safety；
- Phase C boundary；
- publisher mock；
- diff 分类/过滤；
- review boundary；
- `git diff --check`。

## STOP 状态机

- 当前：`P0 Active (Review Fixes)`。
- Fix commit + push 后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：`Awaiting User Acceptance`。
- 用户人工验收通过后：`Completed / Accepted`。
- 任意安全、凭据、治理或实现冲突：`Blocked`。

## 完成后只需报告

- branch
- previous redesign SHA
- final review-fix commit SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
