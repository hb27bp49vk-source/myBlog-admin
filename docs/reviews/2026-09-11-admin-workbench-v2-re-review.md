# myBlog Admin Workbench V2 — Re-review

日期：2026-09-11
Review 对象：`d3477d95c933afb11a27e9bc5afaccc28af3140a`
结论：**FAIL — Review Fixes 未完整满足权威 Plan；实现仍有 2 个明确 blocker。**

## 已确认通过

1. 一级导航仍为 `文章 / 短记 / 发布`，Prod 仍从独立发布入口进入。
2. `内容类型` 下拉已不再提供 `专题` 新建入口，topic 仅保留底层兼容字段/逻辑。
3. 新增 `editorVisibility()` 与编辑/预览/元数据 tab wiring。
4. 搜索、分类、日期倒序、Test/Prod state 保留相关行为继续存在。
5. 未发现本轮修改改变 Phase B Test-only 写入逻辑或 Phase C C1–C9 安全模型。

## Blocker 1 — “元数据”并未真正收纳元数据

权威 Plan / 上轮 Review 要求：stable ID、日期、分类、type、reading 等技术/次要信息应从默认编辑主视图收进“元数据”视图。

当前 `index.html` 中这些字段仍全部位于 `#editor-write` 的 `.form-grid` 内：

- 稳定 ID
- 日期
- 分类
- 文章类型
- 阅读时长

而 `#editor-meta` 仅显示一段说明文字，并未真正展示/承载这些字段。

因此当前实现只是新增 tab，并没有完成信息架构要求；默认“编辑”视图仍然被元数据字段占据。

### 必须修复

- 默认 `编辑` 视图只保留真正高频编辑字段：标题/摘要/正文，短记对应主字段；
- stable ID、日期、分类、type、reading 等移入 `元数据` 视图；
- 元数据视图中的可编辑字段仍需正确参与原有 `form()` / 保存逻辑；
- 不得改变 content schema 或 Test 写入语义。

## Blocker 2 — 预览 DOM 存在重复 `id="preview"`

当前 `index.html` 同时包含：

- `#editor-preview` 内部的 `<div id="preview"></div>`；
- 同一 `.editor` 内另一个 `<article class="preview" id="preview" ...>`。

这违反 HTML ID 唯一性，会让 `getElementById('preview')`、CSS/事件逻辑产生歧义，也说明旧预览节点未正确移除。

### 必须修复

- 页面只保留一个 Markdown preview 容器；
- `preview()` 必须明确写入该唯一容器；
- 编辑/预览切换必须操作明确的 view 容器，不留下旧重复节点。

## 测试质量问题

当前新增测试：

```js
assert.deepEqual(admin.editorVisibility('edit'), ...)
[ [1366,768], ... ].forEach(x=>assert.deepEqual(admin.layoutContract(...x),{columns:3,overlap:false}))
```

只验证纯 helper 返回值，并不能证明真实 DOM 中：

- tab 切换时对应 view 的 hidden 状态真的正确；
- 元数据真的从编辑视图移走；
- 页面不存在重复关键 ID；
- 16:9 CSS contract 与真实 DOM 结构一致。

本轮不要求引入浏览器依赖，但至少需要增加静态 DOM/结构 contract 测试，直接检查 `index.html`：

1. `preview` ID 唯一；
2. `editor-write / editor-preview / editor-meta` 三个 view 都存在；
3. stable ID / 日期 / 分类 / type / reading 位于 `editor-meta`，不位于默认编辑区；
4. 文章 / 短记 / 发布三个一级导航存在，专题不在一级导航和新建类型下拉；
5. 关键桌面 CSS contract 存在且无明显固定宽度跨栏风险。

## Review 通过条件

1. 真正完成默认编辑 / 预览 / 元数据三态的信息架构；
2. 移除重复 preview ID；
3. 补结构 contract 测试，避免“helper 返回正确但页面结构错误”的假阳性；
4. 现有 Phase B / Phase C / publisher / diff / review boundary 测试继续通过；
5. `git diff --check` 通过；
6. 不改 Phase B / Phase C 安全与写入语义；
7. commit + push 后 STOP 在 `Awaiting ChatGPT Review`。
