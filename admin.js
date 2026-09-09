// myBlog-admin 维护台前端（纯前端直连 GitHub，无第三方后端）
// 浏览器用 PAT 直接调 api.github.com（公司放行 + CORS 开放）

const API = 'https://api.github.com';
const REPOS = {
  test: 'hb27bp49vk-source/myBlog-test',
  prod: 'hb27bp49vk-source/myBlog-prod',
};

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeUrl(u) {
  return /^(javascript|vbscript|data):/i.test(String(u || '').trim()) ? '#' : u;
}
function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(b64) {
  return decodeURIComponent(escape(atob(String(b64).replace(/\n/g, ''))));
}
function msg(text, kind) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = kind || '';
}
function getToken() {
  return localStorage.getItem('mb_token') || '';
}

/* ---------- GitHub API ---------- */
function ghHeaders(token, extra) {
  return Object.assign(
    { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'User-Agent': 'myblog-admin' },
    extra || {}
  );
}
async function ghGet(repo, path, token) {
  const r = await fetch(`${API}/repos/${repo}/contents/${path}`, { headers: ghHeaders(token) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}`);
  return r.json();
}
async function ghList(repo, dir, token) {
  const r = await fetch(`${API}/repos/${repo}/contents/${dir}`, { headers: ghHeaders(token) });
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}
async function ghPutRaw(repo, path, b64, token, sha, message) {
  const body = sha ? { message, content: b64, sha } : { message, content: b64 };
  const r = await fetch(`${API}/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: ghHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`PUT ${path} -> ${r.status} ${j.message || ''}`);
  return j;
}

