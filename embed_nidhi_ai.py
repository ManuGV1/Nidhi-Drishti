import sys

# 1. Update WorkIntelligenceModal.jsx
with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'NidhiAiAssistant' not in text:
    text = text.replace(
        "import { apiService } from '../../api/client';",
        "import { apiService } from '../../api/client';\nimport { NidhiAiAssistant } from './NidhiAiAssistant';"
    )

    old_close_btn = '''            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>'''

    new_assistant_block = '''            <div className="flex items-center gap-3 shrink-0">
              <NidhiAiAssistant
                item={item}
                work={work}
                featureValues={featureValues}
                evidenceJson={evidenceJson}
                compliance={compliance}
                predictive={predictive}
                agency={agency}
                amount={amount}
                riskScore={riskScore}
                riskLevel={riskLevel}
                category={category}
                locState={locState}
                locDistrict={locDistrict}
                locConstituency={locConstituency}
                locCity={locCity}
                locBlock={locBlock}
                locVillage={locVillage}
                locWard={locWard}
                hasRealCoords={hasRealCoords}
                realLat={realLat}
                realLng={realLng}
                status={status}
              />
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>'''

    text = text.replace(old_close_btn, new_assistant_block)

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Update ExplainSheet.jsx
with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'r', encoding='utf-8') as f:
    text_sheet = f.read()

if 'NidhiAiAssistant' not in text_sheet:
    text_sheet = text_sheet.replace(
        "import { RiskBadge } from '../common/RiskBadge';",
        "import { RiskBadge } from '../common/RiskBadge';\nimport { NidhiAiAssistant } from '../works/NidhiAiAssistant';"
    )

    old_sheet_close = '''            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>'''

    new_sheet_assistant = '''            <div className="flex items-center gap-2 shrink-0">
              <NidhiAiAssistant
                item={anomalyItem}
                featureValues={featureValues}
                evidenceJson={anomalyItem.evidence_json || {}}
                amount={anomalyItem.amount || 0}
                riskScore={anomalyItem.risk_score || 50}
                riskLevel={anomalyItem.risk_level || 'MEDIUM'}
                category={anomalyItem.risk_category || 'General Infrastructure'}
                locState={locState}
                locDistrict={locDistrict}
                locConstituency={locConstituency}
                locCity={locCity}
                locBlock={locBlock}
                locVillage={locVillage}
                locWard={locWard}
                hasRealCoords={hasRealCoords}
                realLat={realLat}
                realLng={realLng}
                status={anomalyItem.work_type || 'RECOMMENDED'}
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>'''

    text_sheet = text_sheet.replace(old_sheet_close, new_sheet_assistant)

with open('d:/NidhiDristi/frontend/src/components/risks/ExplainSheet.jsx', 'w', encoding='utf-8') as f:
    f.write(text_sheet)

print('Embedded NidhiAiAssistant in WorkIntelligenceModal and ExplainSheet')