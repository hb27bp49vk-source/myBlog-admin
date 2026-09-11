# ACTIVE TASK — myBlog Admin

最后更新：2026-09-11（Workbench V2 Review Fixes 完成，Awaiting ChatGPT Review）

## Status

`Awaiting ChatGPT Review`（myBlog Admin Workbench V2）

Workbench V2 implementation commit：

`fc97e1abeb3766c354745d03d53234ab84e9e904`

Workbench V2 Review Fixes 已完成并待 ChatGPT Review。

权威 Review：

`docs/reviews/2026-09-11-admin-workbench-v2-review.md`

当前权威 Plan：

`docs/plans/2026-09-11-admin-workbench-v2.md`

Phase C 安全 Review 继续有效：

`docs/reviews/2026-09-11-admin-phase-c-chatgpt-review.md`

## 已确认通过

- 一级导航为 `文章 / 短记 / 发布`；
- 文章分类包含 `项目(project) / AI(ai) / 生活(life)`；
- Prod 仍通过独立发布入口进入；
- 未新增框架 / build system / CDN 运行时依赖；
- 未发现 Phase B Test-only 与 Phase C C1–C9 安全边界被削弱。

## 当前 Review Fixes

### 1. 完成右侧编辑区三态

必须实现：

- `编辑`（默认）
- `预览`
- `元数据`

stable ID、日期、分类、type、reading 等技术/辅助信息进入元数据视图，不再长期全部铺在主编辑视觉中。

如保留分屏，必须显式按需开启，不得默认双栏。

### 2. 降级专题高频入口

保留 topic schema / 历史兼容，但：

- 一级导航不出现专题；
- 默认新建/日常编辑路径只面向文章 / 短记；
- `专题` 不得继续与文章/短记平级出现在高频内容类型选择中；
- 若必须保留 topic 兼容编辑，放入弱化的兼容入口。

### 3. 补 Workbench V2 真实行为测试

必须覆盖：

- 文章 / 短记 / 发布导航行为；
- project / ai / life 分类筛选；
- 搜索 / 日期倒序；
- 列表选中进入编辑；
- 编辑 / 预览 / 元数据切换；
- Test state / baseline 在页面模式切换后保留；
- 关键 16:9 断点布局 contract（至少覆盖 1366×768、1440×810、1536×864、1920×1080 的无横向重叠/侵占规则）。

现有 Phase B / Phase C 回归与 `git diff --check` 必须继续通过。

## Executor 开始前

继续在现有 `codex/admin-phase-c-implementation` 分支追加修复。

必须：

1. `git pull --ff-only origin codex/admin-phase-c-implementation`；
2. 确认本地与远端一致、worktree clean；
3. 重新读取 `AGENTS.md`、本文件、Workbench V2 Plan、Workbench V2 Review、Phase C 安全 Review；
4. 继续使用 shell / PowerShell 文件修改路径，避免已知异常的内置 patch/helper；
5. 异常立即 STOP，不得 reset / clean / force。

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

## STOP 状态机

- 当前：`Awaiting ChatGPT Review`。
- Review Fix commit + push 后：`Awaiting ChatGPT Review`。
- ChatGPT Review PASS 后：`Awaiting User Acceptance`。
- 用户 16:9 桌面人工验收通过后：`Completed / Accepted`。
- 任意安全 / 凭据 / 治理 / 实现冲突：`Blocked`。

## 完成后只需报告

- branch
- previous Workbench V2 SHA
- final Review Fix SHA
- tests / checks
- push
- blocker

并确认：无真实 Prod 写入、无真实 Prod PAT、无 Test/Prod 业务代码修改、未 merge main。
