# ACTIVE TASK — myBlog Admin

最后更新：2026-09-10（Phase C Planning Stage）

## Status

`P0 Active (Planning)`（Admin Phase C —— 安全 Prod Publisher）

STOP 状态：`Awaiting ChatGPT Review`。本次提交完成后停在 Review，不自行进入 Implementation Stage。

## 当前优先级

- **`P0 Active (Planning)`**：Admin Phase C Planning。本次范围只读审计 + Planning 文档；不启动 Implementation、不向 Prod 写内容、不使用真实 Prod PAT、不创建 Phase C 实施分支。详见 `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`。
- 没有其他 `P0 Active`。
- **`P1 Queued`**：无。
- **`P2 Backlog`**：等待 ChatGPT 派发非 Phase C 的新需求；新需求到达前 Executor 不主动实施任何变更。

## STOP 状态机

按 `GLOBAL_RULES.md §10`：

- `Awaiting ChatGPT Review`：commit / push 完成后等 ChatGPT Review diff。**当前所在。**
- `Awaiting User Acceptance`：Review 通过后等用户人工验收。
- `Blocked`：缺信息 / 冲突 / 依赖未到位。
- `Completed / Accepted`：用户人工验收通过，ChatGPT 派发下一 Task 或执行发布。

Phase C 从 Planning Stage 推进到 Implementation Stage 必须再次经 ChatGPT 显式重新授权（`P0 Active (Planning)` → `P0 Active (Implementation)`），并至少先解决 `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md` §5 的 C1 受控发布器执行边界决策。

## 最近完成

- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B：Test 内容维护实现、Review Fix、合并与人工验收均已完成。
- 2026-09-10：setup refresh 排障临时目录已完成审查与清理；正式目录仅保留 myBlog-admin / myBlog-test / myBlog-prod。
- 2026-09-10：真实 Test 内容协议完整兼容 Hotfix 已完成；该 Hotfix 不推进或实现 Phase C。
- 2026-09-10：Username Migration 验收中发现的 Test 前台短记详情 Markdown 渲染问题已单独记录，不在 Admin 范围。
- 2026-09-10：Workflow 3.0 Phase 2 治理同步（`90d9de7`）已完成；Phase C 仍处于 P1 Queued 的硬约束生效。
- 2026-09-10：Phase C Planning Stage 提交：Status `P1 Queued` → `P0 Active (Planning)`；新增 `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`；仍停在 `Awaiting ChatGPT Review`。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

Phase C 概念 Plan（只读参考，不自动据此启动 Implementation）：
`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`

Phase C Planning Stage Decisions（本阶段产出；阻塞 C1 受控发布器决策）：
`docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`

## 当前任务

`P0 Active (Planning)`：**Admin Phase C Planning**。

本次任务允许：

1. 读取与本次任务相关的设计文档、Phase C 既有 Plan 与既有审计。
2. 写或修订 `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md` 与本文件。
3. 跑既有 `tests/` 验证 Phase B 没回归（`node --check admin.js` / Node test 入口）。
4. `git pull --ff-only origin main` 与 `git status` 状态检查。

禁止（与既有 §升级前的硬约束 同义，再强调）：

1. 自行创建 `codex/admin-phase-c-*` 或任何 Phase C 实施分支。
2. 自行把 Phase C 升级为 `P0 Active (Implementation)`。
3. 启动 Phase C Implementation、写任何 Prod 内容、降低安全标准。
4. 使用真实 Prod PAT 做自动化测试。
5. 修改 myBlog-test / myBlog-prod 业务代码。
6. 把 Phase B 的浏览器 Contents API Test 写入模式直接复制为 Prod 一键发布。
7. 在浏览器内持有、记录、转发 Prod PAT。

## 升级路径

Phase C Implementation Stage 启动必须经过（与既有 §升级路径 同义）：

1. ChatGPT 在本文件显式将状态由 `P0 Active (Planning)` 推进到 `P0 Active (Implementation)`，并明确：
   - base SHA；
   - 选择性 Test→Prod 提升模型；
   - **C1**：受控发布器执行边界（候选 1 / 2 / 3，见 Planning Decisions §4）；
   - **C2–C9**：其余决策项（见 Planning Decisions §5）；
   - Prod baseline 绑定方式；
   - 未选 Prod 内容保持方式；
   - 图片边界；
   - 凭据 / 权限实现策略；
   - 发布证据格式。
2. ChatGPT 通过 GitHub 治理文件或单独指令派发 Executor。
3. Executor 完成 Implementation → commit / push → 停在 `Awaiting ChatGPT Review`。
4. ChatGPT GitHub Review 通过 → `Awaiting User Acceptance` → 用户人工验收。
5. 用户人工验收通过 → `Completed / Accepted` → 允许后续受控 Prod 写入启用。

任何 Executor 不得跳过上述任一步骤；Phase C Planning Stage 不得自行跳到 Implementation。

## 门禁

Phase C 经 ChatGPT GitHub Review 通过并完成后续人工验收前，不得合并或启用不受控的 Prod 写入。

## 必须报告（Phase C 启动后）

- 分支、base SHA、最终 commit SHA、修改文件
- 选择性提升模型
- Test 验收 SHA / Prod baseline 绑定方式
- Prod 基线冲突停止方式
- 未选 Prod 内容保持方式
- 图片最终边界
- 凭据/权限实现
- 发布证据格式
- 测试结果
- push / 工作区状态
- 明确确认未整份覆盖 Prod、未隐式删除、未修改 Test/Prod 业务代码、未使用真实 Prod PAT、未 merge main