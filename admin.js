const API_BASE = `${window.location.origin}/api`;

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
      </article>
    `;
  }).join("");
}

async function loadRecords() {
  const statusText = document.getElementById("statusText");
  statusText.textContent = "正在加载后台登记结果...";
  try {
    const response = await fetch(`${API_BASE}/assessment-records`);
    const data = await response.json();
    renderRecords(data.records || []);
  } catch (error) {
    console.error(error);
    statusText.textContent = "加载失败，请先确认本地后台服务已经启动。";
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadRecords);
loadRecords();
