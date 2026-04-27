const API_BASE = `${window.location.origin}/api`;
const ADMIN_TOKEN_KEY = "careerAssessmentAdminToken";

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

function renderRecords(records) {
  const list = document.getElementById("recordList");
  const totalCount = document.getElementById("totalCount");
  const latestTime = document.getElementById("latestTime");
  const statusText = document.getElementById("statusText");

  totalCount.textContent = String(records.length);
  latestTime.textContent = records.length ? formatTime(records[0].createdAt) : "-";
  statusText.textContent = records.length ? "已加载最新登记结果。" : "当前还没有已登记的测评结果。";

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
          <span>${formatTime(record.createdAt)}</span>
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
    renderRecords(data.records || []);
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
