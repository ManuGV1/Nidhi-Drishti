import sys, json, urllib.request
sys.stdout.reconfigure(encoding='utf-8')

# 1. Fetch states from backend API
req = urllib.request.urlopen('http://127.0.0.1:8000/api/states')
api_states = json.loads(req.read().decode('utf-8'))

# 2. Extract map states from IndiaMap.jsx
with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re
map_states = re.findall(r'name:\s*["\']([^"\']+)["\']', text)

print(f'API States Count: {len(api_states)}')
print(f'Map SVG States Count: {len(map_states)}')

unmatched_api = []
for s in api_states:
    s_name = s['state_name']
    matched = any(
        s_name.lower() in m.lower() or m.lower() in s_name.lower()
        for m in map_states
    )
    if not matched:
        unmatched_api.append(s_name)

print('\nUnmatched API States (if any):', unmatched_api)