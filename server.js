const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID, timingSafeEqual } = require("crypto");

const APP_ROOT = fs.existsSync(path.join(__dirname, "index.html"))
  ? __dirname
  : path.resolve(__dirname, "..");
const BACKEND_ROOT = fs.existsSync(path.join(APP_ROOT, "backend"))
  ? path.join(APP_ROOT, "backend")
  : APP_ROOT;
const ROOT = APP_ROOT;
const ENV_FILE = path.join(BACKEND_ROOT, ".env");

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return;
  const content = fs.readFileSync(ENV_FILE, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (key && !Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(BACKEND_ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "assessment-records.json");
const FEISHU_BASE_URL = process.env.FEISHU_BASE_URL || "https://open.feishu.cn";
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || "";
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || "";
const FEISHU_BITABLE_APP_TOKEN = process.env.FEISHU_BITABLE_APP_TOKEN || "";
const FEISHU_BITABLE_TABLE_ID = process.env.FEISHU_BITABLE_TABLE_ID || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_TOKEN = randomUUID();

let feishuTokenCache = {
  token: "",
  expiresAt: 0
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function readRecords() {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeRecords(records) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf8");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(payload));
}

function safeEqualText(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function adminAuthEnabled() {
  return Boolean(ADMIN_PASSWORD);
}

function isAdminRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(token && safeEqualText(token, ADMIN_TOKEN));
}

function requireAdmin(req, res) {
  if (!adminAuthEnabled()) {
    sendJson(res, 503, {
      ok: false,
      error: "后台访问密码尚未配置，请在 Render 环境变量中设置 ADMIN_PASSWORD 后重新部署。"
    });
    return false;
  }
  if (!isAdminRequest(req)) {
    sendJson(res, 401, { ok: false, error: "需要后台访问权限" });
    return false;
  }
  return true;
}

function sendFile(res, filePath, contentType = "text/html; charset=utf-8") {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*"
    });
    res.end(content);
  });
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const table = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
  };
  return table[ext] || "application/octet-stream";
}

function trySendStaticAsset(res, pathname) {
  const normalized = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(normalized).replace(/^(\.\.[/\\])+/, "");
  const target = path.join(ROOT, safePath);

  if (!target.startsWith(ROOT)) return false;
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return false;

  sendFile(res, target, contentTypeFor(target));
  return true;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function hasFeishuConfig() {
  return !!(FEISHU_APP_ID && FEISHU_APP_SECRET && FEISHU_BITABLE_APP_TOKEN && FEISHU_BITABLE_TABLE_ID);
}

function compactText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join("、");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function formatCapabilities(capabilities = {}) {
  return Object.entries(capabilities)
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => `${key}:${score}`)
    .join(" | ");
}

function formatPersonality(personality = {}) {
  return Object.entries(personality)
    .map(([key, item]) => `${key}:${item.label || item.dominant || "-"}`)
    .join(" | ");
}

