# ACTIVE TASK — myBlog Admin

## Status
Review Fix Required

## 最近完成
- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B 首次实现已推送：`2ef1476cd41462026873227af89ee1ff9a4bfcd0`。
- ChatGPT 已完成首轮 GitHub Review；当前不得合并 main。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

完整 Plan：
`docs/plans/2026-09-10-admin-phase-b-test-content-maintenance.md`

## 当前任务
在现有分支 `codex/admin-phase-b-test-content-maintenance` 上完成 Review Fix。

## Review 阻塞项

### P0 — 当前真实 Test content.json 无法被 Admin 读取
当前 `myBlog-test/content.json` 的既有内容日期仍为 `YYYY.MM.DD`（例如 `2026.09.08`），而首次实现的 `admin.js` 读取校验只接受 `YYYY-MM-DD`。因此 Admin 对当前真实 Test 基线执行 `load()` 时会在严格校验阶段失败，Phase B 无法实际进入维护流程。

设计协议要求新写入日期为 ISO `YYYY-MM-DD`，但本 Review Fix 不允许直接修改 myBlog-test 业务内容，也不能放宽未来写入协议。需要在 Admin 侧设计一个明确、受控的“legacy read compatibility / write normalization”方案：
- 能读取当前已经发布并通过 Phase A 验收的 Test `content.json`；
- 新建/编辑写入必须继续产出设计规定的 ISO `YYYY-MM-DD`；
- 不得静默把整份未编辑 Test 内容批量改写/归一化；
- 不得因为编辑一个条目而顺带改变其他条目的日期/字段；
- 若协议层无法在不破坏严格写入约束的前提下做到，停止并报告，不要自行修改 Test 仓库。

### P1 — 自动测试与报告不一致，关键门禁没有实际覆盖
当前 `tests/admin-phase-b.test.js` 只覆盖纯内容校验、重复 ID、编辑 ID 不变和 ULID 格式；没有实际覆盖报告中声称的：
- GitHub Contents API 写入携带读取到的 blob SHA；
- 409 / 422 baseline conflict 时停止写入；
- 写入成功回执必须包含 commit SHA + content blob SHA；
- 不会访问 Prod 写接口；
- PAT 不进入 localStorage/sessionStorage/持久 DOM/日志。

Review Fix 必须补充 mock/fixture 测试，使这些关键边界有可重复验证证据。必要时将网络函数以可测试方式导出/注入，但不要做无关重构。

## Review Fix 要求
1. 保持当前分支，不要切回 main 创建新分支，不要 rebase 已推送分支。
2. 先读取当前分支最新 `AGENTS.md`、本文件、Plan、Design。
3. 同时只读核对当前 `myBlog-test/content.json` 的真实 schema/日期格式；不得修改 Test 仓库。
4. 修复 P0，并补齐 P1 自动测试。
5. 保持既有安全边界：Test-only、无 Prod 写入/提升、稳定 ID、blob SHA 冲突保护、内存 PAT、图片写入禁用、无 eval/Function。
6. 执行 `node --check admin.js`、完整 Phase B 测试、`git diff --check`。
7. commit + push 到同一分支后停止，不要 merge main。

## 必须报告
- Review Fix commit SHA 与修改文件
- 如何兼容当前真实 Test 日期，同时保证新写入 ISO 且不批量改写未编辑内容
- mock 测试如何证明 SHA 请求、409/422 停止、完整回执、无 Prod 写接口、PAT 不持久化
- 全部测试结果
- 明确未修改 myBlog-test / myBlog-prod、未使用真实 PAT、未 merge main

## 门禁
本 Review Fix 经 ChatGPT 再 Review 通过前，不得合并 Admin main；合并后仍需用户实际 Admin→Test 人工验收，之后才可讨论 Phase C。