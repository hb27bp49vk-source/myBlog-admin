# myBlog Admin Phase C — 安全 Prod Publisher

日期：2026-09-10
状态：Ready for Codex

## 前提
- myBlog-test / myBlog-prod 内容协议 Phase A 已完成并通过人工验收。
- myBlog-admin Phase B：Test 内容维护能力已完成、合并 main，并通过用户人工验收。
- 设计依据：`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`。

## 本阶段目标
实现受控的 **Test → Prod 选择性内容提升**，只允许把已经明确验收过的 Test 内容按稳定 ID 提升到 Prod，同时严格保护 Prod 现有未选内容、基线和凭据边界。

本阶段不允许退化成“浏览器拿一个 Prod PAT，直接整份 PUT content.json”的方案。

## 核心安全模型
1. 选择性提升：只处理用户明确选择的稳定 ID；未选择的 Prod 条目保持不变。
2. 无隐式删除：Test 中不存在绝不代表应删除 Prod；删除必须是单独、显式、更强确认的动作。
3. 不可变发布计划：准备阶段记录确定的 Test 验收 SHA、Prod 基线 SHA、目标条目 ID、内容哈希、差异和图片依赖。
4. 提交前再次核验 Prod HEAD / content.json blob SHA；若与准备时不一致，进入 conflict 并停止，必须重新读取和 Review。
5. Prod 提升必须产生明确发布证据，至少记录 releaseId、Test 验收 SHA、Prod old/new HEAD、old/new content blob SHA、选中 ID、差异摘要、结果和时间；证据不得含 PAT/Cookie/Authorization。
6. 禁止 force push、历史重写和覆盖未选 Prod 内容。

## 实现边界
### A. Admin 侧允许实现
- 从 Test 读取当前 `content.json` 候选内容。
- 从 Prod 只读读取当前 `content.json` 与 HEAD，生成差异预览。
- 用户按稳定 ID 选择要提升的 article / note / topic。
- 显示新增 / 修改 / 保持不变的清晰摘要。
- 生成不可变 release plan，并在最终提交前再次核验 Prod 基线。
- 提升成功后展示并保存非机密发布证据。

### B. Prod 写入实现要求
优先采用设计中的受控发布器模型：
- Prod 凭据不得暴露给前端页面；
- 推荐服务端或等价受控执行边界保存仅限 `myBlog-prod` 的 Fine-grained 凭据；
- 权限仅 `Contents: Read and write`；
- 写入路径使用白名单；
- 以准备时的 Prod HEAD 为父提交创建新 commit；
- ref 更新必须非强制；
- 基线不一致即失败，不允许继续覆盖。

如果当前项目/部署条件无法提供这样的受控执行边界，则 **Phase C 不得实现可用的 Prod 一键发布按钮**。此时应实现到“选择 + 差异预览 + 不可变 release plan + 导出/交接给受控发布器”的安全边界，并明确标记 Prod 提升仍禁用，不得用浏览器 Contents API 直接替代。

## 图片
当前 Phase B 图片写入为禁用。Phase C 不得因为内容提升而放宽图片安全标准。
- 若选中条目没有新的图片依赖，可允许仅内容提升。
- 若存在新图片依赖，则只有在能满足设计中的哈希路径、依赖重算、目标文件白名单和同一原子 commit 时才允许提升。
- 无法原子保证时，该 release plan 必须停止，不得出现“content.json 已成功、图片失败”的正常完成状态。

## 删除
本阶段默认 **不实现删除提升**。
若未来需要删除：
- 必须独立 Plan；
- 明确列出稳定 ID、Prod 旧哈希、理由；
- 使用更强确认；
- 仍需 Prod 基线复核。
不得把“Test 中不存在”解释为删除。

## 凭据与权限
- Test 与 Prod 凭据/会话必须分离。
- 不得把 Prod token 放入前端 JavaScript、localStorage、sessionStorage、DOM 持久记录、console、日志、Git 内容或发布证据。
- 不推荐 classic `repo` token。
- 不得使用同一个宽权限 token 同时管理全部项目。

## 必须验证
至少覆盖：
1. 只允许选择稳定 ID；未知/重复 ID 拒绝。
2. Prod 未选条目逐字保持不变。
3. 新增与修改差异正确；Test 缺失不会触发删除。
4. release plan 绑定明确 Test SHA 与 Prod baseline SHA。
5. Prod baseline 改变时停止，禁止继续提交。
6. 无 force push / overwrite / reset / history rewrite 路径。
7. 无浏览器持久化 Prod PAT。
8. 无 Prod 整份覆盖逻辑。
9. 若图片依赖存在但无法安全原子提交，则 release 被阻止。
10. 发布证据不含敏感凭据。
11. `node --check` / 单元或 mock 测试 / `git diff --check` 通过。

## 明确禁止
- 不允许把 Phase B 的 Test 浏览器 Contents API 模式直接复制给 Prod。
- 不允许整个 Test `content.json` 覆盖 Prod。
- 不允许自动同步 Test 全部内容到 Prod。
- 不允许根据数组索引提升。
- 不允许隐式删除。
- 不允许修改 myBlog-test / myBlog-prod 业务代码。
- 不允许使用真实 Prod PAT 做自动化测试。
- 不允许无关 UI 重构、文件拆分或架构扩张。

## 分支
`codex/admin-phase-c-safe-prod-publisher`

## 完成后
Codex 完成实现与验证后：
- commit + push 到上述分支；
- 停止；
- 不要 merge main；
- 等待 ChatGPT GitHub Review。

## 必须报告
- 分支、base SHA、最终 commit SHA、修改文件
- 选择性提升模型
- Test 验收 SHA / Prod baseline 绑定方式
- Prod 基线冲突停止方式
- 未选 Prod 内容保持方式
- 图片最终边界
- 凭据/权限实现
- 发布证据格式
- 测试结果
- push / 工作区状态
- 明确确认未整份覆盖 Prod、未隐式删除、未修改 Test/Prod 业务代码、未使用真实 Prod PAT、未 merge main
