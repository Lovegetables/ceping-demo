const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { once } = require("node:events");

const root = path.resolve(__dirname, "..");

async function main() {
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const apiResolver = appSource.slice(appSource.indexOf("function resolveAssessmentApiBase("), appSource.indexOf("const ASSESSMENT_API_BASE"));
  const context = vm.createContext({});
  vm.runInContext(apiResolver, context);
  const resolve = context.resolveAssessmentApiBase;
  assert.equal(resolve(new URL("https://lovegetables.github.io/ceping-demo/")), "https://career-assessment-h5.onrender.com");
  assert.equal(resolve(new URL("https://lovegetables.github.io/ceping-demo/index.html")), "https://career-assessment-h5.onrender.com");
  assert.equal(resolve(new URL("https://career-assessment-h5.onrender.com/")), "https://career-assessment-h5.onrender.com");
  assert.equal(resolve(new URL("http://127.0.0.1:8787/")), "http://127.0.0.1:8787");
  assert.equal(resolve(new URL("file:///tmp/index.html")), "http://127.0.0.1:8787");
  assert.equal(resolve(new URL("https://example.com/"), "https://api.example.com/"), "https://api.example.com");
  assert.equal(resolve(new URL("https://lovegetables.github.io/another-project/")), "https://lovegetables.github.io");

  // Exercise the real admin renderer with untrusted record fields.
  const nodes = new Map();
  const adminContext = vm.createContext({
    document: { getElementById: (id) => {
      if (!nodes.has(id)) nodes.set(id, {});
      return nodes.get(id);
    } },
    formatTime: (value) => value,
    recordSubmittedAt: (record) => record.createdAt,
    currentRecords: []
  });
  const adminSource = fs.readFileSync(path.join(root, "backend/admin.js"), "utf8");
  vm.runInContext(adminSource.slice(adminSource.indexOf("function escapeHtml("), adminSource.indexOf("function openPrintableReport(")), adminContext);
  const injection = '<img src=x onerror="window.injected=true"><script>window.injected=true</script>';
  adminContext.renderRecords([{
    id: injection,
    createdAt: injection,
    registrant: Object.fromEntries(["studentName", "role", "contact", "email", "note"].map((key) => [key, injection])),
    assessment: {
      currentStage: injection,
      background: { level: injection },
      profile: { primaryInterest: injection },
      recommendations: Object.fromEntries(["main", "stretch", "backup"].map((key) => [key, { direction: injection, match: injection }]))
    },
    feishuSync: { error: injection }
  }]);
  const rendered = nodes.get("recordList").innerHTML;
  assert(!rendered.includes("<img"));
  assert(!rendered.includes("<script"));
  assert(rendered.includes("&lt;img"));

  // Isolate all writes and credentials from real assessment records and Feishu.
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "career-web-access-"));
  fs.mkdirSync(path.join(fixture, "backend/data"), { recursive: true });
  fs.mkdirSync(path.join(fixture, ".git"));
  for (const file of ["index.html", "app.js", "styles.css", "schools-data.js", "school-tier-data.js", "school-ranking-data.js", "server.js", "backend/server.js", "backend/admin.html", "backend/admin.js", "backend/admin.css"]) {
    fs.copyFileSync(path.join(root, file), path.join(fixture, file));
  }
  fs.writeFileSync(path.join(fixture, "backend/.env"), "PRIVATE_FIXTURE=secret");
  fs.writeFileSync(path.join(fixture, "backend/data/assessment-records.json"), "[]");
  for (const file of ["assessment-records.json", ".git/config", "PROJECT_HISTORY.md"]) fs.writeFileSync(path.join(fixture, file), "private fixture");
  const listener = net.createServer();
  listener.listen(0, "127.0.0.1");
  await once(listener, "listening");
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const child = spawn(process.execPath, [path.join(fixture, "server.js")], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), ADMIN_PASSWORD: "fixture-only-password", FEISHU_APP_ID: "", FEISHU_APP_SECRET: "", FEISHU_BITABLE_APP_TOKEN: "", FEISHU_BITABLE_TABLE_ID: "" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  try {
    await Promise.race([
      once(child.stdout, "data"),
      once(child, "exit").then(([code]) => { throw new Error(`Fixture server exited: ${code}`); }),
      new Promise((_, reject) => { setTimeout(() => reject(new Error("Fixture server startup timed out")), 5000).unref(); })
    ]);
    const base = `http://127.0.0.1:${port}`;
    for (const pathname of ["/", "/index.html", "/app.js", "/styles.css", "/schools-data.js", "/school-tier-data.js", "/school-ranking-data.js", "/admin.html", "/admin.js", "/admin.css", "/api/health"]) {
      for (const method of ["GET", "HEAD"]) {
        const response = await fetch(base + pathname, { method });
        assert.equal(response.status, 200, `${method} ${pathname}`);
        assert.equal(response.headers.get("x-content-type-options"), "nosniff");
        if (method === "HEAD") assert.equal(await response.text(), "");
        else await response.arrayBuffer();
      }
    }
    for (const pathname of ["/backend/.env", "/.git/config", "/backend/data/assessment-records.json", "/assessment-records.json", "/backend/server.js", "/server.js", "/PROJECT_HISTORY.md", "/backend/../backend/.env", "/%62ackend/data/assessment-records.json"]) {
      const response = await fetch(base + pathname);
      assert.equal(response.status, 404, pathname);
      assert(!String(await response.text()).includes("private fixture"));
    }
    const preflight = await fetch(base + "/api/assessment-records", { method: "OPTIONS", headers: { Origin: "https://lovegetables.github.io", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "*");
    assert.equal((await fetch(base + "/api/assessment-records")).status, 401);
    const submission = await fetch(base + "/api/assessment-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrant: { studentName: "隔离回归测试" }, assessment: { currentStage: "测试" } }) });
    assert.equal(submission.status, 201);
    const submitted = await submission.json();
    assert(submitted.recordId);
    assert.equal(submitted.feishuSync.skipped, true);
    const login = await fetch(base + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "fixture-only-password" }) });
    const { token } = await login.json();
    const records = await (await fetch(base + "/api/assessment-records", { headers: { Authorization: `Bearer ${token}` } })).json();
    assert.equal(records.total, 1);
    assert.equal(records.records[0].registrant.studentName, "隔离回归测试");
    console.log("Passed: API routing, admin injection escaping, public assets, HEAD, private-file isolation, CORS, registration, and admin authentication.");
  } finally {
    child.kill();
    await once(child, "exit");
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
