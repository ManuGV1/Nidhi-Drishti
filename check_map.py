with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
codes_names = re.findall(r'code:\s*(\d+),\s*name:\s*[\'"]([^\'"]+)[\'"]', text)
print(f'Total map states/UTs found: {len(codes_names)}')
for c, n in sorted(codes_names, key=lambda x: x[1]):
    print(f'  [{c}] {n}')