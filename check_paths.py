import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import json
# Extract paths for JK, AS, NL
matches = re.findall(r'\{\s*"code":\s*"(JK|AS|NL)",\s*"name":\s*"([^"]+)",\s*"path":\s*"([^"]+)"', text)
for c, n, p in matches:
    print(f'Code: {c} ({n}) -> path snippet: {p[:100]}...')