import sys, json, urllib.request, re
sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.urlopen('http://127.0.0.1:8000/api/states')
api_states = json.loads(req.read().decode('utf-8'))

with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

map_states = re.findall(r'"name":\s*"([^"]+)"', text)

print(f'API States Count: {len(api_states)}')
print(f'Map SVG States Count: {len(map_states)}')
print('SVG States:', map_states)

def match_state(api_name, map_states):
    api_clean = api_name.lower().replace('&', 'and').replace('and', '').replace(' ', '')
    for m in map_states:
        m_clean = m.lower().replace('&', 'and').replace('and', '').replace(' ', '')
        if m_clean in api_clean or api_clean in m_clean:
            return m
    return None

unmatched_api = []
for s in api_states:
    s_name = s['state_name']
    matched = match_state(s_name, map_states)
    if not matched:
        unmatched_api.append(s_name)
    else:
        print(f'  [API] "{s_name}"  <===>  [SVG] "{matched}"')

print('\nUnmatched API States (if any):', unmatched_api)