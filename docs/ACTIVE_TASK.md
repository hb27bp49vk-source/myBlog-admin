# ACTIVE TASK — myBlog Admin

## Status
Ready for Codex

## 最近完成
- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B：Test 内容维护实现、Review Fix、合并与人工验收均已完成。
- 2026-09-10：setup refresh 排障临时目录已完成审查与清理；正式目录仅保留 myBlog-admin / myBlog-test / myBlog-prod。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

Phase C Plan：
`docs/plans/2026-09-10-admin-phase-c-safe-prod-publisher.md`

## 当前任务
实现 **Admin Phase C：安全 Prod Publisher**。

## Codex 执行要求
1. 确认操作仓库为 `myBlog-admin`，工作区干净且位于 `main`。
2. 执行 `git pull --ff-only origin main`；成功后重新读取最新 `AGENTS.md`、本文件、Phase C Plan 和设计文档。
3. 从最新 main 创建：`codex/admin-phase-c-safe-prod-publisher`。
4. 严格按 Phase C Plan 实现选择性 Test→Prod 提升、安全基线绑定、冲突停止和发布证据。
5. 未选 Prod 内容必须保持不变；Test 中不存在不得推导为删除。
6. 不得把 Phase B 的浏览器 Contents API Test 写入模式直接复制为 Prod 一键发布。
7. 如果当前部署条件无法提供设计要求的受控 Prod 执行边界，则不得降低安全标准：实现到安全预览/不可变 release plan/受控交接边界，并保持 Prod 真正写入禁用。
8. 图片只有在能满足依赖重算、哈希路径、白名单和原子提交时才允许进入 release；否则阻止。
9. 不修改 myBlog-test / myBlog-prod 业务代码；不使用真实 Prod PAT 做自动化测试。
10. 完成完整验证后 commit + push 当前分支并停止，等待 ChatGPT Review；不要 merge main。

## 必须报告
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

## 门禁
Phase C 经 ChatGPT GitHub Review 通过并完成后续人工验收前，不得合并或启用不受控的 Prod 写入。
