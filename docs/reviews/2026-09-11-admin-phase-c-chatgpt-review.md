# Admin Phase C — ChatGPT Review

日期：2026-09-11
Review 对象：`723504310ade284f70ad15bb21a12557638529a5`
基线：`385a5e384a8ad3be5542c7a697d4b55f9b4fae21`
结论：**FAIL — 需要 Review Fixes，暂不得进入 User Acceptance，更不得真实 Prod 发布。**

## Blocker 1 — Prod content blob 未绑定到已核验的 Prod baseline commit

当前 publisher 仅核验 `Prod main HEAD == prodBaselineCommitSha`，随后直接按 release plan 里的 `prodContentBlobSha` 读取 blob；没有证明该 blob 就是该 baseline commit 的 `content.json`。

这意味着一个被篡改、手工编辑或陈旧的 release plan 可以把“当前 baseline SHA”与“旧 content blob SHA”组合起来。publisher 会从旧 blob 构建新的 `content.json`，从而可能丢失当前 Prod 中未选择的内容，违反：

- 不整份覆盖 Prod；
- 未选 Prod 内容保持不变；
- baseline 必须与 content blob 成对核验；
- baseline 冲突时 STOP。

### 必须修复

执行器在任何写入前必须：

1. 从 `prodBaselineCommitSha` 对应 commit/tree 中解析 `content.json` 的真实 blob SHA；
2. 要求真实 blob SHA **严格等于** plan 的 `prodContentBlobSha`；
3. 不一致立即 `STOP`，不得创建 tree/commit/ref update；
4. 后续构建 Prod 文档必须基于这个已绑定验证的 blob。

## Blocker 2 — release plan 关键语义字段未在 publisher 侧重新验证

当前 `planHash` 只是 release plan 自身内容的自校验，不是授权签名。publisher 仍必须独立校验关键安全语义。

至少需要补齐：

- `sourceTestCommitSha` 为合法 40 位 SHA；
- `testAcceptance.commitSha === sourceTestCommitSha`；
- `testAcceptance.url` 非空且为预期 Test Pages URL 边界；
- `testAcceptance.confirmedAtUtc` 非空/合法；
- `operator` 非空；
- `selectedEntries[]` 的 `kind/id/sourceHash/targetBeforeHash` 结构与 hash 格式；
- 对 baseline 中已存在的目标条目重新计算并核对 `targetBeforeHash`；不存在时只允许 `null`；
- `releaseId` 必须完整符合既定 timestamp + ULID + planHash 前 8 位格式，而不仅仅是 `endsWith`。

任何不一致必须 STOP，且发生在 Git tree / commit / ref 写请求之前。

## Blocker 3 — 图片“禁止覆盖无关现有资产”尚未完整实现

当前实现验证 Test 源图片 hash，并直接把同一路径写入新 tree；但没有检查 Prod baseline 中目标图片路径若已存在，其现有内容是否与该 content-addressed hash 一致。

必须：

- 若目标路径在 Prod baseline 不存在：允许新增；
- 若已存在：读取/验证现有内容 hash 与路径中的 SHA-256 一致，且与 source image 一致；
- 若路径已存在但内容不一致：STOP，不得覆盖。

## 测试缺口 — 当前测试不足以证明 Plan 要求的安全行为

当前新增测试主要是 release-plan helper 与源码边界字符串检查。Implementation Plan 要求的以下行为尚未被真实行为测试覆盖：

- 多条目的选择性提升；
- 未选 Prod 条目完整保持；
- Test 缺失不触发删除；
- baseline 改变时 STOP 且 **没有任何写请求**；
- `prodContentBlobSha` 与 baseline commit 不匹配时 STOP 且无写请求；
- 图片成功路径；
- 图片缺失 STOP；
- 图片 hash 冲突 STOP；
- Prod 已存在同路径但内容冲突时 STOP；
- `targetBeforeHash` 不匹配时 STOP；
- Test acceptance SHA 与 source SHA 不一致时 STOP。

应将 publisher 拆成可测试模块或通过 mock fetch / fake GitHub API 做行为测试，不能只靠源码字符串断言。

## Review 通过条件

1. 上述 3 个 blocker 全部修复；
2. 对应负向测试证明：失败发生在任何 Prod 写请求之前；
3. Phase B 回归继续通过；
4. 不使用真实 Prod PAT；
5. 不真实写 Prod；
6. 不修改 myBlog-test / myBlog-prod 业务代码；
7. fix commit 推送到同一 implementation branch 后重新 STOP 在 `Awaiting ChatGPT Review`。
