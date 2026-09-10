# myBlog Admin Phase C — Planning Stage Decisions

日期：2026-09-10
范围：Planning Only（不实施 Implementation，不向 Prod 写内容，不使用真实 Prod PAT）
Base SHA：`90d9de74f83f89659e9d335d50d0d25fb3a62c2b`（myBlog-admin `main`，含 Workflow 3.0 Phase 2 治理同步）
STOP：Awaiting ChatGPT Review

## 0. 与既有文档的关系

- 概念 Plan（只读参考，不修改）：`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`
- 设计依据（只读参考）：`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`
- 既有审计（只读参考）：`docs/audits/2026-09-09-admin-function-release-safety-audit.md`
- 本文件：Planning Stage 沉淀。它记录"起什么、走什么、等 ChatGPT 决策什么"。Implementation Stage 在 ChatGPT 把 Status 显式从 `P0 Active (Planning)` 推动到 `P0 Active (Implementation)` 后才允许开始。

## 1. Planning 阶段范围（硬约束）

允许：

- 读本仓库 `AGENTS.md`、`docs/ACTIVE_TASK.md`、既有设计与 Plan。
- 读 `myBlog-test` 与 `myBlog-prod` 当前 `content.json` 与发布页面（raw.githubusercontent + GitHub Pages）。
- 在本仓库 `docs/plans/`、`docs/audits/`、`docs/ACTIVE_TASK.md` 写或修订 Planning 类文档。
- 起草并修订只读审计报告、Decision 表与本文件。

禁止（与 ACTIVE_TASK.md §当前任务 同义）：

1. 启动任何 Implementation：不得改 `admin.js` / `admin.css` / `index.html` / 新建发布器代码或工作流。
2. 不得创建 `codex/admin-phase-c-*` 分支或任何 Phase C 实施分支。
3. 不得向 `myBlog-test` 或 `myBlog-prod` 的任何文件、`assets/`、`gh-pages`、Actions、Gist、EdgeOne 端点发出写请求。
4. 不得要求或尝试输入、读取、记录、转发真实 Prod PAT。
5. 不得修改 `myBlog-test` / `myBlog-prod` 业务代码。
6. 不得改变 Admin Phase B 的 Test-only 写入行为（B 已经稳定验收过）。

## 2. 只读审计结论（Planning 输入）

来源：见 §0 中的既有文档 + 本次新做的 read-only 观察。

1. Admin 当前实现严格 Test-only：`getContent` / `putContent` 固定指向 `chance-hang/myBlog-test`，无 Prod 路径；`admin.js` 无 `myBlog-prod` / `localStorage` / `sessionStorage` / `console.log` 子串命中（既有 `tests/review-boundaries.test.js` 自动校验）。
2. Phase B 已实现 Test 写入冲突检测（`409 / 422 → BASELINE_CONFLICT`，停止且不写）；本次审计未发现新的可绕过路径。
3. `myBlog-test/content.json` 与 `myBlog-prod/content.json` 当前均为 `schemaVersion: 1`、文章首条完全一致；Phase A 内容协议已稳定，Phase C 实施阶段不需要修改 schema。
4. `tests/fixtures/test-content-schema-shapes.json` 覆盖展示型 `type`、点分日期、专题日期范围、cover / imageRefs / topic 可选 category；可作为 Phase C 实施测试 fixture 的复用基础。
5. 浏览器直连 GitHub Contents API 路径只服务 Phase B 的 Test 写入；不能、不应、也不会被提升为 Prod 写入口。

## 3. Phase C 实施边界（设计文档 §4 §5 §6 摘要，作为 ChatGPT 裁决的输入）

来自设计文档 `2026-09-09-admin-content-protocol-and-safe-publishing.md`：

- 选择性提升：按稳定 ID 选择；未选条目逐字保留；`Test 中不存在` ≠ 应删除。
- 不可变 release plan：`releaseId` + Test commit SHA + Prod baseline SHA + content blob SHA + 选中条目字段哈希 + 图片依赖 + 操作者 + 确认时间。
- 提交前再次核验 Prod baseline，不一致即停止。
- 单 commit：内容 + 图片 + 发布记录必须在同一 commit（Git Data API，非 Contents API）。
- 受控发布器：浏览器内不得持有 Prod PAT；服务端或等价受控边界保存仅限 `myBlog-prod` 的 Fine-grained token。
- 图片：哈希路径、白名单目录、与 `body` / `cover` 解析出的实际引用清单一致；冲突即停。
- 删除：本期不实现；`Test 中不存在` 永远不解释为删除。
- 凭据：Test 与 Prod 完全隔离；不存前端；不记日志；不写入发布证据。

## 4. 受控发布器执行边界候选（须由 ChatGPT 裁决）

下列候选在设计合规性上等价可行，但实现/部署成本与可观察性不同。ChatGPT 在 Review 时从 1–3 选一（或追加新的约束）。

### 候选 1 — GitHub Actions workflow 受控发布会话

- 实现：在 Admin 仓库新增 `.github/workflows/admin-publish.yml`，受 `workflow_dispatch` + 受保护环境 `prod-publish` 触发。
- 凭据边界：仓库 GitHub Actions secrets 保存仅限 `myBlog-prod` 的 Fine-grained PAT；浏览器端不知道这个 PAT。
- 单 commit：通过 `peter-evans/create-pull-request` 或自有脚本 + `git push` 在 Actions 内部完成内容与图片原子提交。
- 回滚：相同 workflow 接受 `releaseId`、生成反向 plan、记录新 releaseId。
- 优点：原生 GitHub、与 GitHub API 同源、Image / Content 能在同一 actions checkout 期间一并 push、GitHub audit log 可直接对照。
- 缺点：仓库必须有 Actions 权限；需要用户在仓库 Settings → Environments 配 approval。
- 与 Phase B 兼容性：保持不动；新增能力不修改既有 Test-only 代码路径。

