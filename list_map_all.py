import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx_start = text.find('const DETAILED_INDIA_STATES = [')
idx_end = text.find('];', idx_start)

states = re.findall(r'\{\s*"code":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text[idx_start:idx_end])
print('Total entries in DETAILED_INDIA_STATES:', len(states))
for c, n in states:
    print(f'  {c}: {n}')