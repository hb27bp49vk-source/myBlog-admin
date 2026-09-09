# myBlog-admin 内容协议与安全发布设计

日期：2026-09-09

## 决策摘要

本设计以审计报告 `docs/audits/2026-09-09-admin-function-release-safety-audit.md` 为前提。结论如下：

1. 以版本化 `content.json` 作为今后的唯一内容源，不再把任意 JavaScript 对象字面量当作可写协议。
2. 现有 `content.js` 在迁移期只作为只读兼容源；前台加载能力的改造应在 Test 前台仓库独立完成、验收后再单独发布到 Prod，Admin 不发布 HTML/CSS/JS 或环境配置。
3. Test 与 Prod 可以拥有不同内容。Prod 提升只能选择明确批准的稳定 ID，绝不以“Test 比 Prod 少/多”推导删除，也不以整份 Test 文件覆盖 Prod。
4. Prod 提升推荐使用受控发布器，通过 Git Data API 在一个非强制更新的 commit 中写入内容与本次必需图片；浏览器直连 GitHub Contents API 只可作为 Test 阶段的受限过渡，不得承担安全 Prod 提升。
5. 一旦 Prod 基线与准备时记录的 SHA 不一致，默认停止、重新读取差异并重新 Review；没有自动覆盖或“继续发布”选项。

本设计不实现上述改动，不使用真实 PAT，也不向 Test/Prod 写入内容或图片。

## 1. 内容存储与版本化协议

### 1.1 格式选择

采用仓库根目录 `content.json`：UTF-8、严格 JSON、无注释、双引号、固定缩进。JSON 可由浏览器和服务端安全解析与校验；禁止 `eval`、`Function` 或加载 legacy `content.js` 后执行其中任意代码。

当前 `content.js` 含注释、单引号与 JavaScript 对象字面量，不能可靠地 `JSON.parse()`，且无法表达协议版本。迁移完成后其角色为前台兼容期的冻结回退源，不再由 Admin 生成或覆盖。之后每个环境独立维护自己的 `content.json`；Admin 只处理内容文件和受协议允许的图片路径，不处理任何前台代码。

### 1.2 顶层对象

```json
{
  "schemaVersion": 1,
  "articles": [],
  "notes": [],
  "topics": []
}
```

未知顶层字段、未知条目字段、重复 ID、未知分类、空字符串必填字段、非 ISO 日期和不在允许目录的图片路径都应使写入前校验失败。读取层可报告未知字段，但不得静默丢弃后再写回。

`schemaVersion` 只在破坏性协议变更时递增。实现必须支持当前版本及至少一个已发布旧版本的只读适配；写入只产生当前版本。任何版本升级必须有独立迁移器、输入/输出样本、字段校验和 Test 页面验收，不在普通内容发布时顺带升级。

### 1.3 稳定 ID 与字段协议

每一条内容都有不可变 `id`，格式为 `<kind>_<ULID>`，例如 `article_01J...`。ULID 在创建时生成，不由标题、数组位置或日期推导；条目移动、排序、修改标题均不得改变 ID。删除后 ID 永不复用。

| 类型 | 必填字段 | 可选字段 | 约束 |
| --- | --- | --- | --- |
| 文章 `articles` | `id`,`date`,`type`,`category`,`reading`,`title`,`summary`,`body` | `cover`,`imageRefs` | `date` 为 `YYYY-MM-DD`；`category` 为 `project`、`ai` 或 `life`；`body` 为 Markdown |
| 短记 `notes` | `id`,`date`,`label`,`category`,`text` | `imageRefs` | `date` 为 `YYYY-MM-DD`；`text` 为 Markdown |
| 专题 `topics` | `id`,`date`,`title`,`status`,`text` | `category`,`imageRefs` | 当前前台默认专题分类为 `ai`；若写入 `category`，只能为允许枚举 |

`imageRefs` 是正文/封面经解析、去重后的相对资源清单，格式只能是 `./assets/uploads/<content-id>/<sha256>-<safe-name>.<ext>`。它是发布器的资源依赖依据；写入时必须与 `body`、`text`、`cover` 中实际引用重新计算的集合一致，不接受客户端单独声称的路径。

前台应在独立前台改造中改用 `?id=<stable-id>` 查询内容，保留旧的 `kind-index` URL 和 `#entry-kind-index` 解析为过渡兼容，不新增对数组索引的依赖。旧 URL 的稳定性由一次迁移映射或原始数组顺序维持；不得在内容发布时重排数组来“修复”链接。

## 2. 兼容与迁移方案

