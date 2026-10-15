# GitHub Pages 与域名

仓库：<https://github.com/dongyu19920904/qiuqiu-farm>
默认入口：<https://dongyu19920904.github.io/qiuqiu-farm/>

原生静态游戏无需构建。main 推送触发 `.github/workflows/ci.yml`：原有规则、atlas、主线/手机测试与新增动物回归通过后，打包 runtime 到 Pages。原上游许可证与 CREDITS 随网站发布；未修改账号内其他仓库或网站。

## 自定义域名待 DNS

本次查询 `qiuqiu.aibioo.cn` 返回 NXDOMAIN，当前无 DNS 配置权限。暂保留默认 HTTPS 入口，避免提前绑定使用户被重定向到尚不存在的域名。

在 `aibioo.cn` 的 DNS 服务商添加**仅此子域名**：

| 类型 | 主机记录 | 记录值 | TTL |
| --- | --- | --- | --- |
| CNAME | `qiuqiu` | `dongyu19920904.github.io` | 自动 / 600 秒 |

记录值不带协议、不带 `/qiuqiu-farm/`。若服务商支持代理，先设“仅 DNS”。不改根域名、`www` 或其他网站；如果发现同名记录已有其他用途，先核对该记录，不覆盖。

绑定步骤：在仓库 Settings → Pages → Custom domain 保存 `qiuqiu.aibioo.cn`，随即添加上述 DNS 记录；GitHub 推荐先声明域名，再把 DNS 指向 Pages。等待校验与证书签发后启用 Enforce HTTPS。Actions 发布不会自动读取 CNAME 文件设置自定义域名，必须设置仓库 Pages。

可通过已授权 GitHub CLI 设置：

```powershell
gh api -X PUT repos/dongyu19920904/qiuqiu-farm/pages -f cname=qiuqiu.aibioo.cn -f build_type=workflow
Resolve-DnsName qiuqiu.aibioo.cn -Type CNAME
gh api repos/dongyu19920904/qiuqiu-farm/pages
# 证书就绪后
gh api -X PUT repos/dongyu19920904/qiuqiu-farm/pages -F https_enforced=true
```

域名确认后，把 `index.html` 的 canonical / og:url / og:image 与 README 主入口更新为自定义域名。资源路径为相对路径，支持 Pages 子目录和域名根路径，不需要替换地图/图集 URL。

DNS 生效可能需要时间。以真实 HTTPS 访问、无资源错误、动物照护及刷新恢复为验收，不能只看 Pages 构建成功。

## 存档迁移

默认 Pages 地址和新域名属于不同 origin，本地存档不会自动共享。切换前在原入口设置中导出存档，新域名打开后导入。手机与电脑也通过同样方式迁移。

## 上游与本地同步

GitHub 仓库通过 fork 保留上游全部历史和素材。当前网络下 git clone 的 pack 传输停滞，本地以 GitHub API 快照导入并核验文件；本地阶段提交仍可审查。发布使用 GitHub Git Data API 在原上游提交之上创建增量提交，因此不覆盖远程历史。

后续网络正常时可直接克隆 `dongyu19920904/qiuqiu-farm` 到新目录取得完整一致历史。当前本地目录的导入历史与云端历史不同，不对 origin 执行强推；续做先参阅 PROGRESS 的云端提交和本地提交记录。

参考：[GitHub 官方自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。
