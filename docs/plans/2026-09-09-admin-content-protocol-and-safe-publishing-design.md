# Blog Admin — 内容协议与安全发布设计

状态：Ready for Codex
日期：2026-09-09

## 背景

已完成 `docs/audits/2026-09-09-admin-function-release-safety-audit.md`。审计确认当前 Admin 暂不适合承担真实内容发布，主要问题是内容协议不兼容、Test→Prod 整份覆盖、图片与正文非原子、缺少验收基线和回滚证据。

本任务只做设计，不改业务代码，不使用真实 PAT，不向 Test/Prod 写入任何内容或图片。

## 设计目标

产出一份可直接指导后续实现的最小安全发布设计，解决以下问题：

1. 明确文章 / 短记 / 专题的正式字段协议，并与当前 Test 前台实际消费字段对齐。
2. 定义内容协议版本号与向后兼容策略，避免继续依赖无法稳定解析的任意 JS 对象字面量。
3. 定义 Test 内容从“草稿 / 已写入 Test / 已在真实 Test 页面验收 / Release Ready”到 Prod 的状态流转。
4. 定义一次 Prod 内容提升必须绑定的 Test 验收版本和 Prod 基线 SHA。
5. 默认采用“选择性条目提升”，禁止以整份 Test `content.js` 覆盖 Prod 作为默认方式。
6. 定义提升前的差异预览：新增 / 修改 / 删除、目标条目、图片依赖、Prod 基线变化。
7. 定义图片依赖清单，只同步本次批准条目真实引用的资源，不扫描并复制全部上传目录。
8. 定义失败状态：未开始、准备完成、冲突、图片准备失败、提交失败、已提交、部分失败/需补偿、已回滚。
9. 定义回滚证据：至少保留 Prod 旧 commit/SHA、新 commit/SHA、发布清单、操作者确认时间和目标条目。
10. 明确 PAT / GitHub 权限边界：优先 Fine-grained、仅目标仓库 Contents Read/Write；不得把真实 token 写入仓库、日志或设计文档。
11. 明确未来是否继续浏览器直连 GitHub Contents API，还是引入受控发布器；需要给出推荐与阶段性方案，不能为了“更高级”无必要引入后端。
12. 保持“代码发布”和“内容发布”分离：Admin 的内容提升不得同步前台 HTML/CSS/JS 或环境配置。

## 必须给出的决策

设计文档必须明确回答：

- 推荐的内容存储格式：继续 `content.js`、迁移到 JSON，或其他方案；给出迁移成本和兼容方案。
- 内容唯一 ID 规则，以及是否解决当前数组索引链接耦合。
- Test 与 Prod 是否允许存在不同内容；若允许，选择性提升如何防止误覆盖。
- 一次发布是否能通过单次 Git commit 原子提交内容文件与所需图片；若浏览器直连 Contents API 无法做到真正原子，如何设计可恢复状态机。
- Prod 基线发生变化时，系统必须停止还是允许人工覆盖；默认安全行为必须是停止并重新 Review。
- 删除内容如何处理，不能把“缺失于 Test”自动解释为“从 Prod 删除”。
- 图片替换/同路径冲突如何处理。
- 发布成功后必须给用户展示哪些可追溯信息。

## 实现阶段建议

设计文档需把后续实现拆成最少 3 个可独立 Review 的阶段，建议顺序：

A. 内容协议与只读兼容层：能安全读取当前真实 Test 内容，并做字段校验，不允许写 Prod。

B. Test 内容维护：按真实字段协议新增/编辑/草稿，写入 Test，配合真实 Test 页面人工验收。

C. 安全 Prod 提升：选择条目 + Test 验收版本 + Prod 基线 + 差异预览 + 图片依赖 + 提交回执 + 回滚入口。

如果 Codex认为需要不同拆分，可以调整，但必须说明理由，并保持每阶段可单独 Review/回退。

## 允许修改

仅允许新增：
`docs/designs/2026-09-09-admin-content-protocol-and-safe-publishing.md`

## 禁止修改

- `index.html`
- `admin.css`
- `admin.js`
- README
- AGENTS
- Test / Prod 任意文件
- 任何真实内容与凭据

## 分支与提交

- Branch：`codex/admin-content-protocol-safe-publishing-design`
- Commit：`docs: 设计博客 Admin 内容协议与安全发布`

完成后 push 分支并停止，等待 ChatGPT Review；不要合并 main。