1. **一次性受控转换**：在各环境分别从已审查的 legacy `content.js` 提取当前三类数组，人工/受信任 AST 工具转换为严格 JSON；不得由线上浏览器执行 legacy 脚本。为每个旧条目分配稳定 ID，并把日期归一化为 ISO 格式。
2. **独立前台兼容发布**：先在 Test 前台实现 `content.json` 优先、冻结 `content.js` 回退的加载器，同时实现稳定 ID 链接和旧 URL 回退；做渲染与链接回归后，再按常规代码发布流程独立提升前台代码到 Prod。此阶段不是 Admin 内容发布。
3. **内容切换**：Test 前台验收 `content.json` 的所有现有内容、图片、旧链接与移动端后，才允许 Admin 的 Test 写入改为 `content.json`。Prod 仍使用其已验收版本，直到其独立前台兼容发布完成。
4. **退役 legacy**：两个环境均稳定运行、旧 URL 回退期结束且有 Git 标签/提交证据后，才由单独代码变更移除 `content.js` 读取。不能在 Admin 中删除 legacy 文件。

迁移失败时保持现有前台和 legacy 文件不变，修正转换输入后重新生成候选文件；不得以空数组写回。

## 3. Test 内容状态与验收版本

状态元数据不得混入公开内容协议，也不应把草稿公开写入 Test 内容文件。草稿留在维护台受控草稿存储中；其跨设备、加密与保存策略需另行 Review，且不得保存真实 PAT。

每个条目的发布生命周期为：

```text
draft → test-written → test-page-verified → release-ready
                           │                     │
                           └── verification-failed ┘
```

- `test-written`：受控 Test 写入已成功，保存 Test commit SHA、`content.json` blob SHA、条目 ID、内容摘要哈希与图片清单。
- `test-page-verified`：操作者在实际 Test 页面检查正文、链接、图片与移动端后，记录检查时间、页面 URL、操作者与上述 Test SHA。浏览器预览或 API 200 不可替代此状态。
- `release-ready`：操作者从一个确定的 `test-page-verified` 证据创建提升计划；计划不可随 Test 后续写入自动变化。

Test 环境不得读取 Prod 内容、凭据、Cookie、缓存或数据库。准备 Prod 提升的 Prod 基线读取必须在 Production 发布器/会话边界中完成，不在 Test 页面或 Test token 中完成。

## 4. 选择性 Test→Prod 提升模型

### 4.1 不可变提升计划

创建计划时，发布器产生 `releaseId` 与不可变清单，至少包含：

- 选择的条目 ID、类型、候选内容哈希和对应的 Test 验收 commit/blob SHA；
- 准备时的 Prod `HEAD` commit SHA、`content.json` blob SHA 与每个选中 ID 在 Prod 的旧哈希（不存在则标为新增）；
- 新增、修改、显式删除三类差异；
- 从实际 Markdown/封面解析出的图片依赖、每个资源的内容哈希、目标路径和是否已在 Prod 存在；
- 操作者、准备时间、显式“正式发布”确认和计划到期时间。

计划只能新增/替换所选 ID。Prod 未列入计划的条目必须逐字保留。删除是单独的显式操作：必须在计划中列出要删除的稳定 ID、其 Prod 旧哈希、理由和更强确认；“Test 中不存在”永远不表示应删除 Prod。

### 4.2 基线和差异预览

提交前再次读取 Prod HEAD 与 `content.json` blob SHA，并将其与计划基线逐项比较：

- 两者一致：显示最终摘要，允许确认提交。
- 不一致：进入 `conflict`，停止，不写入任何 Prod 文件；重新读取 Prod、重新生成新增/修改/删除和图片差异，要求人工重新 Review 与重新确认。

差异界面必须可审阅地显示字段级变化、所选条目全文/Markdown diff、未选 Prod 条目的“保持不变”数量、图片新增/复用/冲突，以及将写入的文件列表。不得提供“忽略基线继续覆盖”。

### 4.3 原子提交

浏览器直连 GitHub Contents API 的逐文件 PUT 无法将 `content.json` 与多个图片做真正原子提交，也无法安全地保存生产审计记录。因此推荐生产专用、同源、受登录会话保护的发布器：

1. 服务端使用仅限 `myBlog-prod` 的 Fine-grained Token，权限仅为 `Contents: Read and write`；Test 与 Prod token、会话与存储严格分离。
2. 发布器根据已验证计划创建所需 blobs、tree 和单个 commit，树中仅允许 `content.json`、计划所列的 `assets/uploads/...`，以及批准的非机密发布记录路径。
3. 用计划的 Prod HEAD 执行非强制 ref 更新；若 GitHub 拒绝，标记冲突并停止。成功即内容与所有新增图片在同一 commit 出现。

