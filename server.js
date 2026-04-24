const http = require("http");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "backend", "data");
const DATA_FILE = path.join(DATA_DIR, "assessment-records.json");

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
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
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

  if (req.method === "GET" && url.pathname === "/api/assessment-records") {
    const records = readRecords().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendJson(res, 200, { total: records.length, records });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/assessment-records") {
    try {
      const payload = await parseBody(req);
      const record = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...payload
      };
      const records = readRecords();
      records.push(record);
      writeRecords(records);
      sendJson(res, 201, { ok: true, recordId: record.id });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message || "Invalid payload" });
    }
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.html") {
    sendFile(res, path.join(ROOT, "backend", "admin.html"));
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.js") {
    sendFile(res, path.join(ROOT, "backend", "admin.js"), "application/javascript; charset=utf-8");
    return;
  }

  if (req.method === "GET" && url.pathname === "/admin.css") {
    sendFile(res, path.join(ROOT, "backend", "admin.css"), "text/css; charset=utf-8");
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, HOST, () => {
  ensureStore();
  console.log(`Assessment registration server running at http://${HOST}:${PORT}`);
});
