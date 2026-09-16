import json
from pathlib import Path

DATA_DIR = Path(r"D:\NidhiDristi\Data\raw\nirikshan_real")

FILES = [
    "ls-works-recommended.json",
    "ls-works-completed.json",
    "rs-works-recommended.json",
    "rs-works-completed.json",
    "states.json",
]


def inspect_file(filename):
    path = DATA_DIR / filename

    print("\n" + "=" * 90)
    print(f"FILE: {filename}")
    print("=" * 90)

    if not path.exists():
        print("❌ FILE NOT FOUND")
        print(path)
        return

    size_mb = path.stat().st_size / (1024 * 1024)
    print(f"File size: {size_mb:.2f} MB")

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print("❌ Could not read JSON:")
        print(e)
        return

    print(f"Top-level type: {type(data).__name__}")

    # ---------------------------------------------------------
    # CASE 1: JSON is a list
    # ---------------------------------------------------------
    if isinstance(data, list):

        print(f"Record count: {len(data):,}")

        if not data:
            print("⚠️ Empty list")
            return

        first = data[0]

        if isinstance(first, dict):

            print("\nColumns / Fields:")
            for key in first.keys():
                print(f"  • {key}")

            print("\nFirst record:")
            print(json.dumps(
                first,
                indent=2,
                ensure_ascii=False
            ))

        else:
            print("\nFirst value:")
            print(first)

    # ---------------------------------------------------------
    # CASE 2: JSON is a dictionary
    # ---------------------------------------------------------
    elif isinstance(data, dict):

        print("\nTop-level keys:")

        for key in data.keys():
            print(f"  • {key}")

        # Look for list inside dictionary
        found_list = False

        for key, value in data.items():

            if isinstance(value, list):

                found_list = True

                print(f"\nList found under key: {key}")
                print(f"Record count: {len(value):,}")

                if value and isinstance(value[0], dict):

                    print("\nColumns / Fields:")

                    for column in value[0].keys():
                        print(f"  • {column}")

                    print("\nFirst record:")

                    print(json.dumps(
                        value[0],
                        indent=2,
                        ensure_ascii=False
                    ))

                break

        if not found_list:
            print("\nNo list of records found.")

    else:
        print("⚠️ Unexpected JSON structure.")


def main():

    print("\n")
    print("=" * 90)
    print("NIDHI DRISHTI — NIRIKSHAN REAL DATA INSPECTION")
    print("=" * 90)

    print(f"\nData directory:")
    print(DATA_DIR)

    for filename in FILES:
        inspect_file(filename)

    print("\n")
    print("=" * 90)
    print("INSPECTION COMPLETE")
    print("=" * 90)


if __name__ == "__main__":
    main()