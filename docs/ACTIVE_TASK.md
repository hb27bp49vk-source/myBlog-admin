# ACTIVE TASK — myBlog Admin

## Status
Awaiting Human Acceptance

## 最近完成
- Admin 内容协议与安全发布设计已完成并合并 main。
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- Admin Phase B 实现与 Review Fix 已完成并通过 ChatGPT Review。
- Phase B 已 fast-forward 合并到 main。
- 当前 Admin main 业务实现 SHA：`5faeb47f104b8770adc0cb82cfb6795734f37d35`。

设计依据：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

完整 Plan：
`docs/plans/2026-09-10-admin-phase-b-test-content-maintenance.md`

## 当前任务
执行 Admin Phase B 的人工验收：实际使用 Admin 页面连接 `myBlog-test`，验证 Test 内容维护流程是否可用。

## 人工验收范围
1. 打开当前 Admin 页面，确认页面明确标识为 Test / 测试站内容维护。
2. 使用仅限 `myBlog-test`、`Contents: Read and write` 的 Fine-grained PAT 连接 Test。
3. 验证能成功读取当前真实 `myBlog-test/content.json`，包括既有 legacy `YYYY.MM.DD` 日期内容。
4. 新建一条低风险测试内容，确认：
   - 自动生成稳定 `<kind>_<ULID>` ID；
   - 日期写入为 `YYYY-MM-DD`；
   - 发布后显示 commit SHA、content blob SHA、item ID；
   - Test 页面能看到并正确渲染该内容。
5. 编辑刚创建的测试条目，确认稳定 ID 不变，修改能正确写回并在 Test 页面生效。
6. 不执行任何 Prod 写入或提升；Phase B 仍不存在 Prod 发布入口。
7. 图片写入保持禁用，本轮不验收图片上传。
8. PAT 不应默认持久保存在 localStorage/sessionStorage；刷新页面后需要重新输入是预期行为。

## 验收失败处理
若任一步骤失败：停止，不开始 Phase C。记录失败步骤、页面现象与必要截图，交由 ChatGPT 判断是否需要 Review Fix。

## 验收通过后的门禁
只有用户确认上述人工验收通过后，Phase B 才算正式完成；随后再更新治理状态并讨论 Phase C 安全 Prod Publisher。
