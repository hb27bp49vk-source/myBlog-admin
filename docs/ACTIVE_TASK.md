# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Phase C Review Fixes 已完成，Awaiting ChatGPT Review）

## Status

`Awaiting ChatGPT Review`（Admin Phase C —— 安全 Prod Publisher）

Review Fixes 已完成并已提交，等待 ChatGPT 重新 Review。当前不得进入 User Acceptance、不得 merge main、不得真实 Prod 发布。

权威 Review Fixes：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

Executor 应在同一 implementation branch 上完成 Review Fixes，完成后 commit + push，并重新 STOP 在 `Awaiting ChatGPT Review`。

## 当前优先级

- **`Awaiting ChatGPT Review`**：Review Fixes 已完成，等待重新 Review。
- **`P1 Queued`**：无。
- **`P2 Backlog`**：等待 ChatGPT 后续派发。

## 权威 Plan

本轮 Implementation 唯一实施入口：

`docs/plans/2026-09-11-admin-phase-c-implementation.md`

当前 Review Fixes：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

Planning 历史与决策输入：

`docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`

设计依据：

`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

既有概念 Plan：

`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`

若文档之间出现冲突，本轮以当前显式用户指令 → 本文件 → Review Fixes → Implementation Plan → 其他历史文档的顺序解释；发现实质冲突必须 STOP 并报告 ChatGPT。

## ChatGPT Review 结论

2026-09-11：Phase C Planning Review PASS。

2026-09-11：Phase C Implementation Review **FAIL**。主要 blocker：

1. publisher 尚未证明 `prodContentBlobSha` 属于 `prodBaselineCommitSha` 对应 commit 的 `content.json`，存在旧 blob 与当前 baseline 被错误组合后覆盖未选 Prod 内容的风险；
2. publisher 对 release plan 的关键语义字段复核不足，包括 Test acceptance 与 source SHA 绑定、target-before hash、operator、releaseId 完整格式等；
3. 图片目标路径已存在时没有验证 Prod baseline 里的现有内容是否与 content-addressed hash 一致，尚不能证明“禁止覆盖无关现有资产”；
4. 当前测试仍缺少 baseline/blob 错配、无写请求保证、图片负向路径、多条目选择性提升等真实行为测试。

完整要求见 Review Fixes 文档。

## Implementation / Review Fix 授权边界

实施基线规则仍然有效：不得使用写死旧 SHA 作为新的实施基线；但本轮 Review Fix 是继续在已存在并已推送的 `codex/admin-phase-c-implementation` 上追加修复提交，**不得丢弃或重建已有 implementation 历史**。

Executor 开始修复前必须：

1. 确认当前分支为 `codex/admin-phase-c-implementation`；
2. `git pull --ff-only origin codex/admin-phase-c-implementation`；
3. 确认本地分支与远端一致、工作区 clean；
4. 重新读取 `AGENTS.md`、本文件、Implementation Plan 与 Review Fixes；
5. 若分支历史、工作区或治理状态异常则 STOP，不得 reset / clean / force。

Executor 允许：

1. 修改 myBlog-admin 的 UI / JS / CSS、仓库内发布脚本、GitHub Actions workflow、tests / fixtures / 实施文档；
2. 只读访问 myBlog-test / myBlog-prod 用于 baseline、schema 与页面验证；
3. 使用 mock / fake credential 完成自动测试；
4. 为可测试性重构 publisher，但不得改变 C1–C9 核心安全边界。

禁止：

1. 使用或要求真实 Prod PAT 进行开发测试；
2. 实际向 myBlog-prod 写内容、图片或发布记录；
3. 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
4. 把 Phase B 浏览器 Contents API Test 写入路径复制为 Prod 写入口；
5. 绕过 baseline 检查、force、reset、clean、重写历史或静默覆盖；
6. 自行修改 C1–C9 核心安全边界；
7. 自行 merge 实施分支到 main。

## STOP 状态机

- Review Fixes 进行中：按本文件 + Review Fixes + Implementation Plan 执行。
- Fix commit + push 完成后：`Awaiting ChatGPT Review`。
- ChatGPT Review 通过后：`Awaiting User Acceptance`。
- 用户人工验收通过后：`Completed / Accepted`。
- 任意凭据 / baseline / 治理冲突：`Blocked`。

## 最近完成

- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B：Test 内容维护实现、Review Fix、合并与人工验收均已完成。
- 2026-09-10：Workflow 3.0 Phase 2 治理同步完成。
- 2026-09-10：Phase C 从 `P1 Queued` 提升到 `P0 Active (Planning)`，Planning commit `69c50c62c8daa10edee9d7732623dafc16697329`。
- 2026-09-11：ChatGPT Planning Review PASS，C1–C9 写入 Implementation Plan。
- 2026-09-11：Implementation 基线规则修正为同步最新 main 后动态确定 base。
- 2026-09-11：Implementation commit `723504310ade284f70ad15bb21a12557638529a5` 推送成功；随后 ChatGPT Review FAIL，Review Fixes 已写入当前 implementation branch。

## Review Fix 完成后必须报告

只需汇报：

- branch
- base / previous implementation SHA
- final fix commit SHA
- tests / checks
- push
- blocker（如有）

并明确确认：未真实写 Prod、未使用真实 Prod PAT、未修改 Test/Prod 业务代码、未 merge main。
