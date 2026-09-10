# myBlog Admin Phase B — Test 内容维护

日期：2026-09-10
状态：Ready for Codex

## 前提
- Admin 内容协议与安全发布设计已完成并合并。
- myBlog-test 与 myBlog-prod 的内容协议 Phase A 已完成并通过人工验收。
- 两个前台环境均已具备 `content.json`、稳定 ID、旧链接兼容和 legacy `content.js` 回退能力。

## 本阶段目标
把独立 `myBlog-admin` 从旧的 `content.js` 写入模型迁移到 **只面向 Test 的 `content.json` 内容维护能力**。

本阶段只允许维护 Test 内容，不实现、不恢复 Prod 内容提升。

## 必须实现
1. Admin 读取 Test 仓库根目录 `content.json`，严格识别 `schemaVersion: 1`。
2. 文章、短记、专题的新建/编辑使用设计文档定义的字段协议和稳定 ID。
3. 新建条目生成不可变 `<kind>_<ULID>`；编辑不得改变已有 ID。
4. 写入前严格校验必填字段、允许字段、日期、分类、重复 ID、空值等；不得使用 `eval` / `Function` 解析内容。
5. Test 写入必须带当前 `content.json` blob SHA 做冲突保护；远端基线变化时停止并要求重新加载，不允许覆盖。
6. Test 写入成功后明确显示/记录 commit SHA、content blob SHA、条目 ID；不得仅凭 HTTP 成功宣称发布完成。
7. 页面文案必须明确这是“写入 Test / 测试站”，不得让用户误以为已发布正式站。
8. 保持代码发布与内容发布分离；Admin 不修改 Test HTML/CSS/JS/配置。

## 图片边界
Phase B 可以实现 Test 图片上传，但必须遵守设计协议：
- 仅 `assets/uploads/<content-id>/...`
- 路径与内容 ID 绑定
- 文件名应基于内容哈希和安全文件名
- `imageRefs` 必须由正文/封面实际引用重新计算，不能信任客户端手填
- 写入顺序必须避免“内容已引用但图片不存在”的正常完成状态

若在当前纯浏览器 Contents API 架构下无法可靠满足上述图片一致性，则本阶段宁可先禁用图片写入并清楚提示，也不得实现不安全的半完成流程。

## 明确禁止
- 不读取、写入或提升 Prod 内容。
- 不实现 Test→Prod 一键发布。
- 不把 Test 整份内容覆盖 Prod。
- 不修改 myBlog-test / myBlog-prod 的业务代码。
- 不迁移或复用 myBlog-test 历史 `admin/`。
- 不把真实 PAT 写入仓库、日志、发布证据或测试数据。
- 不做与本阶段无关的 UI 重构或文件拆分。

## 凭据边界
当前浏览器直连 GitHub 的 Test 写入若继续使用用户输入 token：
- UI 必须明确要求仅限 `myBlog-test` 的 Fine-grained PAT，最低必要权限 `Contents: Read and write`。
- 不推荐 classic `repo` token。
- 不得把 token 输出到 console、DOM 持久记录、Git 内容或发布证据。
- 若现有代码默认长期明文保存 token，应在本阶段至少改为默认不持久保存；任何“记住凭据”能力必须单独 Review，不得顺手保留旧不安全行为。

## 验证要求
- 静态语法检查通过。
- 使用 mock/fixture 或非真实凭据验证 `content.json` 读取、校验、创建、编辑、SHA 冲突停止。
- 验证新 ID 格式和编辑 ID 不变。
- 验证未知字段/重复 ID/非法日期/非法分类被拒绝。
- 验证不会请求 Prod 写接口或修改 Prod 仓库。
- `git diff --check` 通过。
- 若有浏览器验证，报告具体页面和操作，但不要使用真实 PAT 做自动化测试。

## 分支
`codex/admin-phase-b-test-content-maintenance`

完成后 commit + push 分支并停止，等待 ChatGPT Review；不要合并 main。

## 后续门禁
Phase B 经 ChatGPT Review、合并 Admin main，并由用户实际在 Admin 页面完成 Test 内容维护人工验收后，才讨论 Phase C 安全 Prod Publisher。