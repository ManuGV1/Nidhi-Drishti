import json
from pathlib import Path

import pandas as pd


DATA_DIR = Path(r"D:\NidhiDristi\Data\raw\nirikshan_real")


FILES = {
    "LS Recommended": "ls-works-recommended.json",
    "LS Completed": "ls-works-completed.json",
    "RS Recommended": "rs-works-recommended.json",
    "RS Completed": "rs-works-completed.json",
}


def load_file(filename):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def profile(name, records):

    print("\n" + "=" * 90)
    print(name)
    print("=" * 90)

    df = pd.DataFrame(records)

    print(f"Records: {len(df):,}")

    # --------------------------------------------------------
    # Missing values
    # --------------------------------------------------------

    print("\nMissing values:")

    important = [
        "WORK_RECOMMENDATION_DTL_ID",
        "WORK_ID",
        "MP_NAME",
        "STATE_NAME",
        "CONSTITUENCY",
        "WORK_DESCRIPTION",
        "RECOMMENDATION_DATE",
        "RECOMMENDED_AMOUNT",
        "SANCTION_DATE",
        "SANCTION_AMOUNT",
        "ACTUAL_END_DATE",
        "ACTUAL_AMOUNT",
        "WORK_STAGE",
        "IDA_NAME",
    ]

    for column in important:
        if column in df.columns:
            missing = df[column].isna().sum()
            empty = (
                df[column]
                .astype(str)
                .str.strip()
                .isin(["", "None", "nan"])
                .sum()
            )

            print(
                f"  {column:<30} "
                f"{missing + empty:,}"
            )

    # --------------------------------------------------------
    # Date ranges
    # --------------------------------------------------------

    print("\nDate ranges:")

    date_columns = [
        "RECOMMENDATION_DATE",
        "SANCTION_DATE",
        "ACTUAL_END_DATE",
    ]

    for column in date_columns:

        if column not in df.columns:
            continue

        dates = pd.to_datetime(
            df[column],
            errors="coerce"
        )

        valid = dates.dropna()

        if len(valid):
            print(
                f"  {column:<25} "
                f"{valid.min().date()} → {valid.max().date()}"
            )
        else:
            print(
                f"  {column:<25} NO VALID DATES"
            )

    # --------------------------------------------------------
    # Amounts
    # --------------------------------------------------------

    print("\nAmount statistics:")

    amount_columns = [
        "RECOMMENDED_AMOUNT",
        "SANCTION_AMOUNT",
        "ACTUAL_AMOUNT",
    ]

    for column in amount_columns:

        if column not in df.columns:
            continue

        amounts = pd.to_numeric(
            df[column],
            errors="coerce"
        ).dropna()

        if len(amounts):

            print(
                f"\n  {column}"
            )

            print(
                f"    Valid:   {len(amounts):,}"
            )

            print(
                f"    Missing: {len(df) - len(amounts):,}"
            )

            print(
                f"    Min:     ₹{amounts.min():,.2f}"
            )

            print(
                f"    Median:  ₹{amounts.median():,.2f}"
            )

            print(
                f"    Mean:    ₹{amounts.mean():,.2f}"
            )

            print(
                f"    Max:     ₹{amounts.max():,.2f}"
            )

    # --------------------------------------------------------
    # States
    # --------------------------------------------------------

    if "STATE_NAME" in df.columns:

        print("\nStates:")

        print(
            f"  Unique states: "
            f"{df['STATE_NAME'].nunique()}"
        )

        state_counts = (
            df["STATE_NAME"]
            .value_counts()
            .head(10)
        )

        for state, count in state_counts.items():
            print(
                f"  {state}: {count:,}"
            )

    # --------------------------------------------------------
    # Houses
    # --------------------------------------------------------

    if "HOUSE_OF_PARLIAMENT" in df.columns:

        print("\nHouse of Parliament:")

        print(
            df["HOUSE_OF_PARLIAMENT"]
            .value_counts(dropna=False)
            .to_string()
        )

    # --------------------------------------------------------
    # Work stages
    # --------------------------------------------------------

    if "WORK_STAGE" in df.columns:

        print("\nWork stages:")

        stages = (
            df["WORK_STAGE"]
            .fillna("[MISSING]")
            .value_counts()
            .head(20)
        )

        for stage, count in stages.items():

            print(
                f"  {stage}: {count:,}"
            )

    # --------------------------------------------------------
    # IDs
    # --------------------------------------------------------

    if "WORK_RECOMMENDATION_DTL_ID" in df.columns:

        ids = df[
            "WORK_RECOMMENDATION_DTL_ID"
        ].dropna()

        print("\nRecommendation IDs:")

        print(
            f"  Present: "
            f"{len(ids):,}"
        )

        print(
            f"  Unique:  "
            f"{ids.nunique():,}"
        )

    if "WORK_ID" in df.columns:

        ids = df[
            "WORK_ID"
        ].dropna()

        print("\nWork IDs:")

        print(
            f"  Present: "
            f"{len(ids):,}"
        )

        print(
            f"  Unique:  "
            f"{ids.nunique():,}"
        )

    # --------------------------------------------------------
    # Text quality
    # --------------------------------------------------------

    if "WORK_DESCRIPTION" in df.columns:

        descriptions = (
            df["WORK_DESCRIPTION"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        print("\nWork descriptions:")

        print(
            f"  Missing/empty: "
            f"{(descriptions == '').sum():,}"
        )

        print(
            f"  Unique descriptions: "
            f"{descriptions.nunique():,}"
        )


def main():

    print("\n")
    print("=" * 90)
    print("NIDHI DRISHTI — NIRIKSHAN DATA PROFILE")
    print("=" * 90)

    datasets = {}

    for name, filename in FILES.items():

        print(f"\nLoading {filename}...")

        records = load_file(filename)

        datasets[name] = records

        profile(name, records)

    print("\n")
    print("=" * 90)
    print("PROFILE COMPLETE")
    print("=" * 90)

    print("\nNo files or database records were modified.")


if __name__ == "__main__":
    main()