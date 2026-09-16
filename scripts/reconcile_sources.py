import json
import re
from pathlib import Path
from collections import defaultdict

import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(r"D:\NidhiDristi")
RAW_DIR = BASE_DIR / "Data" / "raw"
NIRIKSHAN_DIR = RAW_DIR / "nirikshan_real"

MPLADS_FILE = RAW_DIR / "MPLADS.csv"
COMPLETED_FILE = RAW_DIR / "mplads_completed_works.csv"


# ============================================================
# HELPERS
# ============================================================

def clean(value):
    """Normalize text for comparison."""
    if value is None:
        return ""

    value = str(value).strip().lower()

    # Normalize whitespace
    value = re.sub(r"\s+", " ", value)

    return value


def normalize_amount(value):
    """Convert amount to numeric."""
    try:
        if value is None or value == "":
            return None

        return round(float(value), 2)

    except (ValueError, TypeError):
        return None


def load_json(filename):
    path = NIRIKSHAN_DIR / filename

    print(f"\nLoading {filename}...")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded: {len(data):,} records")

    return data


# ============================================================
# LOAD NIRIKSHAN
# ============================================================

def load_nirikshan():

    ls_rec = load_json("ls-works-recommended.json")
    ls_comp = load_json("ls-works-completed.json")

    rs_rec = load_json("rs-works-recommended.json")
    rs_comp = load_json("rs-works-completed.json")

    recommended = ls_rec + rs_rec
    completed = ls_comp + rs_comp

    return recommended, completed


# ============================================================
# NIRIKSHAN COMPLETED INDEX
# ============================================================

def build_nirikshan_completed_index(records):

    print("\nBuilding Nirikshan completed Work ID index...")

    index = {}

    for row in records:

        work_id = row.get("WORK_ID")

        if work_id is not None:
            index[str(work_id).strip()] = row

    print(
        f"Nirikshan unique completed Work IDs: "
        f"{len(index):,}"
    )

    return index


# ============================================================
# COMPARE COMPLETED CSV
# ============================================================

def compare_completed_csv(nirikshan_completed):

    print("\n")
    print("=" * 90)
    print("1. EXISTING COMPLETED CSV ↔ NIRIKSHAN COMPLETED")
    print("=" * 90)

    print(f"Reading: {COMPLETED_FILE}")

    df = pd.read_csv(
        COMPLETED_FILE,
        encoding="utf-8",
        encoding_errors="ignore"
    )

    print(f"Existing completed records: {len(df):,}")

    if "Work ID" not in df.columns:
        print("ERROR: Work ID column not found.")
        return

    csv_ids = set(
        df["Work ID"]
        .dropna()
        .astype(str)
        .str.strip()
    )

    nirikshan_ids = set(nirikshan_completed.keys())

    exact_ids = csv_ids & nirikshan_ids

    csv_only = csv_ids - nirikshan_ids

    nirikshan_only = nirikshan_ids - csv_ids

    print("\nRESULTS")
    print("-" * 90)

    print(f"Existing CSV unique Work IDs: {len(csv_ids):,}")
    print(f"Nirikshan unique Work IDs: {len(nirikshan_ids):,}")
    print(f"Exact Work ID matches: {len(exact_ids):,}")
    print(f"Existing CSV only: {len(csv_only):,}")
    print(f"Nirikshan only: {len(nirikshan_only):,}")

    if csv_ids:
        percentage = len(exact_ids) / len(csv_ids) * 100
        print(
            f"Existing CSV matched by Work ID: "
            f"{percentage:.2f}%"
        )


# ============================================================
# RECOMMENDED DATA INDEX
# ============================================================

def build_recommended_indexes(records):

    print("\nBuilding recommended-data indexes...")

    by_id = {}

    by_signature = defaultdict(list)

    for row in records:

        rec_id = row.get("WORK_RECOMMENDATION_DTL_ID")

        if rec_id is not None:
            by_id[str(rec_id).strip()] = row

        # Composite signature for cross-source comparison
        signature = (
            clean(row.get("MP_NAME")),
            clean(row.get("STATE_NAME")),
            clean(row.get("CONSTITUENCY")),
            clean(row.get("WORK_DESCRIPTION")),
            normalize_amount(row.get("RECOMMENDED_AMOUNT")),
            clean(row.get("RECOMMENDATION_DATE")),
            clean(row.get("HOUSE_OF_PARLIAMENT")),
        )

        by_signature[signature].append(row)

    print(
        f"Unique Nirikshan recommendation IDs: "
        f"{len(by_id):,}"
    )

    print(
        f"Recommendation signatures: "
        f"{len(by_signature):,}"
    )

    return by_id, by_signature


# ============================================================
# EXISTING MPLADS CSV
# ============================================================

