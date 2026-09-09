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
- 文章/短记/专题：目标仓库 `content.js`
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

## Codex 工作方式
任务开始前读取：
1. `AGENTS.md`
2. `docs/ACTIVE_TASK.md`
3. 与任务相关的计划文档

只执行 ACTIVE_TASK 授权范围。完成后 push 分支，等待 ChatGPT Review；未经授权不自行合并 main。

## 完成报告
用中文报告分支、commit SHA、修改文件、测试结果、push 状态和未完成风险。
