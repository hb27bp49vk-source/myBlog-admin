# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Phase C Acceptance Fixes 完成，Awaiting ChatGPT Review）

## Status

`Awaiting ChatGPT Review`（Admin Phase C —— 安全 Prod Publisher）

ChatGPT 对 Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` 的安全 Re-review 结论仍为 **PASS**；但用户人工验收发现当前 Phase C UI/UX 不适合实际发布操作，因此 User Acceptance 结论为 **FAIL（UX）**。

Acceptance Fixes 已完成并待 ChatGPT Review。在新的 ChatGPT Review 与用户人工验收通过前，不得 merge main、不得执行第一次真实 Prod 发布。

权威 Acceptance Fixes：

`docs/reviews/2026-09-11-admin-phase-c-user-acceptance.md`

权威安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 当前优先级

- **`Awaiting ChatGPT Review`**：Acceptance Fixes 已完成，等待 Review。
- **`P1 Queued`**：无。
- **`P2 Backlog`**：等待 ChatGPT 后续派发。

## 权威 Plan / Review

本轮 Implementation Plan：

`docs/plans/2026-09-11-admin-phase-c-implementation.md`

当前 Acceptance Fixes：

`docs/reviews/2026-09-11-admin-phase-c-user-acceptance.md`

安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

Planning 历史与决策输入：

`docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`

设计依据：

`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

若文档之间出现冲突，本轮以当前显式用户指令 → 本文件 → Acceptance Fixes → 安全 Review → Implementation Plan → 其他历史文档的顺序解释；发现实质冲突必须 STOP 并报告 ChatGPT。

## 已通过的安全 Review

2026-09-11：Phase C Implementation 首次 Review FAIL，发现 3 个安全 blocker 与行为测试缺口。

2026-09-11：Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` Re-review PASS。安全边界包括：

1. `prodContentBlobSha` 与 `prodBaselineCommitSha` 对应 tree 的真实 `content.json` blob 严格绑定；
2. publisher 独立复核 Test acceptance/source SHA、operator、selected entries、target-before hash 与完整 releaseId；
3. Prod 同路径图片验证内容 hash，禁止覆盖冲突资产；
4. baseline/blob/target/image/acceptance 等失败路径在 Prod 写请求前 STOP。

Acceptance Fixes 不得削弱上述安全边界。

## User Acceptance FAIL — UX 问题

人工验收确认：Phase C 能在 Phase B 已读取 Test 内容后成功读取公开 Prod baseline，但当前操作界面存在以下问题：

1. 内容选择主要显示 `article / <stable-id>`，用户无法可靠判断具体内容；
2. checkbox 与对应文字距离过远，控件归属不清；
3. 列表过于松散，实际选择效率低；
4. 人工 Test 页面验收 checkbox 与 label 布局异常；
5. “读取 Prod 基线”依赖先读取 Test，但 UI 未明确前置步骤；
6. 错误提示可能位于当前视口之外，导致按钮失败时看起来“没反应”；
7. 缺少 Test → Prod 的 `新增 / 更新 / 无变化` 状态与“仅显示有差异内容”过滤能力。

完整修复要求见 Acceptance Fixes 文档。

## Acceptance Fix 授权边界

Executor 必须继续在现有 `codex/admin-phase-c-implementation` 分支追加修复，不得丢弃或重建已通过安全 Review 的 implementation 历史。

开始前必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Acceptance Fixes、安全 Review 与 Implementation Plan；
4. 当前环境继续优先使用已验证正常的 shell / PowerShell 文件修改路径，避免已知异常的内置 patch/helper 编辑接口；
5. 若分支、治理或工作区异常则 STOP，不得 reset / clean / force。

允许：

- 修改 myBlog-admin 的 Phase C UI / JS / CSS 与相关测试；
- 为差异分类、过滤、可读卡片等 UX 行为增加 helper/test；
- 只读使用 Test/Prod baseline 做本地验收；
- 使用 mock/fake credential 测试。

禁止：

- 真实向 myBlog-prod 写内容、图片或发布记录；
- 使用/要求真实 Prod PAT 进行开发或验收测试；
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- 改变 C1–C9 已确认安全边界；
- 引入删除语义；
- 绕过 baseline / planHash / target-before / image hash / Environment approval；
- merge implementation branch 到 main；
- reset / clean / force / 重写历史。

## STOP 状态机

- 当前：`P0 Active (Acceptance Fixes)`。
- Acceptance Fix commit + push 完成后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：重新进入 `Awaiting User Acceptance`。
- 用户人工验收通过后：`Completed / Accepted`；之后才允许另行执行第一次真实受控 Prod 发布。
- 任意凭据 / baseline / 治理冲突：`Blocked`。

## 测试要求

- Phase B 回归继续通过；
- Phase C plan safety / boundary / publisher mock 行为测试继续通过；
- 新增差异分类/过滤等非纯 CSS 行为测试；
- `git diff --check` 通过。

## 完成后只需报告

- branch
- previous fix SHA
- final acceptance-fix commit SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
