# Admin Phase C — User Acceptance

日期：2026-09-11
验收对象：Phase C 安全 Prod Publisher（Review Fix commit `4437d35651ff6a01226eb725aeb07af05dff594c` 及后续 Review 治理提交）
结论：**FAIL — 核心安全 Review 已通过，但当前 UI/UX 不满足实际人工发布操作要求。进入 Acceptance Fixes。**

## 已通过的人工验收点

1. Admin 本地页面可正常启动并返回 HTTP 200。
2. Phase C 区域正常出现。
3. 在 Phase B 已读取 Test `content.json` 后，Phase C 可以读取公开 Prod baseline。
4. 未使用、展示或要求真实 Prod PAT；未执行真实 Prod 写入。

## Acceptance Fix 1 — 内容选择必须面向人，而不是只显示稳定 ID

当前内容列表主要显示类似 `article / article_01J...` 的技术信息。用户无法可靠判断正在选择哪一篇内容，存在误选风险。

必须改为紧凑、可读的内容卡片/行，每项至少显示：

- checkbox，且与对应内容视觉上紧密绑定；
- 内容标题或可理解的主显示文本；
- 类型；
- 日期（数据存在时）；
- 稳定 ID（作为次要技术信息）；
- 简短摘要/正文预览（数据存在时）。

整项应有明确的点击/选中关系，不允许 checkbox 与内容文字横跨页面分离。

## Acceptance Fix 2 — 显示 Test → Prod 差异状态

用户在真正发布时需要知道条目为什么值得提升。读取 Prod baseline 后，对每个 Test 条目计算并显示：

- `新增`：Prod 不存在该稳定 ID；
- `更新`：Prod 存在该稳定 ID，但内容 hash 与 Test 不同；
- `无变化`：Prod 存在且内容 hash 相同。

提供“仅显示有差异内容”的过滤能力，默认行为可由实现选择，但必须清晰且不改变 release plan 的安全语义。

不得把 Test 中不存在的内容解释为删除；Phase C C9 删除边界保持不变。

## Acceptance Fix 3 — 明确发布步骤与前置条件

Phase C 顶部应以用户能理解的方式明确当前流程，例如：

1. 读取 Test 内容；
2. 读取 Prod 基线；
3. 选择要提升的内容；
4. 填写/确认 Test Pages 人工验收信息；
5. 生成并复核 release plan；
6. 提交受控发布会话（真实写入仍受 GitHub Environment approval 控制）。

尤其必须明确：“读取 Prod 基线”依赖 Phase B 已成功读取 Test 内容。

## Acceptance Fix 4 — 状态/错误反馈必须出现在当前操作附近

人工验收时，在尚未读取 Test 内容的情况下点击“读取 Prod 基线”，代码虽产生了错误信息，但用户在当前视口看不到，表现为“点了没反应”。

必须让成功、等待、错误状态在相关按钮/当前操作附近明显显示，或自动滚动/聚焦到可见提示。不能让关键错误只出现在远离当前操作的位置。

## Acceptance Fix 5 — 修正表单布局

当前人工 Test 页面验收 checkbox 与其文字明显分离，内容选择 checkbox 也与条目文字距离过大。

必须修正 Phase C 表单布局：

- checkbox 与 label 紧邻；
- 表单字段保持一致的纵向节奏；
- 内容列表紧凑，不以大面积空白分隔每条；
- 桌面浏览器常规宽度下无需依靠猜测来判断控件归属。

## 保持不变的安全边界

本轮只允许 Acceptance UX Fix，不得借机改变已经 Review PASS 的 C1–C9 安全模型。

继续禁止：

- 真实 Prod 写入；
- 使用/要求真实 Prod PAT 进行开发或验收测试；
- 修改 myBlog-test / myBlog-prod 业务代码或内容协议；
- 绕过 baseline、planHash、target-before、图片 hash、GitHub Environment approval 等安全检查；
- 引入删除语义；
- merge implementation branch 到 main。

## 测试要求

1. 原有 Phase B 回归测试继续通过；
2. 原有 Phase C safety / publisher mock 行为测试继续通过；
3. 为新增的差异分类/过滤等非纯 CSS 行为增加测试；
4. 保持 `git diff --check` 通过；
5. 修复提交 push 到同一 `codex/admin-phase-c-implementation` 分支后 STOP 在 `Awaiting ChatGPT Review`。

## 修复后验收目标

用户无需理解稳定 ID 即可明确选择要发布的内容；能够一眼区分新增/更新/无变化；能够理解当前处于发布流程哪一步；按钮失败时能立即看到原因；同时不降低任何已经通过 Review 的安全边界。
