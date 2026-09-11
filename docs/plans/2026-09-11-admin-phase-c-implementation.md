# myBlog Admin Phase C — Implementation Plan

日期：2026-09-11
状态：`P0 Active (Implementation)`
授权基线：`69c50c62c8daa10edee9d7732623dafc16697329`
来源：ChatGPT Review 通过 `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`

## 1. 目标

实现安全的 Test → Prod 选择性内容发布器，同时保持 Phase B Test-only 写入能力不变。

硬约束：

- 浏览器端不得持有、接收、显示、记录或转发 Prod PAT。
- 不修改 myBlog-test / myBlog-prod 的内容协议。
- 不整份覆盖 Prod；按稳定 ID 选择性提升，未选内容逐字保留。
- `Test 中不存在` 不代表删除；Phase C 不实现删除。
- 发布前必须重新核验 Prod baseline，不一致立即停止并重新生成发布计划。
- 内容、图片、发布证据必须在同一个 Prod commit 中完成；任一部分无法原子完成则停止。
- 不引入第三方后端；不使用 classic `repo` token。

## 2. ChatGPT 最终决策 C1–C9

### C1 — 受控发布器执行边界

选择 **候选 1：GitHub Actions 受控发布会话**。

实施边界：

- Admin 仓库新增受 `workflow_dispatch` 触发的发布 workflow。
- Prod 凭据只存在于 GitHub Actions Secret / Environment Secret 中，使用仅限 `chance-hang/myBlog-prod` 的 Fine-grained PAT。
- 浏览器/Admin UI 只生成和提交 release plan，不接触 Prod 凭据。
- 不新增 EdgeOne / 自建服务端 / CryptoBox 微后端。

### C2 — releaseId

采用：`UTC 时间戳 + ULID + release-plan 内容哈希前 8 位`。

要求：releaseId 一旦生成不可变，并绑定唯一 release plan。

### C3 — release plan 最小字段

至少包含：

- `releaseId`
- `sourceTestCommitSha`
- `prodBaselineCommitSha`
- `prodContentBlobSha`
- `selectedEntries[]`：`kind` / `id` / source hash / target-before hash
- `images[]`：目标路径 / sha256 / 来源引用
- `operator`
- `testAcceptance`：Test URL、验收的 Test commit SHA、人工确认时间
- `createdAtUtc`
- `planHash`

禁止包含任何 PAT、Authorization header、secret 或可复用凭据。

### C4 — baseline 冲突恢复

Prod baseline 不一致时必须：

1. STOP；
2. 重新读取 Prod；
3. 重新生成 diff 与 release plan；
4. 重新 Review；
5. 不允许 silent retry / force / 自动覆盖。

### C5 — 图片边界

仅当所有被选内容引用的图片都能与 `content.json`、发布证据在同一 Prod commit 中完成时允许发布；否则 STOP。

图片目标路径必须白名单化并使用内容哈希命名/校验，禁止覆盖无关现有资产。

### C6 — 发布证据

发布证据写入：`myBlog-prod/docs/releases/<releaseId>.json`，并与内容和图片进入同一个 Prod commit。

该证据不得依赖“目录私有”假设；即使仓库或 Pages 可读取，也必须是**可公开暴露的非敏感元数据**，严禁 secret / PAT / Authorization 信息。

Prod commit message 至少包含 `releaseId`、source Test SHA 与 baseline SHA。

### C7 — 暂存分支

**Phase C v1 不使用 release 暂存分支。**

原因：本期优先保证“最终 baseline 复核 → 单次原子 commit → main”闭环，避免 PR/merge 在审批后到合并前引入新的 baseline 漂移窗口。

人工门禁由 GitHub Environment approval + Admin UI release plan Review 承担。Actions 在真正写 main 前必须再次核验 baseline；不一致即 STOP。

未来若引入 PR-based 发布，作为单独后续任务设计，不得在本期自行扩展。

### C8 — Test 页面真实验收证据

要求人工验收，但不强制截图。

release plan 至少记录：

- 已验收 Test commit SHA；
- 对应 Test Pages URL；
- 用户明确确认标记与时间。

纯 API 200 / schema 校验不能替代人工页面验收。截图可选，不作为 Phase C v1 硬依赖。

### C9 — 删除

**不纳入 Phase C。**

`Test 中不存在` 永远不解释为删除；任何删除能力必须另立任务、单独设计和验收。

## 3. Implementation 范围

Executor 允许：

1. 创建 Phase C 实施分支，建议：`codex/admin-phase-c-implementation`。
2. 修改 Admin UI / JS / CSS，增加 Phase C 选择、Prod baseline 读取、diff、release plan 生成与人工确认流程。
3. 新增 GitHub Actions workflow 与实现发布所需的仓库内脚本。
4. 新增单元 / 集成 / 浏览器行为测试与 fixtures。
5. 只读访问 Test / Prod 用于 baseline、schema、页面验证。

Executor 不允许：

- 使用真实 Prod PAT 做开发测试；测试必须 mock/fake。
- 实际向 Prod 写内容或资产；Implementation 阶段只实现能力与测试，不做真实 Prod 发布验收。
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议。
- 更改 C1–C9 核心边界；发现冲突必须 STOP 并回报 ChatGPT。

## 4. 必须实现的安全行为

- 稳定 ID 选择性提升；未选 Prod 内容保持不变。
- source Test SHA 与 Prod baseline SHA 都进入不可变 plan。
- 执行前重新读取 Prod HEAD / content blob，并与 plan baseline 比较。
- baseline 冲突返回明确错误并停止，不写任何 Prod 数据。
- 图片引用清单必须与 body / cover / imageRefs 实际引用一致。
- 单 commit 原子构建：content + images + `docs/releases/<releaseId>.json`。
- 发布器只允许白名单仓库 `chance-hang/myBlog-prod` 与白名单路径。
- workflow 输入不可接受任意 owner/repo/ref/path 来扩大写入范围。
- 日志不得输出 secret、token 或 Authorization header。

## 5. 测试与验收要求

至少覆盖：

- 选择一个 / 多个条目的选择性提升。
- 未选 Prod 条目逐字保持。
- Test 缺失条目不触发删除。
- Prod baseline 改变时 STOP，且没有写请求。
- 图片成功与图片缺失/哈希冲突 STOP。
- release plan hash / releaseId 稳定性与不可变性。
- workflow / publisher 仓库与路径白名单。
- mock secret 不进入前端 bundle / DOM / localStorage / sessionStorage / console。
- Phase B 既有测试全部继续通过。

真实 Prod 写入不属于本轮自动测试。

## 6. 完成条件与 STOP

Executor 完成 Implementation 后：

1. commit + push 实施分支；
2. 不自行 merge main；
3. `docs/ACTIVE_TASK.md` 更新为 STOP：`Awaiting ChatGPT Review`；
4. 只汇报：branch / base SHA / commit SHA / tests / push / blocker。

ChatGPT Review 通过后才进入 `Awaiting User Acceptance`；用户人工验收通过后，才允许设计/执行第一次真实受控 Prod 发布。
