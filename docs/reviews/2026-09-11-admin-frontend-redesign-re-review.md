# myBlog Admin — Frontend Redesign Re-review

日期：2026-09-11
Review 对象：`776a1030fc994ca365b6671bf5e653da2b505abb`
结论：**FAIL — 仅剩 1 个测试质量 blocker。实现本身未发现新的功能/安全 blocker。**

## 已确认通过

1. 全局 `<title>`、Header、副标题与环境 badge 已修正为双工作模式语义，不再把整个 Admin 错误描述成“仅 Test 内容维护”。
2. `libraryRows()` 已抽出为可测试 helper，真实覆盖：标题/摘要/正文/稳定 ID 搜索、类型过滤、日期倒序。
3. `modeVisibility()` 已抽出并覆盖 Test / Prod 可见状态映射。
4. 未发现本轮修改改变 Phase B Test-only 写入逻辑或 Phase C C1–C9 安全模型。

## 唯一 blocker — state 保留测试是假阳性

当前 `tests/frontend-redesign.test.js` 中的 state 保留测试创建了一个与真实 `admin.state` 无关的本地对象：

```js
const retained={document:doc,blobSha:'blob'};
admin.modeVisibility('prod');
admin.modeVisibility('test');
assert.equal(retained.document,doc);
assert.equal(retained.blobSha,'blob');
```

这只能证明一个从未被任何代码修改过的普通对象仍保持原值，不能证明真实 Admin state 在模式切换后仍保留。

Redesign Review 明确要求：

- Test / Prod 模式切换可见状态；
- **模式切换不清空已加载的 `state.document` / `blobSha`。**

因此当前测试仍存在假阳性，不能把这一项判为真实行为测试通过。

## 必须修复

只做最小测试性重构即可：

- 将模式切换封装为可测试函数，例如 `switchMode(mode)` / `applyMode(mode, ...)`；
- 或者使用轻量 fake DOM / DOM stub 调用真实模式切换 wiring；
- 测试前把真实导出的 `admin.state.document` 与 `admin.state.blobSha` 设为测试值；
- 执行 test → prod → test 模式切换；
- 断言真实 `admin.state.document` 与 `admin.state.blobSha` 未被清空/替换；
- 同时断言 Test / Prod 可见状态正确。

不要为了这项测试引入 jsdom、框架、build system 或新运行时依赖。

## Review 通过条件

1. 修掉上述假阳性；
2. Frontend workbench behavior tests 真正覆盖 state 保留；
3. 其余现有测试继续通过；
4. `git diff --check` 通过；
5. 不改 Phase B / Phase C 安全与写入语义；
6. commit + push 后再次 STOP 在 `Awaiting ChatGPT Review`。
