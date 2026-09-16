import sys, re

# Fix WorkIntelligenceModal.jsx
with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    modal_text = f.read()

# Fix duplicate icon imports
modal_text = re.sub(r'ChevronDown,\s*ChevronDown,', 'ChevronDown,', modal_text)
modal_text = re.sub(r'ChevronUp,\s*ChevronUp,', 'ChevronUp,', modal_text)

# Fix template literal missing backticks
modal_text = modal_text.replace(
    "{featureValues.ratio_to_median ? x : (amount && featureValues.peer_median ? x : '1.0x')}",
    "{featureValues.ratio_to_median ? ${featureValues.ratio_to_median}x : (amount && featureValues.peer_median ? ${(amount / featureValues.peer_median).toFixed(2)}x : '1.0x')}"
)

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'w', encoding='utf-8') as f:
    f.write(modal_text)

# Fix ExplainSheet.jsx
with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'r', encoding='utf-8') as f:
    sheet_text = f.read()

sheet_text = re.sub(r'ChevronDown,\s*ChevronDown,', 'ChevronDown,', sheet_text)
sheet_text = re.sub(r'ChevronUp,\s*ChevronUp,', 'ChevronUp,', sheet_text)

sheet_text = sheet_text.replace(
    "{featureValues.ratio_to_median ? x : (amount && featureValues.peer_median ? x : '1.0x')}",
    "{featureValues.ratio_to_median ? ${featureValues.ratio_to_median}x : (amount && featureValues.peer_median ? ${(amount / featureValues.peer_median).toFixed(2)}x : '1.0x')}"
)

with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'w', encoding='utf-8') as f:
    f.write(sheet_text)

print('Syntax & template literals fixed in both components')