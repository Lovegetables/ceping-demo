const API_BASE = `${window.location.origin}/api`;
const ADMIN_TOKEN_KEY = "careerAssessmentAdminToken";
let currentRecords = [];

function adminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

function adminHeaders(extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${adminToken()}`
  };
}

function setAdminVisible(isVisible) {
  document.getElementById("loginCard").classList.toggle("hidden", isVisible);
  document.getElementById("adminContent").classList.toggle("hidden", !isVisible);
  document.getElementById("refreshBtn").disabled = !isVisible;
  document.getElementById("logoutBtn").disabled = !isVisible;
}

function handleAuthFailure(message = "登录已失效，请重新输入后台访问密码。") {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  setAdminVisible(false);
  document.getElementById("loginStatus").textContent = message;
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function textValue(value, fallback = "-") {
  if (Array.isArray(value)) return value.length ? value.join("、") : fallback;
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function renderRecords(records, meta = {}) {
  currentRecords = records;
  const list = document.getElementById("recordList");
  const totalCount = document.getElementById("totalCount");
  const latestTime = document.getElementById("latestTime");
  const statusText = document.getElementById("statusText");

  totalCount.textContent = String(records.length);
  latestTime.textContent = records.length ? formatTime(records[0].createdAt) : "-";
  const sourceText = meta.source === "feishu" ? "飞书多维表格" : "本地缓存";
  statusText.textContent = records.length
    ? `已加载最新登记结果。数据来源：${sourceText}${meta.warning ? `（${meta.warning}）` : ""}`
    : `当前还没有已登记的测评结果。数据来源：${sourceText}${meta.warning ? `（${meta.warning}）` : ""}`;

  list.innerHTML = records.map((record) => {
    const registrant = record.registrant || {};
    const assessment = record.assessment || {};
    const feishuSync = record.feishuSync || {};
    const syncText = feishuSync.ok
      ? `已同步到飞书${feishuSync.recordId ? `（记录 ${feishuSync.recordId}）` : ""}`
      : feishuSync.skipped
        ? "未启用飞书同步"
        : feishuSync.error
          ? `飞书同步失败：${feishuSync.error}`
          : "飞书同步中";
    return `
      <article class="record-card">
        <div class="record-head">
          <div>
            <strong>${registrant.studentName || "未填写姓名"}</strong>
            <p>${registrant.role || "未填写身份"} · ${registrant.contact || "未填写联系方式"}</p>
          </div>
          <div class="record-head-side">
            <span>${formatTime(record.createdAt)}</span>
            <button class="mini-btn" type="button" data-export-record="${escapeHtml(record.id)}">导出此报告</button>
          </div>
        </div>
        <div class="tag-row">
          <span class="tag">${assessment.currentStage || "未生成阶段"}</span>
          <span class="tag">${assessment.background?.level || "未生成背景等级"}</span>
          <span class="tag">${assessment.profile?.primaryInterest || "未填写主方向"}</span>
        </div>
        <div class="record-grid">
          <div>
            <h3>主推荐路径</h3>
            <p>${assessment.recommendations?.main?.direction || "-"}</p>
            <p class="small-note">匹配度 ${assessment.recommendations?.main?.match || "-"}/100</p>
          </div>
          <div>
            <h3>冲刺路径</h3>
            <p>${assessment.recommendations?.stretch?.direction || "-"}</p>
            <p class="small-note">匹配度 ${assessment.recommendations?.stretch?.match || "-"}/100</p>
          </div>
          <div>
            <h3>保底路径</h3>
            <p>${assessment.recommendations?.backup?.direction || "-"}</p>
            <p class="small-note">匹配度 ${assessment.recommendations?.backup?.match || "-"}/100</p>
          </div>
        </div>
        <p class="small-note">邮箱：${registrant.email || "未填写"}${registrant.note ? ` ｜ 备注：${registrant.note}` : ""}</p>
        <p class="small-note">飞书同步：${syncText}</p>
      </article>
    `;
  }).join("");
}

function openPrintableReport(records, statusNode = null) {
  const win = window.open("", "_blank");
  if (!win) {
    if (statusNode) statusNode.textContent = "浏览器拦截了新窗口，请允许弹窗后重试。";
    return;
  }
  win.document.open();
  win.document.write(buildPrintableReport(records));
  win.document.close();
  win.focus();
  window.setTimeout(() => {
    try {
      win.print();
      if (statusNode) statusNode.textContent = `已生成 ${records.length} 份报告打印页，可在新窗口保存为PDF。`;
    } catch (error) {
      console.error(error);
      if (statusNode) statusNode.textContent = "打印窗口已打开，请在新窗口点击“保存为PDF”。";
    }
  }, 500);
}

function buildPrintableReport(records) {
  const now = new Date().toLocaleString("zh-CN", { hour12: false });
  const reportCards = records.map((record, index) => {
    const registrant = record.registrant || {};
    const assessment = record.assessment || {};
    const profile = assessment.profile || {};
    const background = assessment.background || {};
    const recommendations = assessment.recommendations || {};
    const capabilities = assessment.capabilities || {};
    const personality = assessment.personality || {};
    const futureIdentity = assessment.futureIdentity || {};
    const recommendationItems = [
      ["主推荐路径", recommendations.main],
      ["冲刺路径", recommendations.stretch],
      ["保底路径", recommendations.backup]
    ];
    const capabilityItems = Object.entries(capabilities);
    const personalityItems = Object.entries(personality);
    const stages = ["起步探索", "方向明确", "重点补强", "集中准备", "重点冲刺"];
    const stageIndex = Math.max(stages.indexOf(assessment.currentStage), 0);
    const primaryPath = Object.values(recommendations).find((item) => item?.direction === profile.primaryInterest);
    const strongest = capabilityItems.slice().sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 2).map(([key]) => key).join("、") || "核心能力";
    const weakest = capabilityItems.slice().sort((a, b) => Number(a[1]) - Number(b[1])).slice(0, 2).map(([key]) => key).join("、") || "待补强能力";
    const mainDirection = recommendations.main?.direction || "主推荐方向";
    const stageLead = recommendations.main?.direction
      ? `你的主推荐方向是${recommendations.main.direction}，报告会围绕背景竞争力、能力画像、工作方式和行动建议，帮助你判断下一步准备重点。`
      : "报告会围绕背景竞争力、能力画像、工作方式和行动建议，帮助你判断下一步准备重点。";

    return `
      <section class="report-page">
        <header class="report-title">
          <p>职业测评与规划报告</p>
          <h1>${escapeHtml(registrant.studentName || `测评用户${index + 1}`)}</h1>
          <div class="meta-line">
            <span>提交时间：${escapeHtml(formatTime(record.createdAt))}</span>
            <span>身份：${escapeHtml(registrant.role || "-")}</span>
            <span>联系方式：${escapeHtml(registrant.contact || "-")}</span>
          </div>
        </header>
        <div class="summary-strip">
          <div><span>当前阶段</span><strong>${escapeHtml(assessment.currentStage || "-")}</strong></div>
          <div><span>背景等级</span><strong>${escapeHtml(background.level || "-")}</strong></div>
          <div><span>背景分</span><strong>${escapeHtml(textValue(background.score))}</strong></div>
          <div><span>优先方向</span><strong>${escapeHtml(profile.primaryInterest || "-")}</strong></div>
        </div>
        <article class="block report-intro">
          <span>你的职业规划结论</span>
          <h2>${escapeHtml(assessment.currentStage || "职业规划报告")}</h2>
          <p>${escapeHtml(stageLead)}</p>
          <div class="tag-row">
            <b>主推荐方向：${escapeHtml(recommendations.main?.direction || "-")}</b>
            <b>目标方向：${escapeHtml(textValue(profile.interests))}</b>
            <b>背景等级：${escapeHtml(background.level || "-")}</b>
          </div>
        </article>
        ${futureIdentity.title ? `
          <article class="block accent">
            <span>未来身份标签</span>
            <h2>${escapeHtml(futureIdentity.title)}</h2>
            <p>${escapeHtml(futureIdentity.description || "")}</p>
            <p class="tags">${(futureIdentity.keywords || []).map((item) => `<b>${escapeHtml(item)}</b>`).join("")}</p>
          </article>
        ` : ""}
        <article class="block">
          <h2>阶段进度</h2>
          <div class="stage-track">
            ${stages.map((stage, idx) => `
              <div class="stage-node ${idx === stageIndex ? "active" : ""} ${idx < stageIndex ? "done" : ""}">
                <span>${idx + 1}</span>
                <strong>${escapeHtml(stage)}</strong>
              </div>
            `).join("")}
          </div>
          <div class="stage-detail">
            <p><span>当前阶段说明</span>${escapeHtml(assessment.currentStage || "-")}：当前更适合围绕主推荐方向补充项目、实习、简历和面试证据。</p>
            <p><span>下一步重点</span>拆解真实JD，形成定向简历、项目复盘和投递节奏。</p>
          </div>
        </article>
        <article class="block">
          <h2>${profile.primaryInterest ? "你想优先尝试的方向" : "方向探索建议"}</h2>
          <div class="priority-box">
            <div>
              <span>用户意向方向</span>
              <strong>${escapeHtml(profile.primaryInterest || "暂未锁定方向")}</strong>
              <p>${escapeHtml(profile.primaryInterest ? "这是测试者主动选择想优先了解或尝试的方向，不等同于系统判定的唯一最适合方向。" : "测试者暂未锁定方向，系统会先根据能力、背景、专业和工作方式给出探索建议。")}</p>
            </div>
            <div class="priority-metrics">
              <p><span>岗位综合匹配度</span><strong>${escapeHtml(textValue(primaryPath?.match))}/100</strong></p>
              <p><span>专业匹配度</span><strong>${escapeHtml(textValue(primaryPath?.majorScore))}/100</strong></p>
              <p><span>进入难度</span><strong>${escapeHtml(textValue(primaryPath?.entryDifficulty))}</strong></p>
            </div>
          </div>
        </article>
        <article class="block">
          <h2>背景信息</h2>
          <div class="info-grid">
            <p><span>本科</span>${escapeHtml(textValue(profile.undergradSchool))}｜${escapeHtml(textValue(profile.undergradMajor))}｜${escapeHtml(textValue(profile.undergradMajorType))}</p>
            <p><span>研究生</span>${escapeHtml(textValue(profile.gradSchool))}｜${escapeHtml(textValue(profile.gradMajor))}｜${escapeHtml(textValue(profile.gradMajorType))}</p>
            <p><span>博士</span>${escapeHtml(textValue(profile.phdSchool))}｜${escapeHtml(textValue(profile.phdMajor))}｜${escapeHtml(textValue(profile.phdMajorType))}</p>
            <p><span>目标方向</span>${escapeHtml(textValue(profile.interests))}</p>
            <p><span>校园项目</span>${escapeHtml(textValue(profile.projects))}</p>
            <p><span>学校评估</span>${escapeHtml(textValue(background.schoolTierLabel || background.schoolTier))}｜学校分 ${escapeHtml(textValue(background.schoolScore))}</p>
          </div>
        </article>
        <article class="block">
          <h2>职业路径推荐</h2>
          <div class="path-grid">
            ${recommendationItems.map(([label, item]) => `
              <div class="path-card">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(item?.direction || "-")}</strong>
                <p>岗位综合匹配度：${escapeHtml(textValue(item?.match))}/100</p>
                <p>进入难度：${escapeHtml(textValue(item?.entryDifficulty))}</p>
                <p>专业匹配度：${escapeHtml(textValue(item?.majorScore))}/100</p>
                <p>适合岗位：${escapeHtml(textValue(item?.jobs))}</p>
              </div>
            `).join("")}
          </div>
        </article>
        <div class="two-col">
          <article class="block">
            <h2>能力画像</h2>
            ${capabilityItems.length ? capabilityItems.map(([key, score]) => `
              <div class="score-row"><span>${escapeHtml(key)}</span><b>${escapeHtml(score)}/100</b></div>
            `).join("") : "<p>暂无能力画像数据。</p>"}
          </article>
          <article class="block">
            <h2>性格画像</h2>
            ${personalityItems.length ? personalityItems.map(([key, item]) => `
              <div class="score-row"><span>${escapeHtml(key)}</span><b>${escapeHtml(item?.label || item?.dominant || "-")}</b></div>
            `).join("") : "<p>暂无性格画像数据。</p>"}
          </article>
        </div>
        <article class="block">
          <h2>测评结果解读</h2>
          <div class="profile-grid">
            <div>
              <span>背景定位</span>
              <p>当前背景等级为${escapeHtml(background.level || "-")}，背景竞争力分为 ${escapeHtml(textValue(background.score))}/100。学校评估为${escapeHtml(textValue(background.schoolTierLabel || background.schoolTier))}。</p>
            </div>
            <div>
              <span>能力特点</span>
              <p>较突出的能力是${escapeHtml(strongest)}；相对容易被追问的是${escapeHtml(weakest)}。建议用项目、实习、作品或面试案例证明。</p>
            </div>
            <div>
              <span>工作方式</span>
              <p>${escapeHtml(personalityItems.map(([key, item]) => `${key}：${item?.label || item?.dominant || "-"}`).join("；") || "暂无性格画像数据。")}</p>
            </div>
          </div>
        </article>
        <article class="block">
          <h2>未来行动建议</h2>
          <div class="timeline-grid">
            <div><span>未来3个月</span><h3>明确方向并补证据</h3><p>确定1个主申请方向、1个冲刺方向、1个保底方向；完成定向简历；每周拆解2个真实JD；完成1份与${escapeHtml(mainDirection)}相关的项目作品或行业分析。</p></div>
            <div><span>未来6个月</span><h3>形成实习和面试竞争力</h3><p>集中申请相关实习；建立投递表；每周做模拟面试；补齐目标岗位要求的工具、技能和项目表达。</p></div>
            <div><span>未来1年</span><h3>完成路径验证和求职闭环</h3><p>至少积累1段强相关实习或2个可展示项目；根据反馈判断是否坚持主线方向；提前准备秋招/春招批次。</p></div>
          </div>
        </article>
        <article class="block action-card">
          <h2>下一步行动建议</h2>
          <p>建议先领取与你目标方向相关的行业/专业解析资料，例如岗位JD拆解、目标专业就业路径、校招时间线、简历项目模板。</p>
          <p>如果目前存在方向过多、经历包装不足、投递节奏不清晰等情况，建议尽快把重点放在方向收敛、简历重构、项目补强和面试训练上。</p>
        </article>
        <footer class="disclaimer">
          本报告仅用于职业方向探索和求职准备参考，不构成录取承诺、就业保证或升学/求职决策的唯一依据。建议结合个人兴趣、家庭规划、市场变化、招聘要求和专业意见综合判断。
        </footer>
      </section>
    `;
  }).join("");

  return `<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>批量测评报告导出</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #182026; font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif; background: #eef3f6; }
          .toolbar { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 22px; background: #fff; border-bottom: 1px solid #dce4ea; }
          .toolbar p { margin: 0; color: #66727f; font-size: 13px; }
          .toolbar button { min-height: 40px; padding: 9px 16px; color: #fff; font-weight: 800; background: #0f766e; border: 0; border-radius: 8px; cursor: pointer; }
          .report-page { width: min(960px, calc(100% - 32px)); margin: 18px auto; padding: 28px; background: #fff; border: 1px solid #dce4ea; border-radius: 8px; page-break-after: always; }
          .report-page:last-child { page-break-after: auto; }
          .report-title { margin-bottom: 18px; padding-bottom: 16px; border-bottom: 2px solid #dce4ea; }
          .report-title p { margin: 0 0 6px; color: #0f766e; font-size: 12px; font-weight: 900; text-transform: uppercase; }
          .report-title h1 { margin: 0 0 10px; font-size: 30px; line-height: 1.2; }
          .meta-line { display: flex; flex-wrap: wrap; gap: 8px 18px; color: #66727f; font-size: 13px; }
          .summary-strip, .path-grid, .two-col { display: grid; gap: 12px; }
          .summary-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 14px; }
          .summary-strip div, .block, .path-card { padding: 14px; background: #f8fbfc; border: 1px solid #dce4ea; border-radius: 8px; }
          .summary-strip span, .block > span, .path-card span, .info-grid span { display: block; margin-bottom: 6px; color: #66727f; font-size: 12px; font-weight: 800; }
          .summary-strip strong { font-size: 18px; }
          .block { margin-top: 14px; }
          .block h2 { margin: 0 0 10px; font-size: 18px; }
          .block p { margin: 6px 0; color: #354556; font-size: 14px; line-height: 1.65; }
          .accent { background: #eef7f5; border-color: #c9e6e1; }
          .accent h2 { font-size: 24px; }
          .report-intro { background: linear-gradient(135deg, rgba(15,118,110,.08), rgba(37,99,235,.06)); }
          .tag-row { display: flex; flex-wrap: wrap; gap: 8px; }
          .tag-row b { padding: 6px 9px; color: #12343b; font-size: 12px; background: #e7f4f2; border: 1px solid #c9e6e1; border-radius: 999px; }
          .tags { display: flex; flex-wrap: wrap; gap: 8px; }
          .tags b { padding: 6px 9px; color: #12343b; font-size: 12px; background: #fff; border: 1px solid #c9e6e1; border-radius: 999px; }
          .stage-track { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
          .stage-node { padding: 10px; background: #fff; border: 1px solid #dce4ea; border-radius: 8px; opacity: .72; }
          .stage-node.done { background: #f6fbfa; opacity: .92; }
          .stage-node.active { border-color: #0f766e; box-shadow: 0 0 0 2px rgba(15,118,110,.1); opacity: 1; }
          .stage-node span { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-bottom: 8px; color: #12343b; font-size: 12px; font-weight: 900; background: #eef3f6; border-radius: 999px; }
          .stage-node strong { display: block; font-size: 14px; line-height: 1.35; }
          .stage-detail { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 12px; }
          .stage-detail p, .priority-metrics p, .profile-grid div, .timeline-grid div { padding: 12px; background: #fff; border: 1px solid #e1e8ee; border-radius: 8px; }
          .priority-box { display: grid; grid-template-columns: 1.15fr .85fr; gap: 12px; }
          .priority-box strong { display: block; margin: 6px 0; font-size: 22px; }
          .priority-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .priority-metrics p { margin: 0; }
          .priority-metrics strong { font-size: 15px; }
          .profile-grid, .timeline-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
          .profile-grid div > span, .timeline-grid div > span, .stage-detail span, .priority-box span { display: block; margin-bottom: 6px; color: #66727f; font-size: 12px; font-weight: 800; }
          .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; }
          .path-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .path-card strong { display: block; margin-bottom: 8px; font-size: 17px; line-height: 1.35; }
          .two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .score-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #e8eef2; font-size: 14px; }
          .score-row:last-child { border-bottom: 0; }
          .disclaimer { margin-top: 16px; padding: 12px; color: #66727f; font-size: 12px; line-height: 1.7; background: #f6f9fb; border: 1px solid #d9e5eb; border-radius: 8px; }
          @media print {
            @page { size: A4; margin: 12mm; }
            body { background: #fff; }
            .toolbar { display: none; }
            .report-page { width: 100%; margin: 0; padding: 0; border: 0; border-radius: 0; }
            .block, .path-card, .summary-strip div, .disclaimer, .stage-node, .profile-grid div, .timeline-grid div { break-inside: avoid; }
          }
          @media (max-width: 760px) {
            .summary-strip, .path-grid, .two-col, .info-grid, .stage-track, .stage-detail, .priority-box, .priority-metrics, .profile-grid, .timeline-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <p>共 ${records.length} 份测评报告｜生成时间：${escapeHtml(now)}。点击右侧按钮后，在打印窗口选择“保存为PDF”。</p>
          <button onclick="window.print()">保存为PDF</button>
        </div>
        ${reportCards}
      </body>
    </html>`;
}

function exportBatchReports() {
  const status = document.getElementById("exportReportsStatusText");
  if (!currentRecords.length) {
    status.textContent = "当前没有可导出的测评记录，请先刷新数据。";
    return;
  }
  status.textContent = `正在生成 ${currentRecords.length} 份报告打印页...`;
  openPrintableReport(currentRecords, status);
}

function exportSingleReport(recordId) {
  const status = document.getElementById("statusText");
  const record = currentRecords.find((item) => item.id === recordId);
  if (!record) {
    status.textContent = "没有找到这条测评记录，请刷新后重试。";
    return;
  }
  const name = record.registrant?.studentName || "该测试者";
  status.textContent = `正在生成${name}的PDF报告打印页...`;
  openPrintableReport([record], status);
}

async function loadFeishuStatus() {
  const node = document.getElementById("feishuStatusText");
  node.textContent = "正在检查飞书配置...";
  try {
    const response = await fetch(`${API_BASE}/feishu/status`, {
      headers: adminHeaders()
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 503) {
      handleAuthFailure(data.error);
      return;
    }
    if (!data.enabled) {
      node.textContent = "当前未配置飞书同步。请先在 backend/.env 中填写飞书参数并重启本地服务。";
      return;
    }
    node.textContent = `飞书同步已启用，当前目标为 ${data.baseUrl}，多维表参数已配置。`;
  } catch (error) {
    console.error(error);
    node.textContent = "飞书状态检查失败，请确认本地后台服务正在运行。";
  }
}

async function runFeishuBackfill() {
  const node = document.getElementById("backfillStatusText");
  node.textContent = "正在补同步历史记录到飞书...";
  try {
    const response = await fetch(`${API_BASE}/feishu/backfill`, {
      method: "POST",
      headers: adminHeaders()
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 503) {
      handleAuthFailure(data.error);
      return;
    }
    if (!response.ok || !data.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    node.textContent = `补同步完成：成功 ${data.synced} 条，失败 ${data.failed} 条。`;
    loadRecords();
  } catch (error) {
    console.error(error);
    node.textContent = `补同步失败：${error.message || "请检查飞书配置"}`;
  }
}

async function loadRecords() {
  const statusText = document.getElementById("statusText");
  statusText.textContent = "正在加载后台登记结果...";
  try {
    const response = await fetch(`${API_BASE}/assessment-records`, {
      headers: adminHeaders()
    });
    const data = await response.json();
    if (response.status === 401 || response.status === 503) {
      handleAuthFailure(data.error);
      return;
    }
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    renderRecords(data.records || [], { source: data.source, warning: data.warning });
  } catch (error) {
    console.error(error);
    statusText.textContent = `加载失败：${error.message || "请确认后台服务正在运行"}`;
  }
}

async function loginAdmin(password) {
  const status = document.getElementById("loginStatus");
  status.textContent = "正在验证后台密码...";
  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (!response.ok || !data.ok || !data.token) {
      throw new Error(data.error || "登录失败");
    }
    sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    status.textContent = "";
    setAdminVisible(true);
    await Promise.all([loadRecords(), loadFeishuStatus()]);
  } catch (error) {
    console.error(error);
    status.textContent = error.message || "登录失败，请稍后重试。";
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadRecords);
document.getElementById("checkFeishuBtn").addEventListener("click", loadFeishuStatus);
document.getElementById("backfillBtn").addEventListener("click", runFeishuBackfill);
document.getElementById("exportReportsBtn").addEventListener("click", exportBatchReports);
document.getElementById("recordList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-export-record]");
  if (!button) return;
  exportSingleReport(button.dataset.exportRecord);
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  handleAuthFailure("已退出后台。");
});
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const password = document.getElementById("passwordInput").value.trim();
  if (!password) {
    document.getElementById("loginStatus").textContent = "请先输入后台访问密码。";
    return;
  }
  loginAdmin(password);
});

setAdminVisible(Boolean(adminToken()));
if (adminToken()) {
  loadRecords();
  loadFeishuStatus();
}