function buildFeishuFields(record) {
  const registrant = record.registrant || {};
  const assessment = record.assessment || {};
  const background = assessment.background || {};
  const profile = assessment.profile || {};
  const recommendations = assessment.recommendations || {};

  return {
    "文本": `${registrant.studentName || "未命名用户"}｜${assessment.currentStage || "未生成阶段"}｜${recommendations.main?.direction || "未生成推荐"}`,
    "记录ID": record.id,
    "提交时间": record.createdAt,
    "来源": record.source || "unknown",
    "姓名/称呼": registrant.studentName || "",
    "联系方式": registrant.contact || "",
    "邮箱": registrant.email || "",
    "身份": registrant.role || "",
    "当前阶段": assessment.currentStage || "",
    "背景等级": background.level || "",
    "背景分": compactText(background.score),
    "学校层级": background.schoolTierLabel || background.schoolTier || "",
    "学校得分": compactText(background.schoolScore),
    "排名得分": compactText(background.rankingScore),
    "目标方向": compactText(profile.interests),
    "优先方向": profile.primaryInterest || "",
    "主推荐路径": recommendations.main?.direction || "",
    "主推荐匹配度": compactText(recommendations.main?.match),
    "冲刺路径": recommendations.stretch?.direction || "",
    "冲刺匹配度": compactText(recommendations.stretch?.match),
    "保底路径": recommendations.backup?.direction || "",
    "保底匹配度": compactText(recommendations.backup?.match),
    "本科院校": profile.undergradSchool || "",
    "本科专业": profile.undergradMajor || "",
    "本科专业类型": profile.undergradMajorType || "",
    "研究生院校": profile.gradSchool || "",
    "研究生专业": profile.gradMajor || "",
    "研究生专业类型": profile.gradMajorType || "",
    "博士院校": profile.phdSchool || "",
    "博士专业": profile.phdMajor || "",
    "博士专业类型": profile.phdMajorType || "",
    "实习经历": profile.internship || "",
    "项目经历": compactText(profile.projects),
    "能力画像": formatCapabilities(assessment.capabilities),
    "性格画像": formatPersonality(assessment.personality),
    "完整结果JSON": JSON.stringify(record.assessment || {}, null, 2)
  };
}

