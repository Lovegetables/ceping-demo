# 公网部署说明（Render）

这版已经整理成“单服务部署”结构：

- `/`：职业测评 H5
- `/api/*`：登记与飞书同步接口
- `/admin.html`：后台查看页

也就是说，部署完成后你只需要一个公网域名。

## 一、准备

Render 需要从 Git 仓库拉代码，所以先把当前项目放到 GitHub 仓库。

仓库里需要保留这些关键文件：

- [package.json](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/package.json)
- [render.yaml](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/render.yaml)
- [backend/server.js](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/backend/server.js)
- [backend/admin.html](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/backend/admin.html)
- [backend/admin.js](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/backend/admin.js)
- [backend/admin.css](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/backend/admin.css)
- [index.html](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/index.html)
- [app.js](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/app.js)
- [styles.css](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/styles.css)
- 学校与排名数据文件

## 二、在 Render 创建服务

1. 打开 [Render Dashboard](https://dashboard.render.com/)
2. 选择 `New +`
3. 选择 `Blueprint` 或 `Web Service`
4. 连接你的 GitHub 仓库

如果选 `Blueprint`，Render 会自动识别 [render.yaml](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/render.yaml)。

如果选 `Web Service`，手动填写：

- Environment: `Node`
- Build Command: 留空
- Start Command: `npm start`

## 三、配置环境变量

在 Render 的环境变量页填入：

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_BITABLE_APP_TOKEN`
- `FEISHU_BITABLE_TABLE_ID`
- `ADMIN_PASSWORD`：后台查看页访问密码，用于保护 `/admin.html` 和后台查询接口

不需要再设置 `HOST`，代码已默认兼容公网部署。

## 四、部署完成后的访问地址

假设 Render 给你的域名是：

`https://career-assessment-h5.onrender.com`

那么：

- 测评前台：  
  `https://career-assessment-h5.onrender.com/`

- 后台查看页：  
  `https://career-assessment-h5.onrender.com/admin.html`

- 健康检查：  
  `https://career-assessment-h5.onrender.com/api/health`

## 五、部署后的工作方式

部署完成后：

1. 用户打开公网 H5
2. 完成测评并点击“生成报告”
3. 结果提交到 Render 上的登记服务
4. 服务自动同步到飞书多维表
5. 你可以在 Render 后台页或飞书多维表中查看结果

## 六、这版为什么更适合公网

因为前台 `app.js` 已经改成：

- 本地文件打开时，默认走 `http://127.0.0.1:8787`
- 公网部署时，默认走当前域名同源接口

所以：

- 本地测试不受影响
- 公网部署后不需要再额外改接口地址
