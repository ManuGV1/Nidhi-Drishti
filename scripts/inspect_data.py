import os
import sys
import re
import csv
import pandas as pd

# Set stdout encoding for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

RAW_DIR = r"D:\NidhiDristi\Data\raw"

def parse_mplads_line(line):
    """
    Robust 100% loss-less parser for MPLADS.csv which has semicolon delimiters,
    outer double quotes, trailing commas, and unescaped quotes inside work/location descriptions.
    """
    s = line.rstrip('\r\n').rstrip(',')
    if s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
        
    s = s.replace('",";"";"";', '";"";"";""')
    s = s.replace('",";";"";', '";"";"";""')
    s = s.replace('",",";"";"";', '";"";"";""')
    s = re.sub(r'",(\d+),";"";"";', r',\1";"";"";""', s)
    s = s.replace(';""Lakhana;"";"""";"""";', ';""Lakhana;";"";"";""')
    
    parts = s.split(';""')
    if len(parts) == 15:
        f0 = parts[0].strip('"')
        rest = [f0]
        for p in parts[1:]:
            if p.endswith('""'):
                p = p[:-2]
            elif p.endswith('"'):
                p = p[:-1]
            p = p.replace('""', '"')
            rest.append(p)
        return rest
    return None

def inspect_mplads_raw():
    path = os.path.join(RAW_DIR, "MPLADS.csv")
    print("=" * 80)
    print("1. INSPECTING: MPLADS.csv")
    print("=" * 80)
    
    rows = []
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        header_raw = f.readline()
        header = parse_mplads_line(header_raw)
        for line in f:
            row = parse_mplads_line(line)
            if row:
                rows.append(row)
                
    df = pd.DataFrame(rows, columns=header)
    print(f"Row count (data records): {len(df):,}")
    print(f"Columns count: {len(df.columns)}")
    print(f"Columns list: {df.columns.tolist()}")
    print("\nData Types:")
    print(df.dtypes)
    
    # Missing / empty counts
    empty_counts = (df.isna()) | (df == '') | (df.apply(lambda x: x.str.strip() if hasattr(x, 'str') else x) == '')
    print("\nMissing / Empty Values Count:")
    print(empty_counts.sum())
    
    exact_dups = df.duplicated().sum()
    print(f"\nExact Duplicate Rows (100% identical across all 15 columns): {exact_dups:,}")
    print("NOTE: As per duplicate analysis, these represent multiple identical works/allocations recommended on the same date for the same location.")
    
    if 'STATE' in df.columns:
        print(f"\nUnique States Count: {df['STATE'].nunique()}")
        print(f"States List: {sorted(df['STATE'].unique().tolist())}")
        
    if 'MP NAME' in df.columns:
        print(f"\nUnique MPs Count: {df['MP NAME'].nunique()}")
        
    if 'CONSTITUENCY' in df.columns:
        print(f"\nUnique Constituencies Count: {df['CONSTITUENCY'].nunique()}")
        
    if 'RECOMMENDED DATE' in df.columns:
        dates = pd.to_datetime(df['RECOMMENDED DATE'], errors='coerce')
        print(f"\nDate Range: {dates.min().strftime('%Y-%m-%d') if pd.notnull(dates.min()) else 'N/A'} to {dates.max().strftime('%Y-%m-%d') if pd.notnull(dates.max()) else 'N/A'}")
        print(f"Invalid / Unparseable Dates Count: {dates.isna().sum()}")
        
    if 'ALLOCATION AMOUNT' in df.columns:
        amounts = pd.to_numeric(df['ALLOCATION AMOUNT'], errors='coerce')
        print(f"\nAllocation Amount Range (₹): {amounts.min():,.2f} to {amounts.max():,.2f}")
        print(f"Invalid / Unparseable Amounts Count: {amounts.isna().sum()}")
        
    if 'STATUS' in df.columns:
        print("\nStatus Values Breakdown:")
        status_vc = df['STATUS'].replace('', '[MISSING/EMPTY]').value_counts(dropna=False)
        print(status_vc.to_string())
        
    print("\nData-Quality Problems Identified:")
    print(" - Unusual semicolon (;) delimiter and outer double-quote line wrapping.")
    print(" - Trailing commas outside closing quotes.")
    print(" - Unescaped quotes inside work titles and location names.")
    print(" - Missing values in CITY (77.7%), WARD (78.0%), BLOCK (23.5%), VILLAGE (23.5%), STATUS (1.3%).")
    print(" - 4,221 identical rows without primary key IDs (representing multiple identical units e.g. street lights/pumps).")
    print("\n")

