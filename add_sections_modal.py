import sys

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure icons are imported
needed_icons = ['HelpCircle', 'ChevronDown', 'ChevronUp', 'Cpu', 'CheckCircle2']
for icon in needed_icons:
    if icon not in text:
        text = text.replace("import { \n  X,", f"import {{\n  X,\n  {icon},")
        text = text.replace("import {\n  X,", f"import {{\n  X,\n  {icon},")
        text = text.replace("import { X,", f"import {{ X, {icon},")

sections_jsx = '''
            {/* ========================================================================= */}
            {/* 1. HOW AI CALCULATED THIS RISK (EXPLAINABLE RISK SUMMARY & FLOW) */}
            {/* ========================================================================= */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                    HOW AI CALCULATED THIS RISK
                  </h3>
                </div>
                <button
                  onClick={() => setIsHowCalculatedOpen(!isHowCalculatedOpen)}
                  className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>How is this calculated?</span>
                  {isHowCalculatedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Risk Score & Level</span>
                  <span className="font-bold text-rose-400">{riskScore.toFixed(1)} / 100 • {riskLevel}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Primary Reason Code</span>
                  <span className="font-bold text-amber-400">{item.risk_category || 'COST_OUTLIER'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Peer Median</span>
                  <span className="font-bold text-slate-200">{featureValues.peer_median ? formatINR(featureValues.peer_median) : 'Not available'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Spending Ratio</span>
                  <span className="font-bold text-indigo-400">
                    {featureValues.ratio_to_median ? ${featureValues.ratio_to_median}x : (amount && featureValues.peer_median ? ${(amount / featureValues.peer_median).toFixed(2)}x : '1.0x')}
                  </span>
                </div>
              </div>

              {/* Short Flow Visualization / Breadcrumbs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Calculation Pipeline Flow
                </span>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">Peer Benchmark</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">Statistical Anomaly</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">Multiple Signals</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">Evidence Fusion</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">Final Score ({riskScore.toFixed(1)})</span>
                </div>
              </div>

              {/* Expandable Explanation Text */}
              {isHowCalculatedOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-300 font-normal leading-relaxed space-y-1"
                >
                  <div className="font-bold text-indigo-300 font-mono text-[11px]">Non-Parametric Risk Fusion Methodology</div>
                  <p>
                    Antigravity ML Risk Fusion Engine computes non-parametric statistical anomaly scores (0–100) by evaluating work monetary allocation against LGD constituency and category peer medians, recommendation date burst patterns, description similarity indices, and stage progress velocity. Multi-signal evidence is fused dynamically without hardcoded thresholds.
                  </p>
                </motion.div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 2. AI RECOMMENDED RESPONSE (PRACTICAL VERIFICATION ACTIONS) */}
            {/* ========================================================================= */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                  AI RECOMMENDED RESPONSE
                </h3>
              </div>

              {/* Practical Verification Actions List */}
              <div className="space-y-2 text-xs">
                {(() => {
                  const codes = (item.reason_codes || [item.risk_category || 'COST_OUTLIER']);
                  const codeArray = Array.isArray(codes) ? codes : [codes];
                  const codeStr = codeArray.join(' ').toUpperCase();

                  const actions = [];
                  if (codeStr.includes('COST') || codeStr.includes('OUTLIER')) {
                    actions.push("Verify administrative sanction limit, technical estimate, and expenditure breakdown against peer category benchmarks.");
                  }
                  if (codeStr.includes('SIMILAR') || codeStr.includes('DESCRIPTION') || codeStr.includes('SPLIT')) {
                    actions.push("Review whether recommended works across constituencies/subdistricts are genuinely distinct projects or work splitting.");
                  }
                  if (codeStr.includes('CONCENTRATION') || codeStr.includes('BURST') || codeStr.includes('PATTERN')) {
                    actions.push("Audit single-day recommendation burst pattern and agency workload concentration.");
                  }
                  if (codeStr.includes('DELAY') || codeStr.includes('OVERRUN') || codeStr.includes('TIMELINE')) {
                    actions.push("Verify physical work progress on site and validate completion records against timeline.");
                  }
                  if (codeStr.includes('SANCTION') || codeStr.includes('FINANCIAL') || codeStr.includes('MISMATCH')) {
                    actions.push("Reconcile recommendation, sanction amount, and actual expenditure records.");
                  }
                  if (actions.length === 0) {
                    actions.push("Conduct routine administrative verification of sanction documents, allocation limits, and work progress.");
                  }

                  return actions.map((act, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* Mandatory Disclaimer Badge */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Audit Disclaimer:</strong> Risk is an investigation priority, not proof of fraud. Human verification required.
                </span>
              </div>
            </div>
'''

if 'HOW AI CALCULATED THIS RISK' not in text:
    text = text.replace('{/* DATA HONESTY NOTICE */}', sections_jsx + '\n\n            {/* DATA HONESTY NOTICE */}')

with open('d:/NidhiDristi/frontend/src/components/works/WorkIntelligenceModal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('WorkIntelligenceModal updated with Section 1 and Section 2')