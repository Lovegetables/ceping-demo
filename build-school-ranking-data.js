const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const schoolsPath = path.join(root, "schools-data.js");
const rankingPath = path.join(root, "school-ranking-data.js");
const inputDir = path.join(root, "ranking-input");

function readWindowArray(filePath, varName) {
  const text = fs.readFileSync(filePath, "utf8");
  const prefix = `window.${varName} = `;
  return JSON.parse(text.replace(prefix, "").replace(/;\s*$/, ""));
}

function readWindowObject(filePath, varName) {
  const text = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  Function("window", text)(sandbox.window);
  return sandbox.window[varName];
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (!quoted && ch === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

function toNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  const first = raw.match(/\d+/);
  return first ? Number(first[0]) : undefined;
}

function splitList(value) {
  return String(value || "")
    .split(/[;|、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readRankingInputs() {
  if (!fs.existsSync(inputDir)) return [];
  return fs.readdirSync(inputDir)
    .filter((file) => file.endsWith(".csv") && !file.includes("template"))
    .flatMap((file) => {
      const rows = parseCsv(fs.readFileSync(path.join(inputDir, file), "utf8"));
      const headers = rows.shift().map((h) => h.trim().toLowerCase());
      return rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i] || ""])));
    });
}

function normalizeName(name, aliases) {
  const raw = String(name || "").trim();
  return aliases[raw] || raw;
}

function mergeSchool(base, patch) {
  const aliases = new Set([...(base.aliases || []), ...(patch.aliases || [])].filter(Boolean));
  const labels = new Set([...(base.labels || []), ...(patch.labels || [])].filter(Boolean));
  const sources = new Set([...(base.sources || []), ...(patch.sources || [])].filter(Boolean));
  const rankingYears = new Set([...(base.rankingYears || []), base.rankingYear, ...(patch.rankingYears || []), patch.rankingYear].filter(Boolean));
  const sourceNotes = new Set([...(base.sourceNotes || []), base.sourceNote, ...(patch.sourceNotes || []), patch.sourceNote].filter(Boolean));
  const definedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  return {
    ...base,
    ...definedPatch,
    aliases: Array.from(aliases).sort(),
    labels: Array.from(labels).sort(),
    sources: Array.from(sources).sort(),
    rankingYears: Array.from(rankingYears).sort(),
    sourceNotes: Array.from(sourceNotes).sort()
  };
}

const schools = readWindowArray(schoolsPath, "externalSchoolDirectory");
const current = readWindowObject(rankingPath, "schoolRankingData");
const aliases = current.aliases || {};
const seedByName = new Map();

for (const school of schools) {
  const canonical = normalizeName(school.name, aliases);
  const existing = seedByName.get(canonical) || {
    name: canonical,
    country: school.country,
    region: school.region,
    aliases: []
  };
  seedByName.set(canonical, mergeSchool(existing, {
    name: canonical,
    country: existing.country || school.country,
    region: existing.region || school.region,
    aliases: [school.name, ...(school.aliases || [])].filter((item) => item !== canonical)
  }));
}

for (const ranked of current.schools || []) {
  const canonical = normalizeName(ranked.name, aliases);
  const existing = seedByName.get(canonical) || { name: canonical, aliases: [] };
  seedByName.set(canonical, mergeSchool(existing, { ...ranked, name: canonical, aliases: [ranked.name, ...(ranked.aliases || [])].filter((item) => item !== canonical) }));
}

for (const row of readRankingInputs()) {
  const name = normalizeName(row.name || row.school || row.institution, aliases);
  if (!name) continue;
  const existing = seedByName.get(name) || { name, aliases: [] };
  seedByName.set(name, mergeSchool(existing, {
    name,
    qs: toNumber(row.qs || row.qs_rank),
    the: toNumber(row.the || row.the_rank),
    usnews: toNumber(row.usnews || row.us_news || row.usnews_rank),
    arwu: toNumber(row.arwu || row.arwu_rank),
    employer: toNumber(row.employer || row.employer_score),
    labels: splitList(row.labels),
    aliases: splitList(row.aliases),
    sources: splitList(row.sources || row.source),
    rankingYear: toNumber(row.ranking_year || row.year),
    sourceNote: row.source_note || row.note || undefined
  }));
}

const output = {
  note: "Full ranking seed library. Each school has a ranking record; missing QS/THE/U.S. News/ARWU fields are intentionally blank and fall back to tier/type scoring. Refresh ranking fields yearly from licensed or otherwise authorized sources.",
  algorithm: {
    rankWeights: { qs: 0.3, the: 0.25, usnews: 0.25, arwu: 0.2 },
    finalWeights: { rankingScore: 0.45, employerRecognition: 0.35, schoolLabel: 0.2 },
    confidence: { high: "3-4 ranking sources", medium: "2 ranking sources", low: "1 ranking source" }
  },
  aliases,
  schools: Array.from(seedByName.values())
    .map((school) => {
      const cleaned = { ...school };
      for (const key of ["qs", "the", "usnews", "arwu", "employer"]) {
        if (cleaned[key] === undefined || cleaned[key] === null || cleaned[key] === "") delete cleaned[key];
      }
      if (!cleaned.labels?.length) delete cleaned.labels;
      if (!cleaned.aliases?.length) delete cleaned.aliases;
      if (!cleaned.sources?.length) delete cleaned.sources;
      if (!cleaned.sourceNotes?.length) delete cleaned.sourceNotes;
      if (!cleaned.rankingYears?.length) delete cleaned.rankingYears;
      delete cleaned.sourceNote;
      delete cleaned.rankingYear;
      return cleaned;
    })
    .sort((a, b) => (a.region || a.country || "").localeCompare(b.region || b.country || "") || a.name.localeCompare(b.name))
};

fs.writeFileSync(rankingPath, `window.schoolRankingData = ${JSON.stringify(output, null, 2)};\n`, "utf8");
console.log(`Wrote ${output.schools.length} ranking seed records to ${rankingPath}`);