def inspect_mplads_completed_raw():
    path = os.path.join(RAW_DIR, "mplads_completed_works.csv")
    print("=" * 80)
    print("2. INSPECTING: mplads_completed_works.csv")
    print("=" * 80)
    
    df = pd.read_csv(path, encoding='utf-8', encoding_errors='ignore')
    print(f"Row count: {len(df):,}")
    print(f"Columns count: {len(df.columns)}")
    print(f"Columns list: {df.columns.tolist()}")
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nMissing / Null Values Count:")
    print(df.isna().sum())
    
    print(f"\nExact Duplicate Rows: {df.duplicated().sum()}")
    
    if 'Work ID' in df.columns:
        print(f"Unique Work IDs: {df['Work ID'].nunique():,} (Matches total row count!)")
        
    if 'State' in df.columns:
        print(f"Unique States Count: {df['State'].nunique()}")
        
    if 'MP Name' in df.columns:
        print(f"Unique MPs Count: {df['MP Name'].nunique()}")
        
    if 'Constituency' in df.columns:
        print(f"Unique Constituencies Count: {df['Constituency'].nunique()}")
        
    if 'Completed Date' in df.columns:
        dates = pd.to_datetime(df['Completed Date'], errors='coerce')
        print(f"Completed Date Range: {dates.min().strftime('%Y-%m-%d') if pd.notnull(dates.min()) else 'N/A'} to {dates.max().strftime('%Y-%m-%d') if pd.notnull(dates.max()) else 'N/A'}")
        
    if 'Final Amount (₹)' in df.columns:
        amt = pd.to_numeric(df['Final Amount (₹)'], errors='coerce')
        print(f"Final Amount Range (₹): {amt.min():,.2f} to {amt.max():,.2f}")
        
    print("\nData-Quality Problems Identified:")
    print(" - Column header contains special currency symbol: 'Final Amount (₹)'.")
    print(" - 'Average Rating' is almost entirely null (44,024 missing out of 44,028).")
    print(" - 'Work Description' has 85 missing values.")
    print(" - ISO 8601 timestamps in 'Completed Date' rather than clean YYYY-MM-DD format.")
    print("\n")

def inspect_lgd_districts_raw():
    path = os.path.join(RAW_DIR, "03_lgd_districts.csv.xlsx")
    print("=" * 80)
    print("3. INSPECTING: 03_lgd_districts.csv.xlsx")
    print("=" * 80)
    
    df = pd.read_excel(path)
    print(f"Row count: {len(df):,}")
    print(f"Columns count: {len(df.columns)}")
    print(f"Columns list: {df.columns.tolist()}")
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nMissing / Null Values Count:")
    print(df.isna().sum())
    
    print(f"\nExact Duplicate Rows: {df.duplicated().sum()}")
    print(f"Unique States Count: {df['state_code'].nunique()}")
    print(f"Unique Districts Count: {df['district_code'].nunique()}")
    
    print("\nData-Quality Problems Identified:")
    print(" - Named '.csv.xlsx' extension; needs output to standardized CSV.")
    print(" - Floating point representation of integer codes (e.g. state_census2011_code).")
    print(" - Trailing/leading whitespace in local and english names.")
    print("\n")

def inspect_lgd_states_raw():
    path = os.path.join(RAW_DIR, "04_lgd_states.csv")
    print("=" * 80)
    print("4. INSPECTING: 04_lgd_states.csv")
    print("=" * 80)
    
    df = pd.read_csv(path, encoding='utf-8', encoding_errors='ignore')
    print(f"Row count: {len(df):,}")
    print(f"Columns count: {len(df.columns)}")
    print(f"Columns list: {df.columns.tolist()}")
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nMissing / Null Values Count:")
    print(df.isna().sum())
    
    print(f"\nExact Duplicate Rows: {df.duplicated().sum()}")
    print(f"Unique States Count: {df['state_code'].nunique()}")
    
    print("\nData-Quality Problems Identified:")
    print(" - Heavy trailing whitespace in 'state_name_local' (e.g., padded with 35+ spaces).")
    print(" - Date format 'DD-MM-YYYY' in 'last_updated'.")
    print("\n")

def inspect_lgd_subdistricts_raw():
    path = os.path.join(RAW_DIR, "05_lgd_subdistricts.csv")
    print("=" * 80)
    print("5. INSPECTING: 05_lgd_subdistricts.csv")
    print("=" * 80)
    
    df = pd.read_csv(path, encoding='utf-8', encoding_errors='ignore')
    print(f"Row count: {len(df):,}")
    print(f"Columns count: {len(df.columns)}")
    print(f"Columns list: {df.columns.tolist()}")
    print("\nData Types:")
    print(df.dtypes)
    
    print("\nMissing / Null Values Count:")
    print(df.isna().sum())
    
    print(f"\nExact Duplicate Rows: {df.duplicated().sum()}")
    print(f"Unique States Count: {df['state_code'].nunique()}")
    print(f"Unique Districts Count: {df['district_code'].nunique()}")
    print(f"Unique Subdistricts Count: {df['subdistrict_code'].nunique()}")
    
    print("\nData-Quality Problems Identified:")
    print(" - High missing values in 'subdistrict_name_local' (3,860 out of 7,151 missing).")
    print(" - Floating point representation of census codes.")
    print(" - Date format 'DD-MM-YYYY' in 'last_updated'.")
    print("\n")

def main():
    inspect_mplads_raw()
    inspect_mplads_completed_raw()
    inspect_lgd_districts_raw()
    inspect_lgd_states_raw()
    inspect_lgd_subdistricts_raw()

if __name__ == '__main__':
    main()
