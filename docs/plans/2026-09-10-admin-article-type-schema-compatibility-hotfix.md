# Admin article.type Schema 兼容性 Hotfix

日期：2026-09-10
状态：Completed

## 问题

`myBlog-test/content.json` 的 `article.type` 是必填的非空展示型文本，例如“项目复盘”和“AI 实验”。Admin 额外把该字段限制为固定字面值 `article`，导致合法 Test 内容无法读取。

## 修复范围

- 删除 Admin 对 `article.type === "article"` 的额外限制。
- 保留 `type` 必填且必须为非空字符串的协议要求。
- 增加展示型值通过、空值失败和缺失字段失败的回归测试。
- 不修改 `myBlog-test/content.json`，不改变稳定 ID、category、date、图片 Phase B 限制、GitHub API 写入流程或 Test-only 发布目标。
- 本 Hotfix 独立于 Admin Phase C，不实现或推进 Prod Publisher。

## 项目级兼容规则

Admin validator 必须遵循 Test content schema；不得自行把展示型字段收紧成未在协议中定义的固定枚举。