/* ---------- content.js 读写 ---------- */
function parseContent(text) {
  const m = text.match(/window\.blogContent\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (m) return JSON.parse(m[1]);
  return JSON.parse(text);
}
function serializeContent(obj) {
  return 'window.blogContent = ' + JSON.stringify(obj, null, 2) + ';';
}
async function readContent(repo, token) {
  const d = await ghGet(REPOS[repo], 'content.js', token);
  if (!d) return { articles: [], notes: [], topics: [] };
  return parseContent(b64decode(d.content));
}
async function writeContent(repo, obj, token) {
  const existing = await ghGet(REPOS[repo], 'content.js', token);
  const sha = existing ? existing.sha : null;
  await ghPutRaw(REPOS[repo], 'content.js', b64encode(serializeContent(obj)), token, sha, 'update content.js via admin');
}

/* ---------- Markdown 渲染（简化、安全） ---------- */
function renderMarkdown(src) {
  if (!src) return '';
  let s = esc(src);
  s = s.replace(/```([\s\S]*?)```/g, (m, c) => `<pre><code>${c.replace(/^\n/, '')}</code></pre>`);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener">${t}</a>`);
  s = s.replace(/^### (.*)$/gm, '<h3>$1</h3>')
       .replace(/^## (.*)$/gm, '<h2>$1</h2>')
       .replace(/^# (.*)$/gm, '<h1>$1</h1>')
       .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
       .replace(/\*([^*]+)\*/g, '<em>$1</em>')
       .replace(/`([^`]+)`/g, '<code>$1</code>')
       .replace(/^\s*[-*]\s+(.*)$/gm, '<p class="li">• $1</p>')
       .replace(/^&gt;\s?(.*)$/gm, '<blockquote>$1</blockquote>');
  s = s.split(/\n{2,}/).map((b) => {
    if (/^<(h\d|ul|pre|blockquote|p class="li")/.test(b.trim())) return b;
    return '<p>' + b.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
  return s;
}
function render() {
  document.getElementById('preview').innerHTML = renderMarkdown(document.getElementById('post-body').value);
}

/* ---------- 图片压缩上传 ---------- */
function compressImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      const max = 1200;
      if (w > max || h > max) {
        const r = Math.min(max / w, max / h);
        w = Math.round(w * r); h = Math.round(h * r);
      }
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      const data = cv.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(url);
      res(data.split(',')[1]);
    };
    img.onerror = () => rej(new Error('图片读取失败'));
    img.src = url;
  });
}
async function uploadImage() {
  const token = getToken();
  if (!token) return msg('请先保存 Token', 'err');
  const file = document.getElementById('img-file').files[0];
  if (!file) return msg('请选择图片', 'err');
  try {
    const b64 = await compressImage(file);
    const name = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.jpg';
    await ghPutRaw(REPOS.test, 'assets/' + name, b64, token, null, 'upload ' + name);
    const url = './assets/' + name;
    const ta = document.getElementById('post-body');
    ta.value += `\n![图片](${url})\n`;
    render();
    msg('图片已上传并插入正文 ✔ ' + url, 'ok');
  } catch (e) {
    msg('上传失败：' + e.message, 'err');
  }
}

/* ---------- 发布 / 提升 ---------- */
async function publish() {
  const token = getToken();
  if (!token) return msg('请先保存 Token', 'err');
  const type = document.getElementById('post-type').value;
  const title = document.getElementById('post-title').value.trim();
  const tags = document.getElementById('post-tags').value.split(',').map((t) => t.trim()).filter(Boolean);
  const body = document.getElementById('post-body').value;
  if (!title) return msg('标题不能为空', 'err');
  try {
    const data = await readContent('test', token);
    const arr = data[type + 's'] || (data[type + 's'] = []);
    const id = 'gen-' + Date.now();
    const item = { id, title, tags, body, date: new Date().toISOString().slice(0, 10) };
    if (type === 'article') item.cover = '';
    arr.unshift(item);
    await writeContent('test', data, token);
    msg('已发布到测试库 ✔', 'ok');
    loadList();
  } catch (e) {
    msg('发布失败：' + e.message, 'err');
  }
}
async function syncUploads(token) {
  const list = await ghList(REPOS.test, 'assets/uploads', token);
  const prodList = await ghList(REPOS.prod, 'assets/uploads', token);
  const have = new Set(prodList.map((f) => f.path));
  const copied = [];
  for (const f of list.filter((f) => f.type === 'file' && !have.has(f.path))) {
    const c = await ghGet(REPOS.test, f.path, token);
    if (c) {
      await ghPutRaw(REPOS.prod, f.path, c.content, token, null, 'sync ' + f.path);
      copied.push(f.name);
    }
  }
  return copied;
}
async function promote() {
  const token = getToken();
  if (!token) return msg('请先保存 Token', 'err');
  if (!confirm('确认将【测试库】内容一键提升到【正式库】？此操作会用测试库覆盖正式库 content.js。')) return;
  try {
    const testData = await readContent('test', token);
    await writeContent('prod', testData, token);
    const copied = await syncUploads(token);
    msg('已提升到正式库 ✔' + (copied.length ? ` 同步图片 ${copied.length} 张` : ''), 'ok');
  } catch (e) {
    msg('提升失败：' + e.message, 'err');
  }
}

/* ---------- 列表 ---------- */
async function loadList() {
  const token = getToken();
  if (!token) return;
  try {
    const data = await readContent('test', token);
    const ul = document.getElementById('post-list');
    ul.innerHTML = '';
    const all = [];
    (data.articles || []).forEach((i) => all.push(Object.assign({ _t: '文章' }, i)));
    (data.notes || []).forEach((i) => all.push(Object.assign({ _t: '短记' }, i)));
    (data.topics || []).forEach((i) => all.push(Object.assign({ _t: '专题' }, i)));
    if (!all.length) {
      ul.innerHTML = '<div class="muted">测试库暂无内容</div>';
      return;
    }
    all.forEach((i) => {
      const li = document.createElement('div');
      li.className = 'list-item';
      li.innerHTML = `<div><b>${esc(i.title || '(无标题)')}</b> <span class="tag">${esc(i._t)}</span>` +
        `<div class="meta">${esc(i.date || '')} ${esc((i.tags || []).join(' '))}</div></div>`;
      ul.appendChild(li);
    });
  } catch (e) {
    msg('读取列表失败：' + e.message, 'err');
  }
}

/* ---------- Token ---------- */
function saveToken() {
  const v = document.getElementById('token-input').value.trim();
  if (!v) return msg('Token 为空', 'err');
  localStorage.setItem('mb_token', v);
  msg('Token 已保存', 'ok');
  loadList();
}

/* ---------- 初始化 ---------- */
function init() {
  const saved = getToken();
  if (saved) document.getElementById('token-input').value = saved;
  document.getElementById('post-body').addEventListener('input', render);
  render();
  if (saved) loadList();
}
window.addEventListener('DOMContentLoaded', init);
