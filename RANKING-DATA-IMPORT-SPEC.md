# 排名数据录入/导入规范

## 1. 数据目标

学校排名库用于背景竞争力评估，核心字段为 QS、THE、U.S. News Global、ARWU 四大榜单。系统会把多个榜单合成为背景学校分，并在缺少排名时回退到学校层级库和学校类型判断。

## 2. 推荐数据优先级

1. 已授权或官方可下载结构化数据
2. 官方公开页面中明确展示的排名数据
3. 学校层级/雇主认可度人工标签
4. 学校类型兜底判断

不要录入来源不明、转载未授权、或需要付费授权但未取得授权的完整榜单。

## 3. CSV 字段

文件放入 `ranking-input/`，文件名建议使用：

```text
ranking-input/public-ranking-seeds-2026.csv
ranking-input/licensed-ranking-full-2026.csv
ranking-input/china-school-tier-adjustments.csv
```

支持字段：

```csv
name,qs,the,usnews,arwu,employer,labels,aliases,source,ranking_year,source_note
```

| 字段 | 必填 | 说明 |
|---|---:|---|
| `name` | 是 | 学校标准名，尽量与 `schools-data.js` 一致 |
| `qs` | 否 | QS World University Rankings 名次，只填数字；并列名次也填数字 |
| `the` | 否 | Times Higher Education World University Rankings 名次 |
| `usnews` | 否 | U.S. News Best Global Universities 名次 |
| `arwu` | 否 | ARWU 软科世界大学学术排名名次 |
| `employer` | 否 | 雇主认可度，0-100；没有可靠依据可留空 |
| `labels` | 否 | 学校标签，用分号分隔，如 `985;211;双一流;public-seed` |
| `aliases` | 否 | 别名，用分号分隔，如 `MIT;Massachusetts Institute of Technology` |
| `source` | 建议 | 数据来源 URL；多个来源用分号分隔 |
| `ranking_year` | 建议 | 榜单年份，如 `2026` |
| `source_note` | 建议 | 来源说明，如 `THE 2026 public ranking page top 200` |

## 4. 排名录入规则

- 只录入榜单展示的原始名次，不自行换算。
- 区间排名如 `201-250`，录入区间起点 `201`，并在 `source_note` 中说明是区间。
- 并列排名如 `=53`，录入 `53`。
- 同一学校多语言名称必须通过 `aliases` 合并，例如 `清华大学` 与 `Tsinghua University`。
- 同一学校多条 CSV 记录可以分别补 QS/THE/ARWU，构建脚本会按学校名合并。

## 5. 当前公开种子边界

本库先内置以下公开可引用种子：

- QS 2026：公开 Top 1500 PDF 中解析 Top 300，并保留来源说明；官方网页/授权 Excel 可用时可替换为完整 QS 数据。
- THE 2026：官方公开排名页可读取精确 Top 200。
- ARWU 2025：官方公开页首屏可读取 Top 30；完整前 1000 需要进一步按官方许可或授权方式导入。
- U.S. News 2025-2026：官网可公开查看榜单，但自动抓取访问不稳定；建议用授权 CSV 或人工核验后导入。

## 6. 构建命令

```bash
python3 tools/extract-qs-pdf-top300.py
node tools/extract-public-ranking-seeds.js
node tools/build-school-ranking-data.js
```

构建后系统会重写 `school-ranking-data.js`。

## 7. 评分算法口径

四榜权重：

```text
QS 30% + THE 25% + U.S. News Global 25% + ARWU 20%
```

最终学校背景分：

```text
四榜综合分 45% + 雇主认可度 35% + 学校标签 20%
```

置信度：

- 高：3-4 个榜单字段
- 中：2 个榜单字段
- 低：1 个榜单字段

## 8. 年度维护流程

1. 每年榜单发布后，先确认官方页面、下载表、授权范围。
2. 新数据以 CSV 形式放入 `ranking-input/`。
3. 运行构建命令。
4. 抽查至少 20 所高频学校：中英别名、排名字段、合并结果、报告展示。
5. 在 `RANKING-SYSTEM.md` 更新年份和来源说明。
