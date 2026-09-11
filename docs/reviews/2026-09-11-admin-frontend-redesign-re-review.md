# myBlog Admin — Frontend Redesign Re-review

日期：2026-09-11
首次 Re-review 对象：`776a1030fc994ca365b6671bf5e653da2b505abb`
最终 Test Fix：`1f9fd7688e288cf007791df8ecbda7c609d78126`
最终结论：**PASS — Frontend Redesign 可进入 User Acceptance。**

## 已确认通过

1. 全局 `<title>`、Header、副标题与环境 badge 已修正为双工作模式语义，不再把整个 Admin 错误描述成“仅 Test 内容维护”。
2. `libraryRows()` 已抽出为可测试 helper，真实覆盖：标题/摘要/正文/稳定 ID 搜索、类型过滤、日期倒序。
3. `modeVisibility()` / `switchMode()` 已用于真实 Test / Prod 模式切换。
4. Test Fix `1f9fd7688e288cf007791df8ecbda7c609d78126` 已修复此前 state 保留测试的假阳性。
5. 行为测试现在直接给真实导出的 `admin.state.document` 与 `admin.state.blobSha` 设置测试值，执行 prod → test 模式切换，并断言真实 state 保持不变，同时断言 Test / Prod 可见状态正确。
6. 未发现本轮修改改变 Phase B Test-only 写入逻辑、content schema / stable ID 或 Phase C C1–C9 安全模型。
7. Executor 报告 Frontend workbench behavior、Phase B、Phase C plan safety、boundary、publisher mock、差异分类/过滤、review boundary 全部通过，`git diff --check` 通过。

## 最终 Review 说明

此前唯一 blocker 是 `tests/frontend-redesign.test.js` 使用与真实 Admin state 无关的普通本地对象，导致 state 保留测试存在假阳性。

Test Fix 后，测试现在实际执行：

- 给 `admin.state.document` 赋值为测试文档；
- 给 `admin.state.blobSha` 赋值为测试 baseline；
- 调用真实 `switchMode('prod', nodes)`；
- 验证 Test 隐藏、Prod 显示；
- 验证真实 `admin.state.document` / `blobSha` 未变化；
- 再切回 Test 并重复验证。

因此此前唯一测试质量 blocker 已关闭。

## User Acceptance 边界

当前允许进入桌面人工验收，重点验证：

1. `内容维护（Test）` 与 `发布到 Prod` 两个工作模式是否一眼可理解；
2. Test 内容库搜索、类型过滤、日期排序、整行选择编辑是否实际好用；
3. master-detail 布局在约 1440–1800 px 桌面浏览器中是否自然；
4. 编辑器与内容库是否不再出现大片无效空白或窄栏；
5. 切换 Test / Prod 后已加载 Test 数据与 baseline 不丢失；
6. Phase C 受控发布流程仍清晰，浏览器不出现 Prod PAT；
7. 不真实批准/执行 Prod 写入。

在用户明确验收通过前，不得 merge main，不得执行第一次真实 Prod 发布。
