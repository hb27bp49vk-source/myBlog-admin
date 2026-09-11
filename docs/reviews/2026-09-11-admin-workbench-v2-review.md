# myBlog Admin — Workbench V2 Review

日期：2026-09-11
Review 对象：`fc97e1abeb3766c354745d03d53234ab84e9e904`
结论：**FAIL — 主体方向正确，但尚未达到 Workbench V2 Plan 的实现/测试要求。进入 Review Fixes。**

## 已确认通过

1. 一级导航已收敛为 `文章 / 短记 / 发布`，`专题` 不再作为一级导航。
2. 文章分类筛选已加入 `project / ai / life`。
3. Prod 仍通过独立发布入口进入，未把 Prod 变成普通编辑环境。
4. 保持原生 HTML/CSS/JS，没有新增框架、build system 或 CDN 运行时依赖。
5. 未发现本轮修改触碰 Phase B Test-only 写入或 Phase C C1–C9 安全发布模型。

## Blocker 1 — 右侧主编辑区没有实现 Plan 要求的编辑 / 预览 / 元数据三态

Workbench V2 Plan 明确要求：

- 默认显示“编辑”；
- 提供“编辑 / 预览 / 元数据”；
- 分屏仅作为按需能力，不得默认双栏；
- stable ID 等技术信息应进入“元数据”区，不持续占据主视觉。

当前 `index.html` 仍是旧式表单：稳定 ID、日期、分类、文章类型、阅读时长等字段长期直接铺在编辑器顶部；没有 `编辑 / 预览 / 元数据` tab / view 控件，也没有独立元数据视图。

因此右侧主编辑区没有完成 V2 的核心信息架构。

## Blocker 2 — `专题` 仍暴露在高频编辑表单

Plan 允许保留底层 topic 兼容数据，但 UI 不应继续把它当高频内容入口。

当前 `内容类型` select 仍直接提供 `专题`，同时 `专题标题 / 状态` 字段仍作为主编辑表单的一部分存在。

本轮不要求删除 topic schema / 历史数据，但新建/日常编辑 UI 应至少默认只面向文章/短记；如确需保留 topic 兼容编辑，应降级到非高频/兼容入口，不能继续与文章/短记平级暴露。

## Blocker 3 — Workbench V2 新增测试覆盖明显不足

Plan 与 ACTIVE_TASK 要求新增行为测试至少覆盖：

- 文章 / 短记 / 发布导航；
- project / ai / life 分类筛选；
- 搜索 / 日期倒序；
- 列表选中进入编辑；
- 编辑 / 预览 / 元数据切换；
- Test state / baseline 在页面模式切换后保留；
- 响应式布局关键断点 contract。

当前 `tests/frontend-redesign.test.js` 实际只覆盖：

- 搜索；
- 类型过滤；
- project 分类过滤；
- 日期倒序；
- test/prod modeVisibility + state 保留。

它没有验证：

- 文章 / 短记 / 发布导航行为；
- 列表选中进入真实编辑状态；
- 编辑 / 预览 / 元数据切换；
- 1366×768 / 1440×810 / 1536×864 / 1920×1080 的布局 contract。

因此即使现有测试 PASS，也不足以证明 Workbench V2 已按 Plan 完成。

## Review Fix 要求

只修 Workbench V2 未完成项，不扩大到新的产品设计：

1. 实现右侧 `编辑 / 预览 / 元数据` 三态：
   - 默认编辑；
   - 预览为独立视图；
   - 元数据承载 stable ID、日期、分类、type、reading 等技术/辅助字段；
   - 如保留分屏，必须是显式按需开启。
2. 将 `专题` 从高频新建/编辑路径降级：
   - 不删除 schema / 历史兼容；
   - 默认一级导航、新建入口、日常编辑路径只面向文章 / 短记；
   - 若保留 topic 兼容编辑，放到弱化兼容入口。
3. 补真实行为测试，覆盖导航、列表选中、三态切换、state 保留与关键 16:9 布局 contract。
4. 保持 Phase B / Phase C 全部现有回归通过，`git diff --check` 通过。

## 保持不变的边界

不得改变：

- Phase B Test-only 写入；
- content schema / stable ID；
- Phase B 图片禁用；
- Phase C C1–C9；
- Prod PAT 不进入浏览器；
- release plan / publisher / baseline / hash / Environment approval 语义；
- 不真实写 Prod；
- 不修改 myBlog-test / myBlog-prod 业务代码；
- 不 merge main。

完成 Review Fix commit + push 后，STOP 在 `Awaiting ChatGPT Review`。
