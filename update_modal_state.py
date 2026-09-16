import sys, re

# Update WorkIntelligenceModal.jsx
with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    modal_text = f.read()

# Make sure imports are present
if 'HelpCircle' not in modal_text:
    modal_text = modal_text.replace(
        "import { \n  X, ",
        "import { \n  X, \n  HelpCircle, \n  ChevronDown, \n  ChevronUp, "
    ).replace(
        "import { \n  X,",
        "import {\n  X,\n  HelpCircle,\n  ChevronDown,\n  ChevronUp,"
    )

# Add useNavigate import if needed
if 'useNavigate' not in modal_text:
    modal_text = modal_text.replace(
        "import { apiService } from '../../api/client';",
        "import { useNavigate } from 'react-router-dom';\nimport { apiService } from '../../api/client';"
    )

# Add state variables inside WorkIntelligenceModal component
if 'isHowCalculatedOpen' not in modal_text:
    modal_text = modal_text.replace(
        "const [riskData, setRiskData] = useState(null);",
        "const [riskData, setRiskData] = useState(null);\n  const [isHowCalculatedOpen, setIsHowCalculatedOpen] = useState(false);\n  const [creatingCase, setCreatingCase] = useState(false);\n  const navigate = useNavigate();"
    )

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'w', encoding='utf-8') as f:
    f.write(modal_text)

print('State & imports updated')