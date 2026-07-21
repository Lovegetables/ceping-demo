const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {
  window: {
    location: {
      protocol: "https:",
      origin: "https://school-data-check.invalid"
    }
  },
  console
};

vm.createContext(context);
["schools-data.js", "school-tier-data.js", "school-ranking-data.js"].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
});

const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const scoringSource = appSource.split('document.getElementById("prevBtn").addEventListener')[0];
vm.runInContext(scoringSource, context);

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

function scoreSchool(name) {
  return evaluate(`scoreSingleSchool(${JSON.stringify(name)})`);
}

function identityKey(name) {
  return evaluate(`schoolIdentityKey(${JSON.stringify(name)})`);
}

function findScoreDivergences(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = identityKey(item.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item.name);
  });

  const duplicateGroups = [...groups.values()].filter((names) => names.length > 1);
  const divergences = duplicateGroups
    .map((names) => ({
      names,
      scores: names.map((name) => scoreSchool(name)?.score ?? null)
    }))
    .filter(({ scores }) => new Set(scores).size > 1);

  return { duplicateGroups: duplicateGroups.length, divergences };
}

const rankingAudit = findScoreDivergences(context.window.schoolRankingData.schools);
const directoryAudit = findScoreDivergences(evaluate("allSchoolDirectory"));
const ambiguousAliasResult = scoreSchool("MSU");

const failures = [];
if (rankingAudit.divergences.length) failures.push({ source: "ranking", groups: rankingAudit.divergences });
if (directoryAudit.divergences.length) failures.push({ source: "directory", groups: directoryAudit.divergences });
if (!ambiguousAliasResult?.label?.includes("歧义")) {
  failures.push({ source: "alias", message: "MSU should be reported as ambiguous." });
}

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  rankingDuplicateGroups: rankingAudit.duplicateGroups,
  directoryDuplicateGroups: directoryAudit.duplicateGroups,
  scoreDivergenceGroups: 0,
  ambiguousAliasesChecked: ["MSU"]
}, null, 2));
