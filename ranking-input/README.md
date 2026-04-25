# Ranking Input

Place authorized ranking CSV files in this folder, then run:

```bash
python3 tools/extract-qs-pdf-top300.py
node tools/build-school-ranking-data.js
```

Supported columns:

```csv
name,qs,the,usnews,arwu,employer,labels,aliases,source,ranking_year,source_note
```

Notes:

- `name` should match the canonical school name in `schools-data.js` where possible.
- Use semicolons in `labels` or `aliases`, for example `985;211;双一流`.
- Missing ranking fields are allowed. The app will compute confidence from the number of available ranking sources.
- Full QS/THE/U.S. News/ARWU datasets may require licensing or authorized access. Do not paste unauthorized proprietary data.
- See `RANKING-DATA-IMPORT-SPEC.md` for the full import rules and yearly refresh workflow.
