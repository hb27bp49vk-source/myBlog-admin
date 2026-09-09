# myBlog-admin 维护台

独立仓库托管的博客维护台（GitHub Pages 静态站点），**纯前端、无后端**。

## 架构
- 维护台前端：本仓库（`myBlog-admin`），GitHub Pages 托管
- 数据后端：**无**。浏览器用你的 Personal Access Token 直接调 `api.github.com`
  （公司网络放行 + 开放 CORS，无需任何中间云）
- 文章数据存 `myBlog-test` / `myBlog-prod` 仓库的 `content.js`
- 图片存对应仓库的 `assets/uploads/`

## 使用
1. 打开 https://hb27bp49vk-source.github.io/myBlog-admin/
2. 粘贴 GitHub PAT（需 `repo` 权限），点保存（仅存浏览器本地）
3. 左侧写 Markdown，右侧实时预览；可上传图片自动插入
4. 「发布到测试库」→ 在测试博客核对 → 「一键提升」覆盖正式库

## 安全说明
- PAT 仅存浏览器 `localStorage`，不上传任何服务器
- 单作者场景可接受；如担心，建议用**仅限仓库**的细粒度 Token，并随时在 GitHub 吊销
- 不要在公司公用电脑勾选"保存 Token"

## 为什么没有用 EdgeOne Makers 做后端
Makers 部署后的 `*.edgeone.cool` 端点被预览网关 `eo_token` 保护（实测 401），
无法被跨站前端直接调用，且绑定自定义域名需 ICP 备案。故改用直连 GitHub 方案。
