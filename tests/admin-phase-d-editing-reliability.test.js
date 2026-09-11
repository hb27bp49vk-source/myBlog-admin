'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const adminJs = fs.readFileSync(path.join(root, 'admin.js'), 'utf8');
const adminLines = adminJs.split(/\r?\n/);
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const lineOf = pattern => {
  const idx = adminLines.findIndex(line => pattern.test(line));
  assert.notEqual(idx, -1, `未在 admin.js 中找到匹配 ${pattern}`);
  return adminLines[idx];
};

// 1. dirty 状态 + 辅助函数
assert.match(adminJs, /dirty:\s*false/, 'state 必须初始化 dirty=false');
assert.match(adminJs, /function markDirty\(/, '必须存在 markDirty 函数');
assert.match(adminJs, /function clearDirty\(/, '必须存在 clearDirty 函数');
assert.match(adminJs, /function updateDirtyIndicator\(/, '必须存在 updateDirtyIndicator 函数');
assert.match(adminJs, /function confirmDiscardIfDirty\(/, '必须存在 confirmDiscardIfDirty 函数');

// 2. publish 成功路径调 clearDirty
const publishLine = lineOf(/^async function publish\(/);
assert.match(publishLine, /clearDirty\(\)/, 'publish 成功路径必须调 clearDirty()');
assert.match(publishLine, /classifyApiError/, 'publish 错误必须使用 classifyApiError');

// 3. publish catch 路径不调 clearDirty（行内 catch 块）
const publishCatchMatch = publishLine.match(/\}catch\(e\)\{([\s\S]*?)\}\}\s*$/);
assert.ok(publishCatchMatch, 'publish 必须有 catch 块');
assert.doesNotMatch(publishCatchMatch[1], /clearDirty/, 'publish catch 块不得调用 clearDirty');
assert.match(publishCatchMatch[1], /BASELINE_CONFLICT/, 'publish catch 必须仍处理 BASELINE_CONFLICT');

// 4. activateView（Tab 切换）不触发 confirmDiscard
const activateViewLine = lineOf(/^function activateView\(/);
assert.doesNotMatch(activateViewLine, /confirmDiscardIfDirty/, 'activateView 不得调用 confirmDiscardIfDirty');

// 5. reset 函数清 dirty
const resetLine = lineOf(/^function reset\(/);
assert.match(resetLine, /state\.dirty=false/, 'reset 必须清 dirty');
assert.match(resetLine, /updateDirtyIndicator\(\)/, 'reset 必须刷新保存状态指示器');

// 6. 日期输入 type=date
assert.match(indexHtml, /id="content-date"[^>]*type="date"/, 'content-date 必须使用 type="date"');

// 7. operator token 提示
assert.match(indexHtml, /myBlog-admin\s*<\/code>，\s*<code>Actions:\s*Read\s+and\s+write/, 'operator token 必须说明权限 myBlog-admin / Actions: Read and write');
assert.match(indexHtml, /<strong>仅用于触发 myBlog-admin GitHub Actions<\/strong>/, 'operator token 必须明确说明仅用于触发 myBlog-admin workflow');

// 8. list-more 按钮 disabled
assert.match(adminJs, /class="list-more"[^>]*disabled/, '列表项 ••• 按钮必须标记为 disabled');

// 9. beforeunload 监听
assert.match(adminJs, /addEventListener\(['"]beforeunload['"]/, '必须存在 beforeunload 监听');

// 10. debounce + previewDebounced + renderListDebounced
assert.match(adminJs, /function debounce\(/, '必须存在 debounce 函数');
assert.match(adminJs, /previewDebounced=debounce/, 'previewDebounced 必须由 debounce 包装');
assert.match(adminJs, /renderListDebounced=debounce/, 'renderListDebounced 必须由 debounce 包装');
assert.match(adminJs, /content-body[\s\S]*?input[\s\S]*?previewDebounced/, 'content-body 输入必须使用 previewDebounced');
assert.match(adminJs, /content-search.*oninput=renderListDebounced/, 'content-search 必须使用 renderListDebounced');

// 11. classifyApiError 存在
assert.match(adminJs, /function classifyApiError\(/, '必须存在 classifyApiError 函数');
assert.match(adminJs, /Token 无效或权限不足/, 'classifyApiError 必须区分 token 无效');
assert.match(adminJs, /Test 基线已变化/, 'classifyApiError 必须区分基线冲突');
assert.match(adminJs, /网络请求失败/, 'classifyApiError 必须区分网络失败');

// 12. save-status 元素
assert.match(indexHtml, /id="save-status"/, 'index.html 必须存在 save-status 元素');

// 13. 关键路径需要 confirmDiscard
const editLine = lineOf(/^function edit\(k,id\)\{/);
assert.match(editLine, /confirmDiscardIfDirty/, 'edit 必须在开始时调用 confirmDiscardIfDirty');

const setEnvironmentLine = lineOf(/^function setEnvironment\(/);
assert.match(setEnvironmentLine, /confirmDiscardIfDirty/, 'setEnvironment 在 prod 切换时必须调用 confirmDiscardIfDirty');

// DOMContentLoaded 跨多行，直接用 adminJs（跨行 .match）
assert.match(adminJs, /addEventListener\(['"]DOMContentLoaded['"]/, '必须存在 DOMContentLoaded 监听');
assert.match(adminJs, /new-button[\s\S]*?confirmDiscardIfDirty/, '新建按钮必须 confirmDiscardIfDirty');
assert.match(adminJs, /data-kind-filter[\s\S]*?confirmDiscardIfDirty/, 'data-kind-filter 切换必须 confirmDiscardIfDirty');
assert.match(adminJs, /beforeunload/, 'DOMContentLoaded 内必须存在 beforeunload 监听');

// editor-tab 在 DOMContentLoaded 中单行 onclick，直接检查该行不含 confirmDiscardIfDirty
const editorTabLine = adminLines.find(line => /editor-tab/.test(line) && /onclick/.test(line));
assert.ok(editorTabLine, 'editor-tab 绑定必须存在');
assert.match(editorTabLine, /activateView\(b\.dataset\.view\)/, 'editor-tab 必须直接调 activateView');
assert.doesNotMatch(editorTabLine, /confirmDiscardIfDirty/, 'editor-tab 切换不得 confirmDiscardIfDirty');

// 14. initialSnapshot 不应存在于 state（死字段已清理）
assert.doesNotMatch(adminJs, /initialSnapshot/, 'state 中不得残留 initialSnapshot 死字段');

// 15. toolbar 修改正文必须 dirty（防御性显式 markDirty）
const wrapSelectionLine = lineOf(/^function wrapSelection\(/);
assert.match(wrapSelectionLine, /markDirty\(\)/, 'wrapSelection 必须显式 markDirty()，避免 input 事件隐式依赖');

const prefixLinesLine = lineOf(/^function prefixLines\(/);
assert.match(prefixLinesLine, /markDirty\(\)/, 'prefixLines 必须显式 markDirty()，避免 input 事件隐式依赖');

const toolbarCommandLine = lineOf(/^function toolbarCommand\(/);
assert.match(toolbarCommandLine, /markDirty\(\)/, 'toolbarCommand undo 分支必须显式 markDirty()（直接赋值不触发 input 事件）');

console.log('Phase D editing reliability tests passed');