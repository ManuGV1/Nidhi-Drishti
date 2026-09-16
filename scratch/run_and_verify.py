import sys
import os
sys.path.insert(0, r"D:\NidhiDristi")

from ml.pipeline import run_intelligence_pipeline

if __name__ == '__main__':
    try:
        run_id, summary = run_intelligence_pipeline()
        print("\nPIPELINE EXECUTION SUCCESSFUL!")
        print("Summary:", summary)
    except Exception as e:
        print("\nPIPELINE FAILED WITH ERROR:", e)
        import traceback
        traceback.print_exc()
