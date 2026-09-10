# Admin Test Schema Round-trip Compatibility Hotfix

日期：2026-09-10
状态：Completed

## 目标

使 Admin 对当前 myBlog-test/content.json 的读取、编辑、序列化与校验遵循 Test 的正式内容协议，并保证既有合法条目无损 round-trip。

## 已修复

- date 按 Test schema 仅要求必填、非空字符串；表单改用可保留既有格式的文本输入，新建时仍提示推荐 YYYY-MM-DD。
- 编辑现有条目时，cover、imageRefs 和 topic 可选 category 会被保留；当前不新增对应上传或编辑 UI。
- imageRefs 允许读取和保留，但图片上传仍禁用。
- category 不再被固定枚举收紧；选择框仅提供推荐值。
- Stable ID 校验与 Test 的 kind_ 加 26 位 ULID 规则一致。
- 未知字段继续拒绝。

## 项目级规则

- Admin validator 必须服从当前 Test content schema。
- UI 推荐格式不能被提升为协议强制格式。
- 编辑既有内容必须 round-trip safe。
- 协议允许的 optional 字段即使暂时没有 UI，也不得静默丢失。
- 产品限制（例如禁用图片上传）不能被实现成拒绝读取或保留已有合法数据。

## 验证

测试 fixture 覆盖展示型 type、点分日期、topic 日期范围、cover、imageRefs 和 topic 可选 category；测试同时检查整份加载、必填字段、稳定 ID、未知字段与三类内容的 round-trip。
