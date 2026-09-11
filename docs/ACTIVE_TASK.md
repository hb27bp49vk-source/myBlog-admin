# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Phase C Implementation 基线规则修正）

## Status

`P0 Active (Implementation)`（Admin Phase C —— 安全 Prod Publisher）

当前执行已由 ChatGPT 明确授权。Executor 完成 Implementation 后必须 STOP 在 `Awaiting ChatGPT Review`，不得自行 merge main、不得自行进入真实 Prod 发布。

## 当前优先级

- **`P0 Active (Implementation)`**：Admin Phase C —— 安全 Prod Publisher。
- **`P1 Queued`**：无。
- **`P2 Backlog`**：等待 ChatGPT 后续派发。

## 权威 Plan

本轮 Implementation 唯一实施入口：

`docs/plans/2026-09-11-admin-phase-c-implementation.md`

Planning 历史与决策输入：

`docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`

设计依据：

`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

既有概念 Plan：

`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`

若文档之间出现冲突，本轮以当前显式用户指令 → 本文件 → `2026-09-11-admin-phase-c-implementation.md` → 其他历史文档的顺序解释；发现实质冲突必须 STOP 并报告 ChatGPT。

## ChatGPT Review 结论

2026-09-11：Phase C Planning Review PASS。

C1–C9 已由 ChatGPT 裁决并写入 Implementation Plan，其中核心结论：

- C1：采用 GitHub Actions 受控发布会话；Prod PAT 只存在于 Actions Secret / Environment Secret，浏览器不接触。
- C4：Prod baseline 冲突必须重新读取、重新生成 diff / plan、重新 Review；禁止静默继续。
- C5：图片必须与内容、发布证据同一 Prod commit 原子完成，否则 STOP。
- C6：发布证据进入 `myBlog-prod/docs/releases/<releaseId>.json`，且必须按可公开暴露的非敏感数据设计。
- C7：Phase C v1 不使用 release 暂存分支；使用 Environment approval + 写入前 baseline 复核 + 单 commit 直接写 main 的受控模型。
- C8：真实 Test Pages 人工验收必须绑定 Test SHA + URL + 用户确认；截图可选。
- C9：Phase C 不实现删除。

完整 C1–C9 以 Implementation Plan 为准。

## Implementation 授权边界

**实施基线规则：不再使用固定旧 SHA 作为可执行分支基线。**

Planning 完成点 `69c50c62c8daa10edee9d7732623dafc16697329` 仅保留为历史追溯，不再授权从该 SHA 开始 Implementation。

Executor 在创建或重建实施分支前必须：

1. 切回 `main`；
2. `git pull --ff-only origin main`；
3. 确认 `main == origin/main`；
4. 确认工作区 clean；
5. 重新读取最新 `AGENTS.md`、本文件和 Implementation Plan；
6. **以此时同步后的最新 main HEAD 作为 implementation base**；
7. 若本地实施分支存在但无独有实现提交，可在确认安全后删除并从最新 main 重建；若无法安全确认则 STOP，不得 reset / clean / force。

如果 `main != origin/main`、工作区不 clean、治理文件冲突，或实施分支 base 不是同步后的最新 main HEAD，必须 STOP 并报告，不得继续 Implementation。

Executor 允许：

1. 完成上述同步与基线核验后创建实施分支，建议 `codex/admin-phase-c-implementation`。
2. 修改 myBlog-admin 的 UI / JS / CSS、仓库内发布脚本、GitHub Actions workflow、tests / fixtures / 实施文档。
3. 只读访问 myBlog-test / myBlog-prod 用于 baseline、schema 与页面验证。
4. 使用 mock / fake credential 完成自动测试。

禁止：

1. 使用或要求真实 Prod PAT 进行开发测试。
2. 实际向 myBlog-prod 写内容、图片或发布记录。
3. 修改 myBlog-test / myBlog-prod 业务代码或内容协议。
4. 把 Phase B 浏览器 Contents API Test 写入路径复制为 Prod 写入口。
5. 绕过 baseline 检查、force、reset、clean、重写历史或静默覆盖。
6. 自行修改 C1–C9 核心安全边界；遇到设计冲突必须 STOP。
7. 自行 merge 实施分支到 main。

## STOP 状态机

- Implementation 进行中：按当前 P0 与 Implementation Plan 执行。
- 实施 commit + push 完成后：`Awaiting ChatGPT Review`。
- ChatGPT Review 通过后：`Awaiting User Acceptance`。
- 用户人工验收通过后：`Completed / Accepted`。
- 任意凭据 / baseline / 治理冲突：`Blocked`。

## 最近完成

- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B：Test 内容维护实现、Review Fix、合并与人工验收均已完成。
- 2026-09-10：Workflow 3.0 Phase 2 治理同步完成。
- 2026-09-10：Phase C 从 `P1 Queued` 提升到 `P0 Active (Planning)`，Planning commit `69c50c62c8daa10edee9d7732623dafc16697329`。
- 2026-09-11：Codex 在零旧聊天上下文条件下成功按 GitHub 治理接管，识别 `P0 Active (Planning)` / `Awaiting ChatGPT Review`，未越权修改；随后按授权仅执行 Phase B 回归验证，工作区保持 clean。
- 2026-09-11：ChatGPT Planning Review PASS，C1–C9 写入 `docs/plans/2026-09-11-admin-phase-c-implementation.md`，Phase C 正式升级为 `P0 Active (Implementation)`。
- 2026-09-11：首次 Implementation 接管发现旧固定授权 SHA 与最新治理 main 不一致；Codex 正确 STOP。ChatGPT 已修正规则为“同步最新 main 后动态确定 implementation base”，避免治理提交推进 main 后产生自相矛盾的固定 SHA。

## Implementation 完成后必须报告

只需汇报：

- branch
- base SHA
- final commit SHA
- tests / checks
- push
- blocker（如有）

并明确确认：未真实写 Prod、未使用真实 Prod PAT、未修改 Test/Prod 业务代码、未 merge main。
