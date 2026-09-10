# ACTIVE TASK — myBlog Admin

## Status
Ready for Codex

## 最近完成
- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test 内容协议 Phase A 已完成并通过人工验收。
- myBlog-prod 内容协议 Phase A 已完成并通过正式站人工验收。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

## 当前任务
实现 **Admin Phase B：Test 内容维护能力**。

完整 Plan：
`docs/plans/2026-09-10-admin-phase-b-test-content-maintenance.md`

## Codex 执行要求
1. 确认当前仓库/Workspace 为 `myBlog-admin`，工作区干净且位于 `main`。
2. 执行 `git pull --ff-only origin main`；成功后重新读取最新 `AGENTS.md`、本文件、Plan 和设计文档。
3. 从最新 main 创建 `codex/admin-phase-b-test-content-maintenance`。
4. 只实现面向 `myBlog-test` 的 `content.json` 内容维护，不实现、不恢复任何 Prod 写入/提升。
5. 文章/短记/专题遵守 schemaVersion 1 与稳定 `<kind>_<ULID>` 协议；编辑不得改变 ID。
6. 写入必须基于读取到的 Test `content.json` blob SHA 做冲突保护；基线变化立即停止并要求重新加载，禁止覆盖。
7. 写入成功必须报告 commit SHA、content blob SHA、条目 ID；页面明确标识“Test / 测试站”。
8. 不使用 `eval` / `Function`；不得把真实 PAT 写入仓库、日志、DOM 持久记录或发布证据。
9. Test token 只允许推荐 Fine-grained PAT + `myBlog-test` + Contents Read and write；旧的默认明文长期保存行为不得继续作为默认。
10. 图片只有在能满足 Plan 的路径、哈希、imageRefs 和一致性要求时才实现；否则本阶段明确禁用图片写入，不得做部分成功流程。
11. 不修改 Test/Prod 仓库业务代码，不迁移历史 Test `admin/`，不做无关 UI 重构/文件拆分。
12. 完成验证后 commit + push 分支并停止，等待 ChatGPT Review；不要合并 main。

## 必须报告
- 分支、base SHA、最终 commit SHA、修改文件
- Test `content.json` 读取/校验/写入模型
- 新建与编辑三类内容的支持情况
- stable ID 生成与编辑不变验证
- SHA 冲突保护验证
- 图片本阶段实现或禁用的明确结论及原因
- PAT 存储/权限行为变化
- mock/fixture、语法检查、`git diff --check` 等验证结果
- push、工作区状态
- 明确未写 Prod、未修改 Test/Prod、未使用真实 PAT、未合并 main

## 门禁
ChatGPT Review + 合并 Admin main + 用户实际 Admin 页面 Test 内容维护人工验收全部通过前，不得开始 Phase C Prod Publisher。