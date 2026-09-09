# ACTIVE TASK — myBlog Admin

## Status
Ready for Codex

## 最近完成
2026-09-09：Admin 功能、结构与内容发布安全审计已完成并通过 ChatGPT Review，已合并 main。

- 审计 commit：`0a0369a76eacf4547636d50733c3e8d313647c0b`
- 审计报告：`docs/audits/2026-09-09-admin-function-release-safety-audit.md`
- 结论：当前 Admin 需要专项重构；在完成协议与安全发布设计前，不应恢复真实 Prod 内容提升。

## 当前任务
设计独立 `myBlog-admin` 的正式内容协议与安全发布流程，只做设计，不改业务代码。

完整计划：
`docs/plans/2026-09-09-admin-content-protocol-and-safe-publishing-design.md`

## Codex 执行要求
1. 先确认当前仓库/Workspace 为 `myBlog-admin`，工作区干净且位于 `main`。
2. 执行 `git pull --ff-only origin main`；pull 成功后重新读取最新 `AGENTS.md`、本文件、上述 Plan 和已完成审计报告。
3. 从最新 main 创建 `codex/admin-content-protocol-safe-publishing-design`。
4. 只做设计，不使用真实 PAT，不向 Test/Prod 写入内容或图片，不修改业务代码。
5. 仅新增：`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`。
6. 设计必须明确文章/短记/专题字段协议、协议版本、唯一 ID、Test 验收版本、Prod 基线、选择性提升、差异预览、图片依赖、失败状态、回滚证据和权限边界。
7. 必须明确是否继续使用 `content.js` 或迁移 JSON，并给出兼容/迁移方案。
8. 必须明确 Prod 基线变化时默认停止并重新 Review；不得设计自动覆盖。
9. 必须保持代码发布与内容发布分离，Admin 不得同步前台 HTML/CSS/JS 或环境配置。
10. 完成后 commit：`docs: 设计博客 Admin 内容协议与安全发布`，push 分支后停止，不合并 main。

## 完成报告
中文报告：
- 分支
- base SHA
- commit SHA
- 设计文档路径
- 内容存储格式决策
- 唯一 ID / 兼容策略
- Test→Prod 提升模型
- 图片与失败/回滚模型
- 后续实现阶段拆分
- push 状态
- 明确说明未使用真实 PAT、未写 Test/Prod、未修改业务代码、未合并 main
