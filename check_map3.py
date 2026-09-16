import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('d:/NidhiDristi/frontend/src/components/common/IndiaMap.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('getStateInfo')
print(text[idx:idx+500])