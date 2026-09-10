# ACTIVE TASK — myBlog Admin

最后更新：2026-09-10（Workflow 3.0 Phase 2 同步）

## Status
`P1 Queued`（Admin Phase C —— 安全 Prod Publisher）

## 当前优先级

- **没有 `P0 Active`**。
- **`P1 Queued`**：Admin Phase C —— 安全 Prod Publisher。**当前只允许只读审计、Plan 与文档工作；禁止 Implementation、禁止向 Prod 写内容、禁止 Executor 自行升级为 `P0 Active`。**
- **`P2 Backlog`**：等待 ChatGPT 派发新需求；新需求到达前 Executor 不主动实施任何变更。

## STOP 状态机

按 `GLOBAL_RULES.md §10`：

- `Awaiting ChatGPT Review`：commit / push 完成后等 ChatGPT Review diff。
- `Awaiting User Acceptance`：Review 通过后等用户人工验收。
- `Blocked`：缺信息 / 冲突 / 依赖未到位。
- `Completed / Accepted`：用户人工验收通过，ChatGPT 派发下一 Task 或执行发布。

Phase C 在 ChatGPT 显式升级为 `P0 Active` 之前必须停在 `P1 Queued`，Executor 不得自行推进到 `Awaiting ChatGPT Review`。

## 最近完成

- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B：Test 内容维护实现、Review Fix、合并与人工验收均已完成。
- 2026-09-10：setup refresh 排障临时目录已完成审查与清理；正式目录仅保留 myBlog-admin / myBlog-test / myBlog-prod。
- 2026-09-10：真实 Test 内容协议完整兼容 Hotfix 已完成；该 Hotfix 不推进或实现 Phase C。
- 2026-09-10：Username Migration 验收中发现的 Test 前台短记详情 Markdown 渲染问题已单独记录，不在 Admin 范围。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

Phase C Plan（仅供只读审计，不得据此启动 Implementation）：
`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`

## 当前任务

`P1 Queued`：**Admin Phase C —— 安全 Prod Publisher**。

## Executor 行为约束（升级前的硬约束）

Phase C 在 `P1 Queued` 状态下，Executor 在本仓库只允许：

1. 读取本仓库 `AGENTS.md`、`docs/ACTIVE_TASK.md`、Phase C Plan、设计文档。
2. 编写或修订只读审计、文档、测试脚本（不写实际生产数据）。
3. 执行 `git pull --ff-only origin main` 与 `git status` 状态检查。

**禁止**：

1. 自行创建 `codex/admin-phase-c-*` 或任何 Phase C 实施分支。
2. 自行把 Phase C 升级为 `P0 Active`。
3. 启动 Phase C Implementation、写任何 Prod 内容、降低安全标准。
4. 使用真实 Prod PAT 做自动化测试。
5. 修改 myBlog-test / myBlog-prod 业务代码。
6. 把 Phase B 的浏览器 Contents API Test 写入模式直接复制为 Prod 一键发布。

## 升级路径

Phase C 启动必须经过：

1. ChatGPT 在 `docs/ACTIVE_TASK.md` 显式将状态由 `P1 Queued` 改为 `P0 Active`，并明确：
   - base SHA；
   - 选择性 Test→Prod 提升模型；
   - Prod baseline 绑定方式；
   - 未选 Prod 内容保持方式；
   - 图片边界；
   - 凭据/权限实现策略；
   - 发布证据格式。
2. ChatGPT 通过 GitHub 治理文件或单独指令派发 Executor。
3. Executor 完成 Implementation → commit / push → 停在 `Awaiting ChatGPT Review`。
4. ChatGPT GitHub Review 通过 → `Awaiting User Acceptance` → 用户人工验收。
5. 用户人工验收通过 → `Completed / Accepted` → 允许后续受控 Prod 写入启用。

任何 Executor 不得跳过上述任一步骤。

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