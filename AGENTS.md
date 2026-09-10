# AGENTS.md — myBlog Admin

## 仓库角色
本仓库是独立博客内容维护台。它不是 Test 前台开发仓库，也不是 Prod 前台发布仓库。

目标职责：
- 编辑文章、短记、专题
- Markdown 预览
- 上传博客图片
- 将内容先发布到 `myBlog-test`
- 用户核对后，再把批准的内容提升到 `myBlog-prod`

## 与前台代码的边界
- `myBlog-test`：前台代码常规开发与验收。
- `myBlog-prod`：正式前台代码发布。
- `myBlog-admin`：内容维护和内容发布工具自身的开发。

Admin 自身代码如果要改，也应在本仓库独立开发、Review、验收；不要通过复制 Test/Prod 的旧 `admin/` 目录直接覆盖本仓库。

## 当前实现事实
当前维护台为纯前端 GitHub Pages，浏览器通过用户提供的 GitHub PAT 直接调用 GitHub API。

现有内容路径：
- 文章/短记/专题：目标仓库 content.json；content.js 仅由 Test 前台作为 legacy 只读回退源。
- 上传图片：目标仓库 `assets/uploads/`

## 安全规则
- 绝不把 PAT、token、Cookie、密码或其他凭据提交到 Git。
- 不在代码中硬编码真实 PAT。
- 涉及凭据存储方式、权限范围或发布权限的修改必须明确写入 ACTIVE_TASK 并单独 Review。
- 不因为开发方便而增加第三方后端或外部数据传输，除非用户明确授权。

## 内容发布安全
- 默认先写 Test，不直接把新内容首次发布到 Prod。
- Prod 提升必须有明确的用户确认动作。
- 提升内容时只处理内容协议明确允许的文件，不同步前台业务代码。
- 不允许内容提升覆盖 Prod 的 HTML/CSS/JS 前台环境差异。

## Codex 启动任务前必须先同步 GitHub
GitHub 是规则和 ACTIVE_TASK 的权威来源，本地治理文件可能过期。

每次用户要求执行当前任务时，Codex 必须先：
1. 确认当前 Workspace / Git 仓库是 `myBlog-admin`。
2. 执行 `git status`；若存在未知未提交修改，停止并中文报告，不直接 pull。
3. 常规新任务从 `main` 基线开始，执行 `git pull --ff-only origin main`。
4. pull 成功后重新读取最新 `AGENTS.md`、`docs/ACTIVE_TASK.md` 和 ACTIVE_TASK 引用的计划文档。
5. 只执行重新读取后的最新任务，不依据 pull 前缓存/旧文件行动。

若 fast-forward 失败、remote 异常、分支状态有歧义或工作区不干净：停止并报告，不自行 reset/clean/force/rebase 覆盖。

## Codex 工作方式
只执行 ACTIVE_TASK 授权范围。完成后 push 分支，等待 ChatGPT Review；未经授权不自行合并 main。

活跃任务分支建立后，原则上不要在 Review 前无关推进 `main`；若 `main` 必须前进，Review 前必须先把最新 main 安全同步到任务分支并重新验证，且不得扩大任务范围。

## 完成报告
用中文报告分支、commit SHA、修改文件、测试结果、push 状态和未完成风险。
