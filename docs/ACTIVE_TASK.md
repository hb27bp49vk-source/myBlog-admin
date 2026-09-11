# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（第三轮人工验收 FAIL；停止局部 polish，进入 Admin Frontend Redesign）

## Status

`P0 Active (Frontend Redesign)`（myBlog Admin 整体前端重构）

Phase C 安全实现与此前 ChatGPT Review 结论继续有效，但用户第三轮人工验收明确确认：当前问题已超出 Phase C 局部样式范围。Phase B Test 内容维护仍然存在内容列表狭窄、技术信息喧宾夺主、逐条大编辑按钮、桌面空间严重浪费等问题；整个 Admin 仍像工程/调试页面，不适合作为长期日常维护工具。

因此：**停止继续做局部 CSS Visual Polish；当前 P0 改为一次有边界的 Admin Frontend Redesign。**

权威 Redesign Plan：

`docs/plans/2026-09-11-admin-frontend-redesign.md`

此前 Phase C Acceptance 记录：

`docs/reviews/2026-09-11-admin-phase-c-user-acceptance.md`

Phase C 安全 Review：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 当前目标

将 myBlog-admin 从“功能逐块堆叠的工程页”整理为长期可用的个人内容工作台：

- 明确分离 `内容维护（Test）` 与 `发布到 Prod` 两个工作模式；
- 重做 Test 内容库的浏览、搜索、过滤、选择与编辑布局；
- 不再让右侧内容列表缩成细栏，不再依赖每条巨大的“编辑”按钮；
- Phase C 改为清晰的受控发布流程/向导式工作区；
- 技术 ID/SHA 降级为辅助信息；
- 1440–1800 px 桌面端充分利用空间；
- 保持原生 HTML/CSS/JS，轻量、无框架、无 build system、无新增 CDN 运行时依赖。

完整 UX、性能、响应式和验收标准见 Redesign Plan。

## Executor 开始前

继续在现有 `codex/admin-phase-c-implementation` 分支实施，不新建另一条实现分支。

必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Redesign Plan、Phase C 安全 Review；
4. 先盘点当前 DOM ID、event binding、测试依赖，再重构 UI；
5. 当前环境继续优先使用已验证正常的 shell / PowerShell 文件修改路径，避免已知异常的内置 patch/helper；
6. 分支、治理、工作区异常则 STOP；不得 reset / clean / force。

## 允许修改

- `index.html`
- `admin.css`
- `admin.js` 中 UI/render/filter/selection 相关部分
- `phase-c.js` 中 UI/render/wiring 相关部分
- 相关 UI helper/tests/fixtures
- 治理文档

## 禁止改变

- Phase B 只写 `myBlog-test`；
- Phase B 当前图片禁用边界；
- content schema / stable ID 规则；
- Phase C C1–C9 安全模型；
- Prod PAT 不进入浏览器；
- baseline / blob / planHash / target-before / image hash / Environment approval；
- Phase C v1 不支持删除；
- 不得真实向 Prod 写入做开发/验收测试；
- 不得修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- 不得 merge implementation branch 到 main；
- 不得 reset / clean / force / 重写历史。

如果视觉重构必须改变 publisher、安全校验、release plan 数据语义或 Test 写入协议，立即 `Blocked` 并报告 ChatGPT。

## 测试要求

保持并通过：

- Phase B 回归；
- Phase C plan safety；
- Phase C boundary；
- publisher mock；
- diff 分类/过滤；
- review boundary；
- `git diff --check`。

新增搜索、类型过滤、工作模式切换等 JS 行为必须增加测试。

## STOP 状态机

- 当前：`P0 Active (Frontend Redesign)`。
- Redesign implementation commit + push 后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：`Awaiting User Acceptance`。
- 用户桌面人工验收通过后：`Completed / Accepted`；之后才允许另行处理 merge / 第一次真实受控 Prod 发布。
- 任意安全边界、凭据、治理或实现冲突：`Blocked`。

## 完成后只需报告

- branch
- redesign base SHA
- final redesign commit SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