def parse_existing_mplads():

    print("\n")
    print("=" * 90)
    print("2. EXISTING MPLADS CSV ↔ NIRIKSHAN RECOMMENDED")
    print("=" * 90)

    print(f"Reading: {MPLADS_FILE}")

    rows = []

    with open(
        MPLADS_FILE,
        "r",
        encoding="utf-8",
        errors="ignore"
    ) as f:

        header = f.readline()

        for line in f:

            line = line.rstrip("\r\n").rstrip(",")

            if not line:
                continue

            # The existing MPLADS export has an unusual format.
            # Reuse the project's known 15-field parsing approach.

            if line.startswith('"') and line.endswith('"'):
                line = line[1:-1]

            line = line.replace(
                '",";"";"";',
                '";"";"";""'
            )

            line = line.replace(
                '",";";"";',
                '";"";"";""'
            )

            line = line.replace(
                '",",";"";"";',
                '";"";"";""'
            )

            line = re.sub(
                r'",(\d+),";"";"";',
                r',\1";"";"";""',
                line
            )

            parts = line.split(';""')

            if len(parts) != 15:
                continue

            first = parts[0].strip('"')

            parsed = [first]

            for part in parts[1:]:

                if part.endswith('""'):
                    part = part[:-2]

                elif part.endswith('"'):
                    part = part[:-1]

                part = part.replace('""', '"')

                parsed.append(part)

            rows.append(parsed)

    columns = [
        "MP NAME",
        "WORK",
        "CATEGORY",
        "STATE",
        "CONSTITUENCY",
        "IDA",
        "CITY",
        "WARD",
        "BLOCK",
        "VILLAGE",
        "RECOMMENDED DATE",
        "ALLOCATION AMOUNT",
        "IDA APPROVAL",
        "STATUS",
        "HOUSE",
    ]

    df = pd.DataFrame(rows, columns=columns)

    print(f"Parsed existing MPLADS records: {len(df):,}")

    return df


# ============================================================
# RECOMMENDED CROSS-SOURCE MATCHING
# ============================================================

def compare_recommended_csv(df, nirikshan_by_signature):

    print("\nBuilding cross-source signatures...")

    exact_signature_matches = 0
    possible_matches = 0
    no_match = 0

    examples = []

    for _, row in df.iterrows():

        signature = (
            clean(row["MP NAME"]),
            clean(row["STATE"]),
            clean(row["CONSTITUENCY"]),
            clean(row["WORK"]),
            normalize_amount(row["ALLOCATION AMOUNT"]),
            clean(row["RECOMMENDED DATE"]),
            clean(row["HOUSE"]),
        )

        matches = nirikshan_by_signature.get(
            signature,
            []
        )

        if len(matches) == 1:

            exact_signature_matches += 1

        elif len(matches) > 1:

            possible_matches += 1

            if len(examples) < 5:
                examples.append(
                    (
                        row["MP NAME"],
                        row["STATE"],
                        row["WORK"],
                        len(matches)
                    )
                )

        else:

            no_match += 1

    print("\nRESULTS")
    print("-" * 90)

    print(
        f"Exact composite matches: "
        f"{exact_signature_matches:,}"
    )

    print(
        f"Multiple possible matches: "
        f"{possible_matches:,}"
    )

    print(
        f"No composite match: "
        f"{no_match:,}"
    )

    total = len(df)

    if total:
        print(
            f"\nMatched percentage: "
            f"{exact_signature_matches / total * 100:.2f}%"
        )

    if examples:

        print("\nExamples of signatures with multiple matches:")

        for mp, state, work, count in examples:

            print(
                f"  {mp} | {state} | "
                f"{work[:80]} | "
                f"{count} possible records"
            )


# ============================================================
# MAIN
# ============================================================

def main():

    print("\n")
    print("=" * 90)
    print("NIDHI DRISHTI — CROSS-SOURCE RECONCILIATION")
    print("=" * 90)

    # --------------------------------------------------------
    # Load Nirikshan
    # --------------------------------------------------------

    recommended, completed = load_nirikshan()

    # --------------------------------------------------------
    # Completed comparison
    # --------------------------------------------------------

    nirikshan_completed = build_nirikshan_completed_index(
        completed
    )

    compare_completed_csv(
        nirikshan_completed
    )

    # --------------------------------------------------------
    # Recommended comparison
    # --------------------------------------------------------

    _, nirikshan_signatures = build_recommended_indexes(
        recommended
    )

    existing_mplads = parse_existing_mplads()

    compare_recommended_csv(
        existing_mplads,
        nirikshan_signatures
    )

    # --------------------------------------------------------
    # Final summary
    # --------------------------------------------------------

    print("\n")
    print("=" * 90)
    print("RECONCILIATION FINISHED")
    print("=" * 90)

    print("\nIMPORTANT:")
    print("No JSON, CSV, or database records were modified.")
    print("This script was READ-ONLY.")


if __name__ == "__main__":
    main()