# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Phase C Acceptance Fixes Review PASS，重新进入 User Acceptance）

## Status

`Awaiting User Acceptance`（Admin Phase C —— 安全 Prod Publisher）

ChatGPT 已完成对 Acceptance Fix commit `b791679391126d6c49700073806e661e54179451` 的 Review，结论为 **PASS**。

此前 Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` 的安全 Re-review 结论继续有效；本轮 UX 修复未发现削弱 C1–C9 安全边界的问题。

当前重新进入用户人工验收。在用户明确验收通过前，不得 merge main、不得执行第一次真实 Prod 发布。

权威 Acceptance Fixes：

`docs/reviews/2026-09-11-admin-phase-c-user-acceptance.md`

权威安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 当前优先级

- **`Awaiting User Acceptance`**：Acceptance Fixes 已通过 ChatGPT Review，等待用户重新人工验收。
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

## ChatGPT Review 结论

2026-09-11：Phase C Implementation 首次 Review FAIL，发现 3 个安全 blocker 与行为测试缺口。

2026-09-11：Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` Re-review PASS。安全边界包括：

1. `prodContentBlobSha` 与 `prodBaselineCommitSha` 对应 tree 的真实 `content.json` blob 严格绑定；
2. publisher 独立复核 Test acceptance/source SHA、operator、selected entries、target-before hash 与完整 releaseId；
3. Prod 同路径图片验证内容 hash，禁止覆盖冲突资产；
4. baseline/blob/target/image/acceptance 等失败路径在 Prod 写请求前 STOP。

2026-09-11：第一次 User Acceptance FAIL（UX）。用户确认核心流程能读取 Prod baseline，但内容列表和表单不适合实际操作。

2026-09-11：Acceptance Fix commit `b791679391126d6c49700073806e661e54179451` Review PASS。确认：

1. 内容选择改为紧凑可读卡片，显示标题/主文本、类型、日期、稳定 ID 和摘要/正文预览；
2. Test → Prod 差异分类实现为 `新增 / 更新 / 无变化`，并提供“仅显示有差异内容”过滤；
3. Phase C 顶部明确 6 步操作流程及“先读取 Test”的前置条件；
4. 状态/错误提示移动到“读取 Prod 基线”操作附近，并主动滚动到可见位置；
5. checkbox / label 布局与内容列表布局已调整；
6. 新增差异分类/过滤行为测试；既有 Phase B、Phase C safety/boundary/publisher tests 保持通过；
7. 未发现本轮 UX 改动削弱已 Review PASS 的 publisher 安全边界。

## User Acceptance 边界

当前仅允许重新进行用户人工验收，不得自行进入真实 Prod 发布。

本轮重点验收：

1. Phase B Test 内容读取仍正常；
2. 未读取 Test 时点击“读取 Prod 基线”，错误提示应在当前操作附近清晰可见；
3. 读取 Prod baseline 后，每个内容条目应能直接看懂，不需要靠稳定 ID 猜内容；
4. 每条内容应显示 `新增 / 更新 / 无变化`；
5. “仅显示有差异内容”过滤可用；
6. checkbox 与内容、人工验收 checkbox 与 label 关系清晰；
7. 能选择内容并继续生成 release plan；
8. 浏览器页面不出现 Prod PAT；
9. 本阶段不得真的批准/执行 Prod 写入。

禁止：

- 真实向 myBlog-prod 写内容、图片或发布记录；
- 使用或展示真实 Prod PAT；
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- merge implementation branch 到 main；
- bypass baseline / planHash / target-before / image hash / Environment approval / C1–C9 安全边界。

## STOP 状态机

- 当前：`Awaiting User Acceptance`。
- 用户人工验收通过后：`Completed / Accepted`；之后才允许另行执行第一次真实受控 Prod 发布。
- 用户验收再次失败：回到 `P0 Active (Acceptance Fixes)`。
- 任意凭据 / baseline / 治理冲突：`Blocked`。

## 完成验收前

不得 merge main，不得执行真实 Prod 发布。
