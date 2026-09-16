import sys

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add useNavigate import if needed
if 'useNavigate' not in text:
    text = text.replace("import { useNavigate } from 'react-router-dom';", "")
    text = text.replace("import { apiService } from '../../api/client';", "import { useNavigate } from 'react-router-dom';\nimport { apiService } from '../../api/client';")

print('Imports updated in WorkIntelligenceModal')