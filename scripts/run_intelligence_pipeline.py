"""
NIDHIDRISHTI — Intelligence Pipeline CLI Script
Executes the Stage 3 batch intelligence pipeline and logs execution benchmarks.
"""

import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.pipeline import run_intelligence_pipeline

def main():
    try:
        run_id, summary = run_intelligence_pipeline()
        print("\nINTELLIGENCE PIPELINE COMPLETED SUCCESSFULLY!")
        print(f"Run ID: {run_id}")
        print(f"Total Works Processed: {summary['processed_count']:,}")
        print(f"High Risk Works: {summary['high_risk_count']:,}")
        print(f"Critical Risk Works: {summary['critical_risk_count']:,}")
        print(f"Execution Duration: {summary['duration_seconds']} seconds")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR DURING PIPELINE EXECUTION: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
