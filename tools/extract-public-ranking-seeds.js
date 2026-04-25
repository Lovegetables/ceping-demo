const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "ranking-input", "public-ranking-seeds-2026.csv");

const sources = {
  qs: {
    year: 2026,
    name: "QS World University Rankings 2026 public top-10 article",
    url: "https://static.qs.com/insights/articles/qs-world-university-rankings-results/",
    rows: [
      [1, "Massachusetts Institute of Technology"],
      [2, "Imperial College London"],
      [3, "Stanford University"],
      [4, "University of Oxford"],
      [5, "Harvard University"],
      [6, "University of Cambridge"],
      [7, "ETH Zurich"],
      [8, "National University of Singapore"],
      [9, "University College London"],
      [10, "California Institute of Technology"]
    ]
  },
  the: {
    year: 2026,
    name: "Times Higher Education World University Rankings 2026 public ranking page",
    url: "https://www.timeshighereducation.com/world-university-rankings/latest/world-ranking",
    htmlPath: "/tmp/the-ranking.html",
    limit: 200
  },
  arwu: {
    year: 2025,
    name: "ARWU 2025 public ranking page first page",
    url: "https://www.shanghairanking.com/rankings/arwu/2025",
    htmlPath: "/tmp/arwu-ranking.html",
    limit: 30
  }
};

function cleanRank(value) {
  const raw = String(value || "").replace(/^=/, "").trim();
  const first = raw.match(/\d+/);
  return first ? Number(first[0]) : undefined;
}

function decodeHtml(text) {
  return String(text || "")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function csvCell(value) {
  const raw = String(value ?? "");
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function parseThe(htmlPath, limit) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, "utf8");
  const rows = [];
  const seen = new Set();
  const regex = /"rank":"([^"]+)","name":"([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    const rank = cleanRank(match[1]);
    const name = decodeHtml(match[2]);
    if (!rank || rank > limit || seen.has(name)) continue;
    seen.add(name);
    rows.push([rank, name]);
  }
  return rows.sort((a, b) => a[0] - b[0]).slice(0, limit);
}

function parseArwu(htmlPath, limit) {
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, "utf8");
  const rows = [];
  const regex = /<div class="ranking[^"]*"[^>]*>\s*([^<]+)\s*<\/div>[\s\S]*?<span class="univ-name"[^>]*>\s*([^<]+)\s*<\/span>/g;
  let match;
  while ((match = regex.exec(html))) {
    const rank = cleanRank(match[1]);
    const name = decodeHtml(match[2]);
    if (!rank || rank > limit) continue;
    rows.push([rank, name]);
  }
  return rows.slice(0, limit);
}

const rows = [
  ["name", "qs", "the", "usnews", "arwu", "employer", "labels", "aliases", "source", "ranking_year", "source_note"]
];

for (const [rank, name] of sources.qs.rows) {
  rows.push([name, rank, "", "", "", "", "public-seed", "", sources.qs.url, sources.qs.year, sources.qs.name]);
}

const theRows = parseThe(sources.the.htmlPath, sources.the.limit);
for (const [rank, name] of theRows) {
  rows.push([name, "", rank, "", "", "", "public-seed", "", sources.the.url, sources.the.year, sources.the.name]);
}

const arwuRows = parseArwu(sources.arwu.htmlPath, sources.arwu.limit);
for (const [rank, name] of arwuRows) {
  rows.push([name, "", "", "", rank, "", "public-seed", "", sources.arwu.url, sources.arwu.year, sources.arwu.name]);
}

fs.writeFileSync(outputPath, rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(`Wrote ${rows.length - 1} public ranking seed rows to ${outputPath}`);
console.log(`QS rows: ${sources.qs.rows.length}`);
console.log(`THE rows: ${theRows.length}`);
console.log(`ARWU rows: ${arwuRows.length}`);
