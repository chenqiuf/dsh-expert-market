# 发布指南

这份文档说明如何把「精选市场」发布出去，让别人能装。

按 **路径 A（免费引流）** 和 **路线 1+2（npm 主 + Git 备）** 设计：
插件本身免费，用作品页里的定制服务联系方式变现；npm 是主安装源，Git 是备用源，
两者共用同一份索引 `dist/index.json`。

---

## 一、你需要准备什么

| 项 | 说明 | 怎么查 |
|---|---|---|
| npm 账号 | 免费。`npm login` 一次 | `npm whoami` |
| GitHub 账号 | 放源码和索引 | — |
| 一个公网静态地址 | 放 `index.json`。GitHub Pages 免费够用 | — |

**已核实的现状**：本机 `npm whoami` 未登录；当前目录已初始化 Git 仓库但还没有远程；
包名 `dsh-expert-market` 在 npm 上**可用**（我查过 registry，返回 404）。

---

## 二、一条命令填好身份信息

```bash
./fill-identity.sh <GitHub用户名> <作者名> <联系方式> <索引URL>
```

例如：

```bash
./fill-identity.sh chenqiuf "陈秋峰" "478826521@qq.com" "https://chenqiuf.github.io/dsh-expert-market/index.json"
```

> **已为你填好**：GitHub 用户名 `chenqiuf`、作者 `陈秋峰`、联系邮箱
> `478826521@qq.com`、索引地址 `https://chenqiuf.github.io/dsh-expert-market/index.json`。
> 如果这些信息要改，重跑一次上面的命令即可。

它会自动做四件事：

1. 把 GitHub 用户名写进 `package.json` 的 `homepage` 和 `repository`
2. 把作者名写进索引条目
3. 把联系方式写进详情页（`docs/DETAIL.md`）
4. 把索引地址写进详情页，然后同步版本与 commit

跑完会直接显示检查结果，全绿就能发布。

### 手动替换（如果不想用脚本）

一共 4 个占位符，`./publish.sh check` 会逐个检查，缺一个都不让发。

| 占位符 | 在哪 | 替换成 |
|---|---|---|
| `YOUR-GITHUB-NAME` | `package.json`、`dist/index.json` | 你的 GitHub 用户名 |
| `YOUR-NAME` | `dist/index.json` 的 `author` | 你的名字或团队名 |
| `YOUR-CONTACT` | `docs/DETAIL.md` 结尾 | 微信号 / 邮箱 / 网址 |
| `YOUR-DOMAIN` | `docs/DETAIL.md` 的索引地址 | 你放 index.json 的域名 |

替换完再运行：

```bash
./publish.sh check
```

它会：检查占位符 → 构建 → 跑全部测试（143 项）→ 校验索引 schema。

> 索引里的 git commit **不需要手填**：`./publish.sh git` 和 `./fill-identity.sh`
> 都会调用 `./sync-index.sh` 自动写入，保证索引指向的正是当前代码。

---

## 三、发布到 npm（路线 1，主安装源）

```bash
npm login                                  # 只需一次
./publish.sh npm
```

脚本会做三件事：
1. 确认这个版本号还没发布过（重复发布会失败）
2. 构建并跑全部测试
3. 用**公共 registry** 发布（不是本机配置的国内镜像）

发布成功后地址是 `https://www.npmjs.com/package/dsh-expert-market`。

**以后更新版本**：改 `package.json` 的 `version`，再跑 `./publish.sh npm`。

---

## 四、推送到 GitHub（路线 2，备用源）

```bash
# 先在 GitHub 建一个空仓库 dsh-expert-market，然后：
git remote add origin https://github.com/YOUR-GITHUB-NAME/dsh-expert-market.git
git push -u origin main
```

提交并让索引指向这个提交：

```bash
./publish.sh git
```

这一步会自动：同步索引里的版本号与 commit → 提交 → 打印最终的 SHA。
**不需要手工复制 SHA**，脚本会保证索引与代码一致。

**为什么 Git 版本必须写完整 commit**：宿主的 Git 安装源要求固定到具体 commit，
不接受分支名。写分支名会导致安装失败。这是宿主强制的，不是我的选择。

---

## 五、把索引放到公网

有两条路，任选：

### A. GitHub Pages（推荐，免费）

1. 把 `dist/index.json` 复制到仓库根目录，命名为 `index.json`
2. 仓库 Settings → Pages → Source 选 `main` 分支 → 保存
3. 等 1–2 分钟，地址成为：
   ```
   https://YOUR-GITHUB-NAME.github.io/dsh-expert-market/index.json
   ```

### B. 你自己的域名

把 `dist/index.json` 传到任意静态托管（对象存储、CDN、你的服务器），
保证能用 https 直接访问到 JSON 原文即可。

**验证索引可访问**：

```bash
curl -s <你的索引URL> | head -5
```

应该看到 JSON 原文，不是 HTML 错误页。

---

## 六、上线前自己装一遍

这一步不能省，否则用户装了会踩坑。

1. 打开 DSH →「插件」页 →「发现」
2. 添加索引源：填你的索引 URL
3. 应该能看到「精选市场」卡片
4. 点安装，确认能装成功、能打开页面

**如果看不到**：多半是索引 URL 404、JSON 格式不对，或 `plugins[].name` 和
npm 上的包名不一致。逐项检查。

---

## 七、别人怎么装（写进你的宣传文案）

```
在 DSH 的「插件」页打开「发现」，添加索引源：
  https://你的域名/index.json

然后搜索「精选市场」安装。
```

或者终端一条命令：

```bash
dsh plugin add dsh-expert-market
```

---

## 八、清单

发布前逐项打勾：

- [ ] 5 个占位符全部替换
- [ ] `./publish.sh check` 通过
- [ ] `npm login` 完成
- [ ] `./publish.sh npm` 成功
- [ ] GitHub 仓库已建、已推送
- [ ] `dist/index.json` 的 git commit 已填真实 SHA
- [ ] 索引已放到公网、`curl` 能取到 JSON
- [ ] 用一个新的 profile 实际装过一次
- [ ] `docs/DETAIL.md` 里的联系方式是你的真实联系方式

---

## 九、已知限制（发布后仍然存在）

| 限制 | 原因 |
|---|---|
| 用户必须**手动添加索引 URL** | 宿主没有「官方商店上传」接口，没人能自动出现在默认列表里 |
| 用户会看到「索引由第三方提供，只添加你信任的来源」 | 宿主对任意第三方索引的固定提示，无法关闭 |
| Git 版本每次更新都要改 SHA | 宿主强制的固定 commit 机制 |
| 插件无法阻止代码被查看 | 发布的是明文 JS，前端代码必然可读 |
| 无法在插件内直接收钱 | 宿主没有任何支付能力，只能引流到站外 |
