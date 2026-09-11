# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Frontend Redesign Re-review：仅剩 state 保留测试 blocker）

## Status

`P0 Active (Review Fixes)`（myBlog Admin Frontend Redesign）

Frontend Redesign fix commit `776a1030fc994ca365b6671bf5e653da2b505abb` 已重新 Review。

当前实现与 UI 语义未发现新的功能/安全 blocker；全局 Header 双模式语义、搜索/过滤/排序 helper 均已修正。**仅剩 1 个测试质量 blocker：当前“模式切换后 state 保留”测试是假阳性。**

权威 Re-review：

`docs/reviews/2026-09-11-admin-frontend-redesign-re-review.md`

权威 Redesign Plan：

`docs/plans/2026-09-11-admin-frontend-redesign.md`

Phase C 安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 唯一 blocker

`tests/frontend-redesign.test.js` 当前使用一个与真实 `admin.state` 无关的本地对象 `retained`，在调用 `modeVisibility()` 前后断言该本地对象未变化。

这不能证明真实已加载的 `state.document` / `state.blobSha` 在 Test / Prod 模式切换后仍保留，因此不满足此前 Review 明确要求的真实行为测试。

完整说明与修复条件见 Re-review 文档。

## Executor 授权边界

继续在现有 `codex/admin-phase-c-implementation` 分支追加**最小测试性修复**，不得扩大到新的 UI redesign。

开始前必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Re-review；
4. 继续使用 shell / PowerShell 文件修改路径；
5. 异常立即 STOP，不得 reset / clean / force。

允许：

- 将模式切换封装为最小可测试 helper / function；
- 使用轻量 fake DOM / stub；
- 修改 `tests/frontend-redesign.test.js`；
- 对 `admin.js` 做仅为测试真实模式切换所需的最小重构。

禁止：

- 新增框架、jsdom、build system、CDN 依赖；
- 改变 Phase B Test-only 写入逻辑；
- 改变 content schema / stable ID；
- 改变 Phase C C1–C9 / publisher / release plan 语义；
- 真实 Prod 写入或真实 Prod PAT；
- 修改 myBlog-test / myBlog-prod 业务代码；
- merge main；
- reset / clean / force / 重写历史。

## 测试要求

修复后必须真实验证：

- Test / Prod 模式切换可见状态正确；
- 切换前给真实导出的 `admin.state.document` / `admin.state.blobSha` 设置测试值；
- 执行模式切换后，这两个真实 state 值仍保持；
- 搜索 / 类型过滤 / 日期倒序继续通过；
- Phase B、Phase C plan safety、boundary、publisher mock、diff、review boundary 全部继续通过；
- `git diff --check` 通过。

## STOP 状态机

- 当前：`P0 Active (Review Fixes)`。
- 最小 fix commit + push 后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：`Awaiting User Acceptance`。
- 用户桌面人工验收通过后：`Completed / Accepted`。
- 任意安全/治理/实现冲突：`Blocked`。

## 完成后只需报告

- branch
- previous review-fix SHA
- final test-fix commit SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
