import sys

with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "{featureValues.peer_median ? ₹ : 'Not available'}",
    "{featureValues.peer_median ? ₹ : 'Not available'}"
)

text = text.replace(
    "{featureValues.peer_median ? ? : 'Not available'}",
    "{featureValues.peer_median ? ₹ : 'Not available'}"
)

with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed line 276 in ExplainSheet.jsx')