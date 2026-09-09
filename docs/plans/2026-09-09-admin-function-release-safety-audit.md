# Blog Admin — 功能、结构与内容发布安全审计

状态：Ready for Codex
日期：2026-09-09

## 目的

只审计独立 `myBlog-admin` 当前真实实现，不做功能修改。判断现有 Admin 是否适合作为博客唯一内容维护入口，以及后续真正需要修什么；不要机械迁移 `myBlog-test/admin/`，也不要为了拆文件而拆文件。

## 已知重点

当前 Admin 是纯前端 GitHub API 工具，核心代码集中在 `index.html`、`admin.css`、`admin.js`。现有 `promote()` 明确会读取 Test 的完整内容数据，并写入 Prod 的整个 `content.js`；这是本次必须重点分析的内容发布安全边界。

## 审计范围

至少检查：
1. PAT 保存、读取、请求头、错误处理和最小权限假设；不得实际输出或记录真实 token。
2. Markdown 编辑/预览的安全与兼容性边界。
3. 图片压缩、命名、上传到 Test、引用路径、Test→Prod 图片同步机制。
4. 新内容发布到 Test 的数据结构是否与当前前台 `content.js` 协议兼容。
5. `promote()` 的完整流程：Test 数据读取、Prod `content.js` 覆盖、图片同步、用户确认、失败/部分成功状态。
6. 重点判断“整份 Test `content.js` 覆盖 Prod”在当前工作流下是否安全：包括 Prod 独有内容、并发修改、误覆盖、回滚和冲突检测。
7. 是否存在把前台业务代码、环境差异或非内容文件误同步到 Prod 的路径。
8. Admin 当前结构体量是否值得拆分；必须给出“保持现状 / 小型整理 / 专项重构”的结论与理由。
9. 与 `myBlog-test/admin/` 历史维护台的功能重叠和迁移缺口，但禁止把旧目录直接复制过来。
10. 给出 P0/P1/P2 风险和下一阶段最小修复建议，按优先级排序。

## 验证边界

本任务是静态代码审计：
- 不使用真实 PAT。
- 不向 Test/Prod 写入内容或图片。
- 不触发真实 promote。
- 可以做语法检查、静态搜索、数据协议对照。

## 允许修改

仅允许新增：
`docs/audits/2026-09-09-admin-function-release-safety-audit.md`

## 禁止修改

- `index.html`
- `admin.css`
- `admin.js`
- 任何 Test / Prod 文件
- AGENTS / ACTIVE_TASK
- 任何真实内容和凭据

## 分支与提交

- Branch：`codex/admin-function-release-safety-audit`
- Commit：`docs: 审计博客 Admin 功能与发布安全`

完成后 push 分支并停止，等待 ChatGPT Review；不要合并 main。
