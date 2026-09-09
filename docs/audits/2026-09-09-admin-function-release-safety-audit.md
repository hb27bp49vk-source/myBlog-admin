# myBlog-admin 功能、结构与内容发布安全审计

日期：2026-09-09
范围：独立 `myBlog-admin` 的静态代码；未使用真实 PAT，未向 Test/Prod 发出写请求。

## 结论

结论为 **专项重构**，不建议把当前实现作为唯一内容维护入口后直接承担真实发布。问题不在文件是否拆分：`admin.js` 约 247 行，继续保持单文件是合理的；必须先重做内容协议适配与 Test→Prod 发布边界，再讨论界面或模块整理。

当前界面已经提供 Token 输入、简化 Markdown 预览、图片上传、向 Test 新增内容、Test 列表和提升按钮；但它与当前 Test `content.js` 的实际数据结构不兼容，并且提升会整份覆盖 Prod 内容。两项都足以阻断真实内容发布。

## 审计方法与证据

- 阅读本仓库 `index.html`、`admin.css`、`admin.js`、`README.md`，并执行 `node --check admin.js`。
- 只读检查当前 `myBlog-test/content.js` 的对象结构，以及历史 `myBlog-test/admin/` 的 `README.md`、`PUBLISH_API.md`、`index.html`、`admin.js`；未运行历史维护台，也未改变其 Git 配置。
- 执行 `git diff --check`；审计写入前任务分支没有业务代码改动。

## 功能与协议审计

### PAT 与 GitHub 请求

`getToken()` / `saveToken()` 将 PAT 以明文放在 `localStorage`，初始化时回填到密码框；所有 GitHub 请求均直接附带 `Authorization: Bearer`。Token 没有写入仓库，也没有第三方后端传输，这是现有方案的正面边界；但公开 Pages 上的持久化明文 Token 可被同源脚本、共享设备或浏览器资料读取，且没有删除 Token、权限验证、有效期提示或最小权限校验。

README 要求经典 `repo` 权限，同时仅以文字建议 Fine-grained Token；这与最小权限目标不一致。若保留浏览器直连方案，应只引导选择两个仓库、`Contents: Read and write` 的 Fine-grained Token，并提供明确的本机清除入口。更重要的是，未来服务化不得沿用 `localStorage` 传递发布凭据。

`ghGet()` / `ghPutRaw()` 对单文件 `content.js` 写入会携带刚读取的 SHA，因此 GitHub 可拒绝同一文件的并发更新；但没有将 Test 已验收版本、Prod 基线 SHA 或提交记录绑定为一次提升的前置条件。

### Markdown 预览

渲染器先 HTML 转义正文，再生成有限的标题、粗斜体、代码、列表、引用、链接和图片标签；`safeUrl()` 拒绝 `javascript:`、`vbscript:`、`data:`，链接还使用 `rel="noopener"`。这能降低直接脚本注入风险。

兼容性仍有限：不支持当前历史维护台说明中的表格、有序列表等 Markdown；链接/图片 URL 不是严格白名单；预览与前台实际渲染器并非同一实现。因此预览只能作为草稿辅助，不能替代 Test 实页核对。

### 图片上传与同步

上传会把图片缩为最长边 1200px、JPEG 质量 0.82，写入 Test 的 `assets/uploads/<时间戳-随机>.jpg`，并插入相对路径，路径边界正确地指向 Test。缺点是它无文件大小/MIME 解码后的限制、无取消/重试/孤儿文件提示，也会把透明 PNG、GIF/WebP 一律转为 JPEG。

提升时 `syncUploads()` 枚举 Test 全部上传目录，向 Prod 复制所有 Prod 不存在的文件。这不是“本次已验收内容引用的图片”集合：会把无关测试图片带到 Prod；若某图片上传已存在但内容不同，按路径去重会跳过；`ghList()` 在 401、403、500 等所有非成功状态都返回空数组，使图片同步可能被误判为成功。它也在 `content.js` 写入 Prod **之后** 执行，任一图片失败都会留下正文已发布、图片未齐的部分成功状态。

### Test 发布与当前 `content.js` 协议

当前 Test `content.js` 不是 JSON，而是带注释、单引号和 JavaScript 对象字面量的 `window.blogContent = {...};`。`parseContent()` 仅能 `JSON.parse()`，故在当前真实文件上会抛出异常，发布、列表和提升都无法正常读取内容。

即使解析器改为可读取，`publish()` 生成统一 `{ id, title, tags, body, date }`（文章另加空 `cover`）也不符合当前前台协议：

| 类型 | 当前 Test 字段 | 当前 Admin 写入的缺口 |
| --- | --- | --- |
| 文章 | `date,type,category,reading,title,summary,body,cover` | 缺 `type/category/reading/summary` |
| 短记 | `date,label,category,text` | 写入 `body/tags/id/title`，缺 `label/category/text` |
| 专题 | `title,status,date,text` | 写入 `body/tags/id`，缺 `status/text` |

