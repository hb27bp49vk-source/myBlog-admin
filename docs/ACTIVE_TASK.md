# ACTIVE TASK — myBlog Admin

## Status
Ready for Codex

## 当前任务
对独立 `myBlog-admin` 做一次只读的功能、结构与内容发布安全审计。

完整计划：
`docs/plans/2026-09-09-admin-function-release-safety-audit.md`

## Codex 执行要求
1. 先按 `AGENTS.md` 启动规则确认 Workspace / 仓库、工作区状态，并 `git pull --ff-only origin main`。
2. pull 后重新读取最新 `AGENTS.md`、本文件和上述 Plan。
3. 从最新 main 创建 `codex/admin-function-release-safety-audit`。
4. 只做静态审计，不使用真实 PAT，不向 Test/Prod 写入任何内容或图片。
5. 仅新增：`docs/audits/2026-09-09-admin-function-release-safety-audit.md`。
6. 必须重点检查 PAT、Markdown 预览、图片上传、Test 内容发布、Test→Prod 内容提升、失败/部分成功状态和回滚能力。
7. 必须专项判断当前 `promote()` 整份 Test `content.js` 覆盖 Prod 的风险与最小修复方案。
8. 对比历史 `myBlog-test/admin/` 只为识别功能缺口，不迁移、不复制旧实现。
9. 不修改 `index.html`、`admin.css`、`admin.js` 或其他仓库。
10. 完成后 commit：`docs: 审计博客 Admin 功能与发布安全`，push 分支后停止，不合并 main。

## 完成报告
中文报告：
- 分支
- base SHA
- commit SHA
- 报告路径
- 结构结论（保持现状 / 小型整理 / 专项重构）
- P0/P1/P2 风险摘要
- 对整份 `content.js` 覆盖 Prod 的结论
- push 状态
- 明确说明未使用真实 PAT、未写 Test/Prod、未修改业务代码、未合并 main