受控发布器不是本任务的实现授权。若未来不能部署它，Prod 提升必须维持禁用状态；不得用浏览器 Contents API 的“先内容后图片”流程降级恢复一键发布。Test 的单文件写入可在受限 token 与 SHA 冲突检测下作为过渡，但同样不拥有 Prod 权限。

## 5. 图片、失败和回滚

### 5.1 图片规则

图片在 Test 写入时按稳定 ID 和内容哈希命名，禁止时间戳随机名作为唯一依据。相同字节的图片可复用同一哈希路径；相同路径但哈希不同即为 `image-conflict`，停止并要求重新命名或显式替换审核。发布器只根据批准条目重新解析出的引用清单复制/写入资源，不扫描整个 `assets/uploads/`，不删除任何未选 Prod 图片。

### 5.2 状态机

```text
not-started → prepared → confirmed → committing → committed
                  │           │          │
                  ├→ conflict ├→ cancelled └→ commit-failed
                  └→ image-preparation-failed
```

单 commit 模型下，`committed` 表示内容、图片和发布记录已同时到达目标 commit；不存在“内容成功、图片失败”的正常完成状态。网络超时后不得猜测失败：查询 `releaseId` 对应的 commit/发布记录，存在则标记 `committed`，不存在则标记 `commit-unknown` 并人工核对。旧 Contents API 遗留的部分写入只可标记 `partial-failure / compensation-required`，禁止自动重试覆盖。

### 5.3 回滚证据与操作

每次 Prod 提升记录：`releaseId`、操作者、确认时间、Test 验收 SHA、Prod 旧 HEAD/新 HEAD、旧/新 `content.json` blob SHA、选中 ID 和摘要哈希、文件/图片清单、差异摘要、结果与站点核对时间。记录不得含 PAT、Cookie、会话密钥或请求头。

回滚必须创建一份新的、可审计的回滚计划，目标是记录的旧 commit/tree 或仅限原计划条目的反向变更，并再次核验当前 Prod HEAD。禁止 `force push`、重写历史或删除未包含在回滚计划中的 Prod 内容；基线变化时停止并重新 Review。

## 6. 权限与边界

- 优先 Fine-grained PAT，分别仅选择目标仓库并仅授予 `Contents: Read and write`；不得使用经典宽权限 `repo` 作为推荐配置。
- 浏览器不保存、记录、显示或回传真实 Prod token；长期方案为 HttpOnly、Secure、SameSite 会话和服务端受限凭据。服务端日志同样不得记录 token 或 Authorization 头。
- 发布器硬编码允许的 Test/Prod 仓库与路径白名单，拒绝客户端提交仓库名、分支名、任意路径或任意 Git ref。
- 内容发布器只能处理协议指定内容文件、批准图片与发布记录；禁止写入 HTML、CSS、JavaScript、配置、工作流或环境文件。
- 生产操作需要独立授权与确认；Test UI、Test 凭据和 Test 数据存储不能读取任何 Prod 敏感状态。

## 7. 后续实现阶段

### A. 内容协议与只读兼容层

在独立 Test 前台变更中加入 `content.json` 优先/legacy 回退、稳定 ID 链接兼容、严格 schema 校验与样本契约测试。禁止任何 Prod 写入。验收：现有内容、旧 URL、图片和 320/375/414px 实页渲染均正确，可完整回退到 legacy。

### B. Test 内容维护

在独立 Admin 变更中实现受协议校验的草稿、单条新增/编辑、内容摘要哈希、图片引用提取和 Test 写入回执；使用只限 Test 的权限。验收：Test 单条写入、SHA 冲突、无效字段、图片失败和实际页面核对均有明确状态。Prod 提升继续禁用。

### C. 生产发布器与选择性提升

在单独安全 Review 后实现 Production 会话、不可变提升计划、Prod 基线检查、字段 diff、Git Data API 单 commit、发布记录和回滚计划。验收：新增、修改、显式删除、基线冲突、同路径图片冲突、超时查询、回滚和发布后真实页面检查。任何未通过项都不得开启 Prod 写入。

### D. 受控切换与退役

在 Test 长期运行并完成内容与链接回归后，按独立代码发布流程将兼容前台发布到 Prod；随后才允许已审查的安全提升。legacy `content.js` 的退役另开任务、单独 Review 和可回退发布，不与功能迭代捆绑。