### 候选 2 — 客户端 CryptoBox 加密的浏览器一键发布（次选）

- 实现：浏览器端用 WebCrypto 加密 PAT；服务端解密后代理提交；服务端仅持有解密后凭据的内存引用。
- 凭据边界：浏览器端加密 → 服务端解密 → 内存引用 → 用完即弃。
- 单 commit：通过服务端 Git Data API 代理完成。
- 优点：Admin 仍是纯前端；不依赖 Actions。
- 缺点：服务端需要能部署；项目历史已经验证 `*.edgeone.cool` 在公司网络下不可直接跨站调用；自建后端会引入第三方依赖，与既有 `不增加第三方后端` 偏好冲突。
- 说明：本候选事实上等于"再造一个微发布器"，且需要 ChatGPT 显式接受新增服务端依赖。

### 候选 3 — 用户本地命令行脚本作为发布器

- 实现：在 Admin 仓库新增只读 plan 导出 + 用户本地脚本 `scripts/apply-release.mjs`；用户从 Admin 下载不可变 release plan，复制粘贴 plan JSON 到本地，脚本使用本地环境变量里的 Prod PAT 完成提交。
- 凭据边界：服务端不存 PAT；本地环境变量持有。
- 单 commit：本地 git tree + push 一次完成。
- 优点：最小依赖、最小攻击面、与现有"浏览器不存 PAT"偏好自然对齐；无须新部署。
- 缺点：需要用户在本地具备 Node + Git 推送能力；计划导出/粘贴/执行多一步操作。
- 说明：本候选事实上是"Plan 计算交给浏览器浏览器、Content+Image 提交交给本地脚本"的最小化拆分。

### 候选排除

- *EdgeOne Pages / EdgeOne Makers / EdgeOne Functions*：公司 DNS 拦截 `edgeone.cool` 跳钓鱼页（2026-08-31 验证），跨站前端不可调用；不在候选。
- *GitHub Contents API + 浏览器内置 PAT*：被设计文档 §3 §6 与审计报告明确禁止；不在候选。
- *classic `repo` token*：宽权限；不在候选。

## 5. 必须由 ChatGPT 决策的清单（Phase C 进入 Implementation 前阻塞项）

| 编号 | 决策项 | 默认建议 |
| --- | --- | --- |
| C1 | 受控发布器执行边界（§4 候选 1/2/3） | 候选 1（GitHub Actions） |
| C2 | releaseId 生成策略 | 内容哈希前缀 + UTC 时间戳 + ULID |
| C3 | release 计划字段最小集 | 沿用设计文档 §4.1 |
| C4 | 基线冲突停止后的恢复路径 | 强制重新读取 Prod + 重新生成 diff + 重新 Review；无静默继续 |
| C5 | 图片边界 | 仅当所有图片可在同 commit 完成时允许提升；否则 stop |
| C6 | 发布证据保存位置 | `myBlog-prod` 私有 `docs/releases/<releaseId>.json`（不进 GitHub Pages 部署） |
| C7 | 是否需要暂存分支 | 需要：发布器 push 到 `release/<releaseId>`，通过 PR/手动合并到 `main`，避免直接 ref update 误操作 |
| C8 | 验收模型是否要求"Test 页面真实访问证据" | 要求：UI 提供文字确认 + 截图链接/手动标注；纯 API 200 不可替代 |
| C9 | 删除动作是否纳入 Phase C | 不纳入；保持 `Test 中不存在` ≠ 删除 |

决策 C1 是全部阻塞项；其余可在 Implementation 阶段调整。Implementation Stage 在 C1 解决前不应开始。

## 6. 实施路线图（Implementation Stage 高粒度，仅 Reference）

不在本次 Plan 内实施，仅记录主线：

1. C1 决策 → 在 Admin 仓库新建相应边界（actions 或本地脚本）。
2. Admin UI 增加 Phase C tab：只读审计 Test 已有条目 + 按 ID 选择 + 拉取 Prod baseline + 生成不可变 release plan + 显示 diff。
3. 落地 §3 全部设计约束（基线核对、单 commit、删除独立、图片 hash 路径、白名单目录）。
4. 测试：单元 / 集成 / Playwright 三层覆盖 §3 第 1–10 条。
5. ChatGPT Review → 用户人工验收（不直接走 Accept）。

## 7. 不变项 / 与既有文档的一致性

- 不动 Phase B Test-only 写入代码。
- 不动 `myBlog-test` / `myBlog-prod` 内容协议。
- 不动既有 `docs/designs/` 与 `docs/audits/`。
- 不在 Admin UI 中复制 Phase B Test 浏览器 Contents API 写入模式到 Prod。
- 不在浏览器内接收、显示、回传、记录 Prod PAT。
- 不引入宽权限 token、classic `repo`、跨站点第三方后端。

## 8. 完成报告（本次 Planning commit）

- 分支：`main`（无 Phase C 实施分支）
- base SHA：`90d9de74f83f89659e9d335d50d0d25fb3a62c2b`
- 修改文件：
  - `docs/plans/2026-09-10-admin-phase-c-planning-decisions.md`（新增）
  - `docs/ACTIVE_TASK.md`（Status：`P1 Queued` → `P0 Active (Planning)`；新增本文件引用）
- 测试：未运行新测试；Planning 仅文档工作；不修改任何 `tests/` 与业务代码。
- push：见 blocker 段。
- 显式确认：未整份覆盖 Prod、未隐式删除、未修改 Test/Prod 业务代码、未使用真实 Prod PAT、未 merge `main` 之外的任何分支、未实施任何 Phase C Implementation。
