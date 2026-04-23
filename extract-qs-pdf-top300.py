from pathlib import Path
import csv
import re

try:
    from pypdf import PdfReader
except ImportError as exc:
    raise SystemExit("pypdf is required. Use the bundled workspace Python runtime.") from exc

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = Path("/tmp/qs-pdf.pdf")
OUTPUT_PATH = ROOT / "ranking-input" / "qs-top300-2026.csv"
SOURCE_URL = "https://www.csghs.tp.edu.tw/wp-content/uploads/doc/zs271/Top_1500_World_University_Rankings_2026%E3%80%8C%E4%B8%96%E7%95%8C%E5%A4%A7%E5%AD%B8%E6%8E%92%E5%90%8D%E5%89%8D1500%E5%90%8D%E5%A4%A7%E5%AD%B8%E5%90%8D%E5%96%AE%E3%80%8D.pdf"

NORMALIZE = {
    "Massachusetts Institute of Technology (MIT)": ("Massachusetts Institute of Technology", ["MIT"]),
    "California Institute of Technology (Caltech)": ("California Institute of Technology", ["Caltech"]),
    "ETH Zurich (Swiss Federal Institute of Technology)": ("ETH Zurich", ["Swiss Federal Institute of Technology"]),
    "National University of Singapore (NUS)": ("National University of Singapore", ["NUS"]),
    "UCL (University College London)": ("University College London", ["UCL"]),
    "Nanyang Technological University, Singapore (NTU Singapore)": ("Nanyang Technological University", ["NTU Singapore", "Nanyang Technological University, Singapore"]),
    "University of California, Berkeley (UCB)": ("University of California, Berkeley", ["UCB"]),
    "King's College London (KCL)": ("King's College London", ["KCL"]),
    "The University of Hong Kong": ("University of Hong Kong", ["The University of Hong Kong", "HKU"]),
    "The Chinese University of Hong Kong": ("The Chinese University of Hong Kong", ["CUHK"]),
    "The Hong Kong University of Science and Technology": ("The Hong Kong University of Science and Technology", ["HKUST"]),
    "Rheinische Friedrich-Wilhelms-Universit ät Bonn": ("University of Bonn", ["Rheinische Friedrich-Wilhelms-Universität Bonn"]),
    "Université Paris 1 Panthéon-Sorbonne": ("Pantheon-Sorbonne University", ["Université Paris 1 Panthéon-Sorbonne", "Paris 1 Panthéon-Sorbonne"]),
}


def clean_name(name):
    name = re.sub(r"\s+", " ", name).strip()
    return NORMALIZE.get(name, (name, []))


def parse_rows(pdf_path):
    reader = PdfReader(str(pdf_path))
    rows = []
    for page in reader.pages:
        text = page.extract_text() or ""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        current = None
        for line in lines:
            if re.match(r"^(QS|泰晤士|美國|世界|Top|名次|Rank|2026|\d+$)", line):
                continue
            match = re.match(r"^(\d{1,4})\s+(.+)", line)
            if match:
                rank = int(match.group(1))
                if rank <= 350:
                    if current:
                        yield current
                    current = line
                elif current:
                    yield current
                    current = None
            elif current:
                current += " " + line
        if current:
            yield current


def extract_top300(pdf_path):
    extracted = []
    for line in parse_rows(pdf_path):
        match = re.match(r"^(\d{1,4})\s+(.+?)(?:\s+\d{1,4}(?:–\d{1,4})?\s+[A-ZÉÜÖÅÄÑÍÓÚÇÀ-ſ]|$)", line)
        if not match:
            continue
        rank = int(match.group(1))
        if rank > 300:
            continue
        name, aliases = clean_name(match.group(2))
        extracted.append((rank, name, aliases))

    deduped = []
    seen = set()
    for rank, name, aliases in sorted(extracted, key=lambda item: (item[0], item[1])):
        key = (rank, name)
        if key in seen:
            continue
        seen.add(key)
        deduped.append((rank, name, aliases))
    return deduped[:300]


def main():
    if not PDF_PATH.exists():
        raise SystemExit(f"Missing source PDF: {PDF_PATH}")

    rows = extract_top300(PDF_PATH)
    if len(rows) < 300:
        raise SystemExit(f"Expected 300 QS rows, got {len(rows)}")

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["name", "qs", "the", "usnews", "arwu", "employer", "labels", "aliases", "source", "ranking_year", "source_note"])
        for rank, name, aliases in rows:
            writer.writerow([
                name,
                rank,
                "",
                "",
                "",
                "",
                "public-seed;qs-top300",
                ";".join(aliases),
                SOURCE_URL,
                2026,
                "QS World University Rankings 2026 Top 300 parsed from public Top 1500 PDF"
            ])

    print(f"Wrote {len(rows)} QS Top 300 rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
