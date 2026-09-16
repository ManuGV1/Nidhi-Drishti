import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx_start = text.find('const DETAILED_INDIA_STATES = [')
idx_end = text.find('];', idx_start)

snippet = text[idx_start:idx_start+1000]
print(snippet)