async function getFeishuTenantAccessToken() {
  if (feishuTokenCache.token && Date.now() < feishuTokenCache.expiresAt) {
    return feishuTokenCache.token;
  }

  const response = await fetch(`${FEISHU_BASE_URL}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    })
  });

  const result = await response.json();
  if (!response.ok || result.code !== 0 || !result.tenant_access_token) {
    throw new Error(result.msg || `Feishu auth failed: HTTP ${response.status}`);
  }

  const expiresIn = Number(result.expire || 7200);
  feishuTokenCache = {
    token: result.tenant_access_token,
    expiresAt: Date.now() + Math.max(expiresIn - 180, 300) * 1000
  };
  return feishuTokenCache.token;
}

async function syncRecordToFeishu(record) {
  if (!hasFeishuConfig()) {
    return {
      ok: false,
      skipped: true,
      syncedAt: null,
      recordId: null,
      error: "Feishu config missing"
    };
  }

  const tenantAccessToken = await getFeishuTenantAccessToken();
  const response = await fetch(
    `${FEISHU_BASE_URL}/open-apis/bitable/v1/apps/${FEISHU_BITABLE_APP_TOKEN}/tables/${FEISHU_BITABLE_TABLE_ID}/records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${tenantAccessToken}`
      },
      body: JSON.stringify({
        fields: buildFeishuFields(record)
      })
    }
  );

  const result = await response.json();
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || `Feishu sync failed: HTTP ${response.status}`);
  }

  return {
    ok: true,
    skipped: false,
    syncedAt: new Date().toISOString(),
    recordId: result.data?.record?.record_id || null,
    error: ""
  };
}

function normalizeFeishuValue(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item === null || item === undefined) return "";
      if (typeof item === "object") return item.text || item.name || item.value || "";
      return String(item);
    }).filter(Boolean).join("");
  }
  if (typeof value === "object") return value.text || value.name || value.value || JSON.stringify(value);
  return String(value);
}

function parseFeishuAssessment(fields) {
  const rawJson = normalizeFeishuValue(fields["完整结果JSON"]);
  if (rawJson) {
    try {
      return JSON.parse(rawJson);
    } catch (error) {
      console.warn("Failed to parse Feishu assessment JSON:", error.message);
    }
  }

  return {
    currentStage: normalizeFeishuValue(fields["当前阶段"]),
    background: {
      level: normalizeFeishuValue(fields["背景等级"]),
      score: Number(normalizeFeishuValue(fields["背景分"])) || null,
      schoolTierLabel: normalizeFeishuValue(fields["学校层级"]),
      schoolScore: Number(normalizeFeishuValue(fields["学校得分"])) || null,
      rankingScore: Number(normalizeFeishuValue(fields["排名得分"])) || null
    },
    profile: {
      interests: normalizeFeishuValue(fields["目标方向"]),
      primaryInterest: normalizeFeishuValue(fields["优先方向"]),
      undergradSchool: normalizeFeishuValue(fields["本科院校"]),
      undergradMajor: normalizeFeishuValue(fields["本科专业"]),
      undergradMajorType: normalizeFeishuValue(fields["本科专业类型"]),
      gradSchool: normalizeFeishuValue(fields["研究生院校"]),
      gradMajor: normalizeFeishuValue(fields["研究生专业"]),
      gradMajorType: normalizeFeishuValue(fields["研究生专业类型"]),
      phdSchool: normalizeFeishuValue(fields["博士院校"]),
      phdMajor: normalizeFeishuValue(fields["博士专业"]),
      phdMajorType: normalizeFeishuValue(fields["博士专业类型"]),
      internship: normalizeFeishuValue(fields["实习经历"]),
      projects: normalizeFeishuValue(fields["项目经历"])
    },
    recommendations: {
      main: {
        direction: normalizeFeishuValue(fields["主推荐路径"]),
        match: Number(normalizeFeishuValue(fields["主推荐匹配度"])) || null
      },
      stretch: {
        direction: normalizeFeishuValue(fields["冲刺路径"]),
        match: Number(normalizeFeishuValue(fields["冲刺匹配度"])) || null
      },
      backup: {
        direction: normalizeFeishuValue(fields["保底路径"]),
        match: Number(normalizeFeishuValue(fields["保底匹配度"])) || null
      }
    }
  };
}

function feishuItemToRecord(item) {
  const fields = item.fields || {};
  const assessment = parseFeishuAssessment(fields);
  return {
    id: normalizeFeishuValue(fields["记录ID"]) || item.record_id,
    createdAt: normalizeFeishuValue(fields["提交时间"]) || item.created_time || "",
    source: normalizeFeishuValue(fields["来源"]) || "feishu",
    registrant: {
      studentName: normalizeFeishuValue(fields["姓名/称呼"]),
      contact: normalizeFeishuValue(fields["联系方式"]),
      email: normalizeFeishuValue(fields["邮箱"]),
      role: normalizeFeishuValue(fields["身份"]),
      note: ""
    },
    assessment,
    feishuSync: {
      ok: true,
      skipped: false,
      syncedAt: "",
      recordId: item.record_id || null,
      error: ""
    }
  };
}

async function fetchRecordsFromFeishu() {
  if (!hasFeishuConfig()) return null;
  const tenantAccessToken = await getFeishuTenantAccessToken();
  const allItems = [];
  let pageToken = "";

  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (pageToken) query.set("page_token", pageToken);
    const response = await fetch(
      `${FEISHU_BASE_URL}/open-apis/bitable/v1/apps/${FEISHU_BITABLE_APP_TOKEN}/tables/${FEISHU_BITABLE_TABLE_ID}/records?${query.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${tenantAccessToken}` }
      }
    );
    const result = await response.json();
    if (!response.ok || result.code !== 0) {
      throw new Error(result.msg || `Feishu records fetch failed: HTTP ${response.status}`);
    }
    allItems.push(...(result.data?.items || []));
    pageToken = result.data?.page_token || "";
  } while (pageToken);

  return allItems
    .map(feishuItemToRecord)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateRecordSyncMeta(recordId, feishuSync) {
  const records = readRecords();
  const next = records.map((item) => (item.id === recordId ? { ...item, feishuSync } : item));
  writeRecords(next);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "assessment-registration", port: PORT });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    try {
      if (!adminAuthEnabled()) {
        sendJson(res, 503, {
          ok: false,
          error: "后台访问密码尚未配置，请在 Render 环境变量中设置 ADMIN_PASSWORD 后重新部署。"
        });
        return;
      }
      const payload = await parseBody(req);
      if (!safeEqualText(payload.password, ADMIN_PASSWORD)) {
        sendJson(res, 401, { ok: false, error: "后台密码不正确" });
        return;
      }
      sendJson(res, 200, { ok: true, token: ADMIN_TOKEN });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message || "Invalid payload" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/assessment-records") {
    if (!requireAdmin(req, res)) return;
    try {
      const recordsFromFeishu = await fetchRecordsFromFeishu();
      const records = recordsFromFeishu || readRecords().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      sendJson(res, 200, {
        total: records.length,
        source: recordsFromFeishu ? "feishu" : "local",
        records
      });
    } catch (error) {
      console.error(error);
      const records = readRecords().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      sendJson(res, 200, {
        total: records.length,
        source: "local",
        warning: `飞书记录读取失败，已回退到本地缓存：${error.message || "Unknown error"}`,
        records
      });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/feishu/status") {
    if (!requireAdmin(req, res)) return;
    sendJson(res, 200, {
      enabled: hasFeishuConfig(),
      baseUrl: FEISHU_BASE_URL,
      appTokenConfigured: !!FEISHU_BITABLE_APP_TOKEN,
      tableIdConfigured: !!FEISHU_BITABLE_TABLE_ID
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/assessment-records") {
    try {
      const payload = await parseBody(req);
      const record = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        feishuSync: hasFeishuConfig()
          ? { ok: false, skipped: false, syncedAt: null, recordId: null, error: "pending" }
          : { ok: false, skipped: true, syncedAt: null, recordId: null, error: "Feishu config missing" },
        ...payload
      };
      const records = readRecords();
      records.push(record);
      writeRecords(records);

      if (hasFeishuConfig()) {
        try {
          const feishuSync = await syncRecordToFeishu(record);
          updateRecordSyncMeta(record.id, feishuSync);
          sendJson(res, 201, { ok: true, recordId: record.id, feishuSync });
        } catch (error) {
          const feishuSync = {
            ok: false,
            skipped: false,
            syncedAt: null,
            recordId: null,
            error: error.message || "Feishu sync failed"
          };
          updateRecordSyncMeta(record.id, feishuSync);
          sendJson(res, 201, { ok: true, recordId: record.id, feishuSync });
        }
        return;
      }

      sendJson(res, 201, { ok: true, recordId: record.id, feishuSync: record.feishuSync });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message || "Invalid payload" });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/feishu/backfill") {
    if (!requireAdmin(req, res)) return;
    if (!hasFeishuConfig()) {
      sendJson(res, 400, { ok: false, error: "Feishu config missing" });
      return;
    }

    try {
      const records = readRecords();
      let synced = 0;
      let failed = 0;

      for (const record of records) {
        if (record.feishuSync?.ok && record.feishuSync?.recordId) continue;
        try {
          const feishuSync = await syncRecordToFeishu(record);
          updateRecordSyncMeta(record.id, feishuSync);
          synced += 1;
        } catch (error) {
          updateRecordSyncMeta(record.id, {
            ok: false,
            skipped: false,
            syncedAt: null,
            recordId: null,
            error: error.message || "Feishu sync failed"
          });
          failed += 1;
        }
      }

      sendJson(res, 200, { ok: true, synced, failed });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: error.message || "Backfill failed" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.html") {
    sendFile(res, path.join(BACKEND_ROOT, "admin.html"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.js") {
    sendFile(res, path.join(BACKEND_ROOT, "admin.js"), "application/javascript; charset=utf-8");
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.css") {
    sendFile(res, path.join(BACKEND_ROOT, "admin.css"), "text/css; charset=utf-8");
    return;
  }

  if (req.method === "GET" && trySendStaticAsset(res, url.pathname)) {
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, HOST, () => {
  ensureStore();
  console.log(`Assessment registration server running at http://${HOST}:${PORT}`);
});