因此不能把“PUT 成功”当作内容可用；短记和专题尤其会出现前台字段缺失。应先定义版本化内容协议，采用可安全解析的数据格式（例如单独 JSON 数据文件或受控 JS 序列化），并在写入前做类型级校验和前台契约测试。

## Test→Prod 提升专项判断

**整份 Test `content.js` 覆盖 Prod 不安全，必须停止作为默认提升方式。** `promote()` 读取完整 Test 数据后立即 `writeContent('prod', testData)`，只依赖一个浏览器 `confirm()`。它没有选择本次批准的条目、没有读取/比较 Prod 与验收时基线、没有显示差异或影响范围、没有强确认、没有备份/回滚提交记录，也没有在上传文件与内容间提供原子提交。

直接后果包括：

1. Test 独有样例、草稿或未验收条目会覆盖 Prod 独有内容。
2. Prod 在 Test 验收之后的合法更新会被静默替换；虽然写目标时会使用即时 SHA，但并未校验“这是验收过的 Prod 版本”。
3. `content.js` 成功、图片同步失败时会形成不可自动恢复的半成功发布，界面只显示“提升失败”。
4. 没有保留 Prod 旧 SHA/提交或反向操作；恢复依赖人工 GitHub 历史查找，且无法保证图片集合恢复一致。

最小修复不是给现有函数增加一次确认，而是专项重构提升协议：先记录 Test 验收提交和 Prod 基线 SHA；仅选择并展示批准条目及其图片依赖；服务端或受控发布器再次验证目标、差异和正式确认；以单次 Git tree/commit 写入 `content.js` 与所需图片，并使用非强制 ref 更新；成功后返回提交 SHA、发布清单和可回滚版本。若仍采用 GitHub Contents API，必须将“内容写入 + 图片同步”设计为可补偿的事务状态机，绝不能显示笼统成功。

## 失败、部分成功与回滚

- Test 发布：网络/API 失败会显示错误，单一 `content.js` 写入因 SHA 冲突可失败退出；没有保存草稿、重试或冲突解决界面。
- 图片上传：成功即远端 Test 写入；若之后用户不发布正文，会留下孤儿图片；无清理策略。
- 提升：没有阶段状态、幂等键、提交 SHA、重试策略、补偿操作或回滚入口。内容先于图片，故风险最高。
- 任何生产操作都只靠浏览器弹窗确认，不能证明操作者已完成 Test 页面核对。

## 历史 `myBlog-test/admin/` 对比（仅识别缺口）

历史维护台的 UI 有内容列表/编辑、草稿与状态、标题摘要日期、更多 Markdown 工具、显式目标选择和“正式发布”文字确认；其 `PUBLISH_API.md` 还定义了同源受会话保护的发布接口、仓库硬映射、服务端限定 Token、SHA 写入、提交/回滚记录与限流。这些是值得吸收的需求与安全约束。

但历史目录依赖 Gist、账号/口令和尚未在本独立仓库实现的同源发布服务，且其 UI 声称可直接选择 Production 上传图片；它不应复制或迁入本仓库。应以该合同为输入，在独立 Admin 中重新设计最小发布器，并先确认服务端授权边界。

## 风险分级与建议顺序

### P0

1. 当前 `parseContent()` 无法读取真实 Test `content.js`，且发布对象不符合文章/短记/专题协议。先冻结真实发布，完成版本化内容协议、解析/序列化和契约测试。
2. `promote()` 整份覆盖 Prod，未绑定 Test 验收版本或 Prod 基线，且无选择性提升、差异预览与回滚记录。专项重构发布协议。
3. `content.js` 先写、图片后同步且非原子，失败会产生部分成功。将内容与引用图片纳入同一受控提交，或实现可见、可补偿的发布状态机。

### P1

1. PAT 明文 `localStorage`、README 的宽泛 `repo` 引导和无凭据清除/权限验证。明确 Fine-grained 最小权限，增加本机清除和过期/权限失败指引；长期采用同源会话与服务端受限凭据。
2. `ghList()` 吞没目录读取错误，可能把同步失败误报为“无需同步”。应保留状态码并中止提升。
3. 无草稿、编辑、删除、冲突处理和发布证据，无法支撑唯一内容入口的日常维护。

### P2

1. Markdown 子集与前台不一致，URL 规则未采用严格白名单；以共同解析器或结构化渲染测试收敛。
2. 图片统一 JPEG、无体积阈值、无孤儿资产治理；在内容协议稳定后补充上传策略。
3. 单文件代码体量当前不构成问题；仅在引入协议校验、发布计划和状态机后，按职责做小型整理，避免为拆分而拆分。

## 下一阶段最小交付

先写一份独立的内容协议与发布设计（字段映射、兼容策略、验收版本、Prod 基线、图片引用、失败状态、回滚记录和权限模型），经 Review 后再实现。实现顺序应为：Test 只读协议检测与契约测试 → Test 单条发布/草稿 → Test 实页核对记录 → 选择性 Prod 提升与提交回执。未经该设计批准，不应恢复或扩展当前的一键提升。
