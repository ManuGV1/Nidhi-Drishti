import sys, json, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx_start = text.find('const DETAILED_INDIA_STATES = [')
idx_end = text.find('];', idx_start)

states_code_name = re.findall(r'\{\s*"code":\s*"([^"]+)",\s*"name":\s*"([^"]+)"', text[idx_start:idx_end])
for c, n in states_code_name:
    if any(k in n.lower() for k in ['arunachal', 'ladakh', 'jammu', 'kashmir', 'pondi', 'puduch']):
        print(f'Code: {c} | Name: {n}')