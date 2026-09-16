import json
from pathlib import Path
from collections import Counter

DATA_DIR = Path(r"D:\NidhiDristi\Data\raw\nirikshan_real")


def load_json(filename):
    path = DATA_DIR / filename

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def analyse_dataset(name, records):

    print("\n" + "=" * 90)
    print(name)
    print("=" * 90)

    print(f"Records: {len(records):,}")

    if not records:
        return

    # Work recommendation detail IDs
    rec_ids = [
        r.get("WORK_RECOMMENDATION_DTL_ID")
        for r in records
        if r.get("WORK_RECOMMENDATION_DTL_ID") is not None
    ]

    print(f"Records with WORK_RECOMMENDATION_DTL_ID: {len(rec_ids):,}")
    print(f"Unique WORK_RECOMMENDATION_DTL_ID: {len(set(rec_ids)):,}")

    duplicate_ids = [
        value
        for value, count in Counter(rec_ids).items()
        if count > 1
    ]

    print(f"Duplicate recommendation IDs: {len(duplicate_ids):,}")

    # Work IDs
    work_ids = [
        r.get("WORK_ID")
        for r in records
        if r.get("WORK_ID") is not None
    ]

    if work_ids:
        print(f"Records with WORK_ID: {len(work_ids):,}")
        print(f"Unique WORK_ID: {len(set(work_ids)):,}")


def main():

    print("\n")
    print("=" * 90)
    print("NIDHI DRISHTI — NIRIKSHAN DATA RECONCILIATION")
    print("=" * 90)

    ls_recommended = load_json("ls-works-recommended.json")
    ls_completed = load_json("ls-works-completed.json")
    rs_recommended = load_json("rs-works-recommended.json")
    rs_completed = load_json("rs-works-completed.json")

    # ---------------------------------------------------------
    # Individual dataset analysis
    # ---------------------------------------------------------

    analyse_dataset(
        "LS RECOMMENDED",
        ls_recommended
    )

    analyse_dataset(
        "LS COMPLETED",
        ls_completed
    )

    analyse_dataset(
        "RS RECOMMENDED",
        rs_recommended
    )

    analyse_dataset(
        "RS COMPLETED",
        rs_completed
    )

    # ---------------------------------------------------------
    # Combine recommended
    # ---------------------------------------------------------

    recommended = ls_recommended + rs_recommended
    completed = ls_completed + rs_completed

    recommended_ids = {
        r.get("WORK_RECOMMENDATION_DTL_ID")
        for r in recommended
        if r.get("WORK_RECOMMENDATION_DTL_ID") is not None
    }

    completed_rec_ids = {
        r.get("WORK_RECOMMENDATION_DTL_ID")
        for r in completed
        if r.get("WORK_RECOMMENDATION_DTL_ID") is not None
    }

    completed_work_ids = {
        r.get("WORK_ID")
        for r in completed
        if r.get("WORK_ID") is not None
    }

    print("\n" + "=" * 90)
    print("RECOMMENDED ↔ COMPLETED RELATIONSHIP")
    print("=" * 90)

    print(f"Total recommended records: {len(recommended):,}")
    print(f"Total completed records: {len(completed):,}")

    print(
        f"\nRecommended unique recommendation IDs: "
        f"{len(recommended_ids):,}"
    )

    print(
        f"Completed unique recommendation IDs: "
        f"{len(completed_rec_ids):,}"
    )

    matched = recommended_ids & completed_rec_ids
    recommended_only = recommended_ids - completed_rec_ids
    completed_only = completed_rec_ids - recommended_ids

    print(
        f"\nMatched recommendation IDs: "
        f"{len(matched):,}"
    )

    print(
        f"Recommended IDs without completed record: "
        f"{len(recommended_only):,}"
    )

    print(
        f"Completed IDs without recommended record: "
        f"{len(completed_only):,}"
    )

    print(
        f"\nUnique completed WORK_ID values: "
        f"{len(completed_work_ids):,}"
    )

    # ---------------------------------------------------------
    # State analysis
    # ---------------------------------------------------------

    states_recommended = {
        r.get("STATE_NAME")
        for r in recommended
        if r.get("STATE_NAME")
    }

    states_completed = {
        r.get("STATE_NAME")
        for r in completed
        if r.get("STATE_NAME")
    }

    print("\n" + "=" * 90)
    print("GEOGRAPHIC COVERAGE")
    print("=" * 90)

    print(
        f"States in recommended data: "
        f"{len(states_recommended)}"
    )

    print(
        f"States in completed data: "
        f"{len(states_completed)}"
    )

    print("\nStates missing from recommended/completed comparison:")

    all_states = sorted(
        states_recommended | states_completed
    )

    for state in all_states:
        print(f"  • {state}")

    print("\n")
    print("=" * 90)
    print("RECONCILIATION COMPLETE")
    print("=" * 90)


if __name__ == "__main__":
    main()