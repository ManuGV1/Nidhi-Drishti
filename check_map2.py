with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
lines = [l for l in text.splitlines() if 'code' in l or 'name' in l or 'DETAILED_INDIA_STATES' in l][:30]
for l in lines:
    print(l)