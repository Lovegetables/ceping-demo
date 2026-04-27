# 飞书多维表格接入说明

这版已经支持：

1. 前台生成报告后，结果先写入本地登记后台
2. 后台在保存成功后，自动同步一份到飞书多维表格
3. 已有历史记录可通过补同步接口重新推送到飞书

后台查看页需要配置 `ADMIN_PASSWORD` 后才能查看数据；前台提交测评结果和自动同步飞书不受影响。

公网部署时，后台查看页会优先从飞书多维表格读取记录；Render 本地 JSON 只作为临时缓存和飞书读取失败时的兜底。这样可以避免 Render 免费实例本地文件不稳定导致后台记录数落后于飞书。

## 一、你需要准备的飞书信息

在飞书开放平台准备以下 4 个值：

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_BITABLE_APP_TOKEN`
- `FEISHU_BITABLE_TABLE_ID`

## 二、飞书多维表格建议字段

请在目标多维表里先创建这些列名：

- `记录ID`
- `提交时间`
- `来源`
- `姓名/称呼`
- `联系方式`
- `邮箱`
- `身份`
- `当前阶段`
- `背景等级`
- `背景分`
- `学校层级`
- `学校得分`
- `排名得分`
- `目标方向`
- `优先方向`
- `主推荐路径`
- `主推荐匹配度`
- `冲刺路径`
- `冲刺匹配度`
- `保底路径`
- `保底匹配度`
- `本科院校`
- `本科专业`
- `本科专业类型`
- `研究生院校`
- `研究生专业`
- `研究生专业类型`
- `博士院校`
- `博士专业`
- `博士专业类型`
- `实习经历`
- `项目经历`
- `能力画像`
- `性格画像`
- `完整结果JSON`

建议：

- 文本类列使用单行文本或多行文本
- `背景分`、`学校得分`、`排名得分`、各路径匹配度使用数字列
- `完整结果JSON` 建议使用多行文本

## 三、启动方式

最省心的做法是：

1. 复制一份配置模板
2. 改名为 `backend/.env`
3. 把飞书参数填进去
4. 启动本地登记服务

配置模板在这里：

[backend/.env.example](/Users/liurenhao/Documents/Codex/2026-04-22-new-chat/backend/.env.example)

你可以这样操作：

```bash
cp backend/.env.example backend/.env
```

填完 `backend/.env` 之后，直接启动：

```bash
node backend/server.js
```

如果你更习惯临时环境变量，也可以继续这样启动：

```bash
FEISHU_APP_ID=你的AppID \
FEISHU_APP_SECRET=你的AppSecret \
FEISHU_BITABLE_APP_TOKEN=你的多维表AppToken \
FEISHU_BITABLE_TABLE_ID=你的数据表TableID \
node backend/server.js
```

如果你暂时不想同步飞书，也可以继续直接启动：

```bash
node backend/server.js
```

这时本地登记仍可用，只是不会自动同步到飞书。

## 四、同步逻辑

- 用户点击“生成报告”
- 前端自动调用 `/api/assessment-records`
- 后台先写入本地 `backend/data/assessment-records.json`
- 如果已配置飞书参数，再自动调用飞书多维表格接口新增记录
- 后台查看页优先读取飞书多维表格；飞书读取失败时才回退读取本地缓存

## 五、接口

### 1. 查看本地登记状态

```bash
curl http://127.0.0.1:8787/api/assessment-records
```

### 2. 查看飞书配置状态

```bash
curl http://127.0.0.1:8787/api/feishu/status
```

### 3. 补同步历史记录到飞书

```bash
curl -X POST http://127.0.0.1:8787/api/feishu/backfill
```

后台页现在也增加了两项操作：

- 查看飞书同步状态
- 一键补同步历史记录

## 六、排查建议

如果前台提示“飞书同步暂未成功”，优先检查：

1. `FEISHU_APP_ID / FEISHU_APP_SECRET` 是否正确
2. 多维表格 `App Token / Table ID` 是否正确
3. 飞书应用是否有多维表格读写权限
4. 多维表中是否已经创建了上面的字段名

## 七、当前实现边界

这一版是“本地登记后台 + 飞书同步”模式：

- 优点：不改前台测评逻辑，接入快
- 边界：如果你要让 GitHub 公域链接的用户也能直接写入飞书，仍然需要把这个后台服务部署到公网

也就是说，飞书已经接好了，但前端仍然需要一个可访问的登记服务来中转请求和保护 `App Secret`。
