# Admin Phase C — User Acceptance

日期：2026-09-11
验收对象：Phase C 安全 Prod Publisher（Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` 及后续 Review / Acceptance Fix 提交）
当前结论：**第二轮 User Acceptance 仍 FAIL（Visual UX）—— 第一轮可用性问题已明显改善，但整体排版仍不够成熟，不适合直接作为长期日常发布界面。**

## 已通过的人工验收点

1. Admin 本地页面可正常启动并返回 HTTP 200。
2. Phase C 区域正常出现。
3. 在 Phase B 已读取 Test `content.json` 后，Phase C 可以读取公开 Prod baseline。
4. 未使用、展示或要求真实 Prod PAT；未执行真实 Prod 写入。
5. 第一轮 Acceptance Fix 后，内容卡片已能显示标题/主文本、类型、日期、稳定 ID、摘要/正文预览。
6. 已实现 `新增 / 更新 / 无变化` 差异状态与“仅显示有差异内容”过滤。
7. Phase C 前置步骤和当前操作提示已比第一版清晰。

## 第一轮 Acceptance Fix 结论

第一轮主要解决“看不懂、点不准、流程不清楚”的可用性 blocker；Acceptance Fix commit `b791679391126d6c49700073806e661e54179451` 已通过 ChatGPT Review。

第二轮人工验收截图确认：功能结构已明显改善，但视觉层级、密度、横向空间利用和整体一致性仍不足，因此继续进入一轮 **Visual Polish Acceptance Fixes**。

## 第二轮 Acceptance Fix 1 — Phase C 内容列表不要使用当前三列密集卡片墙

当前桌面宽屏下，Phase C 内容卡片自动铺成三列。问题：

- 标题换行频繁，阅读节奏碎；
- 稳定 ID 很长，占据大量视觉注意力；
- `新增` badge 与标题挤在一起；
- 三列同时展示正文摘要，信息密度过高；
- 用户做“选哪些内容发布”的核心动作时，视线需要左右跳跃，扫描效率低。

建议改为更适合发布清单的布局，优先：

- 桌面端默认 **单列或最多双列**，不要三列；
- 每条保持紧凑横向结构；
- 主视觉顺序：checkbox → 标题 → 状态 badge；
- 第二行显示 `类型 · 日期`；
- 稳定 ID 放到更弱的 tertiary/meta 样式，允许缩小、截断或单独一行；
- 摘要最多 1–2 行并限制高度，不要把所有正文预览完全展开；
- 卡片之间保持清晰但不要过度留白。

目标：用户第一眼先看“是什么内容”和“新增/更新”，技术 ID 只是辅助信息。

## 第二轮 Acceptance Fix 2 — Phase B 右侧内容列表整体过窄、页面左右失衡

人工验收截图中，上方 Phase B 的右侧内容列表形成一条很窄的纵向栏，左侧编辑区下方出现大片空白；每个条目的“编辑”按钮被挤成狭窄竖向视觉，导致整页明显头重脚轻、左右失衡。

本轮允许做 **纯布局层面的 Phase B polish**，但不得改变 Phase B 数据/写入逻辑：

- 调整 desktop workspace grid 的列宽比例，使右侧列表不再窄成细栏；
- 编辑按钮保持正常横向按钮宽度，不出现文字竖排/极窄状态；
- 内容标题区域有合理宽度；
- 右侧列表与左侧编辑区在桌面宽度下视觉平衡；
- 避免右侧列表无限变窄；必要时设置合理 `min-width` / grid 最小值；
- 不改变 Phase B 功能、数据协议、Test-only 写入边界。

## 第二轮 Acceptance Fix 3 — 统一页面视觉层级

Phase C 当前“基线 SHA / 过滤器 / 卡片 / 表单 / release plan / token”全部连续堆叠，虽然功能完整，但层级感不足。

建议：

- 将 Phase C 按功能分成 3 个视觉分区：
  1. `读取与差异`；
  2. `人工验收与 release plan`；
  3. `受控提交`；
- 用小标题、弱背景/边框或 spacing 区分，不新增复杂框架；
- `Prod main 基线` 作为技术信息弱化，不要抢主视觉；
- 过滤器放在内容列表标题附近；
- release plan 大 textarea 与操作员 token 不要视觉上紧贴内容选择区域。

## 第二轮 Acceptance Fix 4 — 状态 badge 与元信息降噪

- `新增 / 更新 / 无变化` badge 保留，但尺寸、位置应稳定，不要夹在标题文字中造成跳动；
- stable ID 使用 monospace + muted，小一号；
- article/note/topic 类型信息不要与标题竞争；
- 摘要文本颜色弱于标题；
- 卡片 hover/selected 状态可以更明确，但不要使用强烈视觉效果。

## 第二轮 Acceptance Fix 5 — 响应式与桌面宽屏验收

当前重点是桌面浏览器使用。必须保证：

- 约 1440–1800 px 宽度时，不出现三列过密卡片墙；
- Phase B 右侧列表不窄成竖条；
- checkbox、标题、badge、按钮不会互相挤压；
- 900 px 以下再按响应式规则自然堆叠；
- 不依赖固定像素宽度造成超宽/窄屏破版。

## 保持不变的安全与功能边界

本轮是 **Visual Polish**，不得借机改变已经 Review PASS 的 C1–C9 安全模型，也不得改变 Phase B 写入逻辑。

继续禁止：

- 真实 Prod 写入；
- 使用/要求真实 Prod PAT 进行开发或验收测试；
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- 绕过 baseline、planHash、target-before、图片 hash、GitHub Environment approval 等安全检查；
- 引入删除语义；
- merge implementation branch 到 main。

## 测试要求

1. 原有 Phase B 回归测试继续通过；
2. 原有 Phase C safety / publisher mock / diff 分类测试继续通过；
3. 纯 CSS polish 不要求为每个样式写单测，但任何新增 JS 行为必须有测试；
4. `git diff --check` 通过；
5. 修复提交 push 到同一 `codex/admin-phase-c-implementation` 分支后 STOP 在 `Awaiting ChatGPT Review`。

## 第二轮修复后验收目标

用户应能在桌面浏览器中快速完成：看内容 → 判断新增/更新 → 勾选 → 填写验收信息，而不被稳定 ID、三列卡片墙或过窄侧栏干扰。页面整体应像一个长期可用的个人发布工具，而不是调试/工程内部页面。
