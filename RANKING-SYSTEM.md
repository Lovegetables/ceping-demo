# School Ranking System

This H5 uses a three-level school evaluation pipeline:

1. `school-ranking-data.js`
   Full seed library for all schools. If QS/THE/U.S. News/ARWU fields exist, the app uses four-ranking composite scoring.

2. `school-tier-data.js`
   Manual employer-recognition tier library. Used when ranking fields are missing.

3. `schools-data.js`
   Broad school directory and China Ministry of Education school type fallback. Used for autocomplete and fallback scoring.

4. `tools/extract-public-ranking-seeds.js`
   Builds the public seed CSV from official public pages already fetched to `/tmp`.

5. `tools/extract-qs-pdf-top300.py`
   Parses QS 2026 Top 300 from a public Top 1500 PDF into `ranking-input/qs-top300-2026.csv`.

## Composite Ranking Formula

Ranking score:

```text
QS × 30%
+ THE × 25%
+ U.S. News Global × 25%
+ ARWU × 20%
```

Final school score:

```text
Ranking score × 45%
+ Employer recognition × 35%
+ School label score × 20%
+ Key label boost
```

Confidence:

- High: 3-4 ranking sources
- Medium: 2 ranking sources
- Low: 1 ranking source

## Updating Ranking Data

Put authorized CSV files into `ranking-input/` with columns:

```csv
name,qs,the,usnews,arwu,employer,labels,aliases,source,ranking_year,source_note
```

Then run:

```bash
node tools/build-school-ranking-data.js
```

The script rewrites `school-ranking-data.js` and preserves all schools as ranking seed records.

## Copyright Note

Full QS/THE/U.S. News/ARWU datasets may require licensing or authorized access. The app supports full imports, but the bundled seed data should only include data you are allowed to use.

See `RANKING-DATA-IMPORT-SPEC.md` for detailed import rules, source boundaries, and annual maintenance steps.
