# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（用户否决上一版前端验收，Promote Workbench V2）

## Status

`P0 Active (Implementation)`（myBlog Admin Workbench V2）

上一版 Frontend Redesign 虽通过 ChatGPT 代码 Review，但用户桌面人工验收明确 FAIL：布局在真实 16:9 桌面窗口仍出现内容侵占、编辑区被压窄、信息架构混乱等问题。用户决定停止继续修补上一版维护台，按新的 CMS 工作台方向直接重构。

当前权威 Plan：

`docs/plans/2026-09-11-admin-workbench-v2.md`

Phase C 安全 Review 继续有效：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 当前产品方向

以成熟 Git-based CMS 的交互为参考，但继续保持轻量原生架构。

核心约束：

- 左侧一级导航只保留 `文章 / 短记 / 发布`；
- 文章分类使用现有真实分类 `项目(project) / AI(ai) / 生活(life)`；
- `专题` 不再作为一级高频入口，底层兼容数据暂不删除；
- 具体 `type` 只作为标签 / 次级筛选，不进入全局主导航；
- 中间为高密度内容列表；
- 右侧为大编辑区；
- 默认单编辑视图，预览 / 元数据切换，分屏仅按需开启；
- 顶部只表达当前 Test 状态，不把 Prod 做成普通环境切换；
- Prod 只能从独立“发布”入口进入 Phase C；
- 不使用误导性的“自动保存”远端语义；
- 16:9 桌面必须无跨栏、无重叠、无横向侵占；
- 不新增框架、build system、CDN 运行时依赖。

完整信息架构、响应式、性能、测试和验收标准见 Workbench V2 Plan。

## Executor 开始前

继续在现有 `codex/admin-phase-c-implementation` 分支实施，不新建第二条实现分支。

必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Workbench V2 Plan、Phase C 安全 Review；
4. 先盘点当前 DOM / event wiring / tests，再重构；
5. 当前环境继续使用已验证正常的 shell / PowerShell 文件修改路径，避免已知异常的内置 patch/helper；
6. 异常立即 STOP，不得 reset / clean / force。

## 允许修改

- `index.html`
- `admin.css`
- `admin.js` 中 UI / render / filter / navigation / editor-view 相关部分
- `phase-c.js` 中纯 UI / render / wiring 相关部分
- 前端行为测试 / fixtures
- 治理文档

## 禁止改变

- Phase B 只写 `myBlog-test`；
- content schema / stable ID；
- Phase B 图片禁用边界；
- Phase C C1–C9；
- Prod PAT 不进入浏览器；
- baseline / blob / planHash / target-before / image hash / Environment approval；
- Phase C v1 不支持删除；
- 不得真实写 Prod 做开发测试；
- 不得修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- 不得 merge main；
- 不得 reset / clean / force / 重写历史。

如重构需要修改 publisher、安全校验、release plan 语义或 Test 写入协议，立即 `Blocked`。

## 测试要求

保持现有全部回归，并新增 Workbench V2 行为测试，具体见 Plan。

至少覆盖：

- 文章 / 短记 / 发布导航；
- project / ai / life 分类筛选；
- 搜索与日期倒序；
- 列表选中进入编辑；
- 编辑 / 预览 / 元数据切换；
- Test state / baseline 在页面模式切换后保留；
- 响应式布局关键断点 contract；
- `git diff --check`。

## STOP 状态机

- 当前：`P0 Active (Implementation)`。
- Workbench V2 implementation commit + push 后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：`Awaiting User Acceptance`。
- 用户 16:9 桌面人工验收通过后：`Completed / Accepted`。
- 任意安全 / 凭据 / 治理 / 实现冲突：`Blocked`。

## 完成后只需报告

- branch
- implementation base SHA
- final Workbench V2 commit SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
