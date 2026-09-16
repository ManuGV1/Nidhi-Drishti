import sys

content = r'''import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, HelpCircle, ShieldAlert, Cpu, ArrowRight, CornerDownLeft } from 'lucide-react';

export const NidhiAiAssistant = ({
  item = {},
  work = {},
  featureValues = {},
  evidenceJson = {},
  compliance = {},
  predictive = {},
  agency = {},
  amount = 0,
  riskScore = 50,
  riskLevel = 'MEDIUM',
  category = 'General Infrastructure',
  locState = null,
  locDistrict = null,
  locConstituency = null,
  locCity = null,
  locBlock = null,
  locVillage = null,
  locWard = null,
  hasRealCoords = false,
  realLat = null,
  realLng = null,
  status = 'RECOMMENDED'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: Hello! I am NIDHI AI, your explainable intelligence assistant for this Dossier.\n\nAsk me about this work's risk score (/100), peer median, IQR/Z-score formulas, location provenance, or recommended officer verification actions!
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const title = work.work_title || item.work_title || 'Public Work Dossier';
  const peerMedian = featureValues.peer_median;
  const ratioToMedian = featureValues.ratio_to_median;
  const bullets = evidenceJson.bullet_points || [];

  const fmtVal = (v) => (v ? ₹ : 'Not available in this source record');

  const generateAnswer = (question) => {
    const q = question.toLowerCase().trim();

    // 1. Why is this work high/critical risk / why flagged
    if (q.includes('why') && (q.includes('risk') || q.includes('flag') || q.includes('critical') || q.includes('high'))) {
      let ans = This work "" has a Composite Risk Score of /100 ( Risk Level).\n\nKey triggers for this flag:\n;
      ans += • Primary Risk Category: \n;
      if (peerMedian && amount) {
        const calcRatio = ratioToMedian || (amount / peerMedian).toFixed(2);
        ans += • Monetary Allocation:  is x the category peer median ().\n;
      }
      if (bullets.length > 0) {
        ans += • Diagnostic Evidence:\n + bullets.map(b =>   - ).join('\n') + '\n';
      }
      ans += \nAudit Note: Risk scores represent automated investigation priority, NOT proof of fraud. Human verification is required.;
      return ans;
    }

    // 2. How is the risk calculated
    if (q.includes('how') && (q.includes('calculated') || q.includes('calculation') || q.includes('score'))) {
      let ans = Risk Calculation Breakdown for "":\n\n;
      ans += 1. Peer Category Baseline: Category "" median allocation is .\n;
      if (amount && peerMedian) {
        ans += 2. Spending Ratio Calculation: Work Amount () / Peer Median () = x.\n;
      }
      ans += 3. Multi-Signal Fusion: Combines spending ratio variance, recommendation date burst patterns, description similarity indices, and stage velocity.\n;
      ans += 4. Final Score: Non-parametric risk score of /100 ().\n\n;
      ans += Note: Multi-signal weights are fused dynamically without arbitrary thresholds. Human verification is required.;
      return ans;
    }

    // 3. What is the peer median
    if (q.includes('peer median') && !q.includes('how is') && !q.includes('how calculate')) {
      if (peerMedian) {
        const calcRatio = ratioToMedian || (amount / peerMedian).toFixed(2);
        return For category "", the peer median allocation amount is .\nThis work's allocation of  is x the peer median.;
      }
      return Peer median for category "": Not available in this source record.;
    }

    // 4. How is the peer median calculated
    if (q.includes('how') && q.includes('peer median')) {
      return How Peer Median is Calculated:\n\nThe peer median is the 50th percentile monetary allocation across all verified historical works in the same LGD category ("").\nUnlike standard averages, the median is resilient against extreme outliers in public expenditure datasets.;
    }

    // 5. How is IQR calculated
    if (q.includes('iqr') || q.includes('interquartile')) {
      return How Interquartile Range (IQR) is Calculated:\n\n1. Quartile 1 (Q1): 25th percentile of peer category allocations.\n2. Quartile 3 (Q3): 75th percentile of peer category allocations.\n3. IQR Formula: IQR = Q3 - Q1 (middle 50% spread).\n4. Outlier Detection: Works exceeding Q3 + 1.5×IQR are flagged as statistical cost outliers.;
    }

    // 6. How is Z-score calculated
    if (q.includes('z-score') || q.includes('z score') || q.includes('zscore')) {
      return How Z-Score is Calculated:\n\nFormula: Z = (Work Amount - Peer Category Mean) / Standard Deviation.\n• Z = 0: Work amount equals the exact category average.\n• Z > +2.0: Work amount is over 2 standard deviations above average (statistically significant cost variance).;
    }

    // 7. What evidence supports the flag
    if (q.includes('evidence') || q.includes('support')) {
      if (bullets.length > 0) {
        return Diagnostic Evidence Findings for ID :\n\n + bullets.map((b, i) => ${i + 1}. ).join('\n') + \n\nAudit Note: Evidence findings serve as administrative investigation signals. Human verification required.;
      }
      return Diagnostic Evidence for ID :\n• Primary Flag Category: \n• Spending Ratio: x peer median.\n• Evidence Details: Not available in this source record.;
    }

    // 8. How much is this work completed / completion %
    if (q.includes('completed') || q.includes('progress') || q.includes('stage')) {
      const st = (status || '').toUpperCase();
      if (st.includes('COMPLETED')) {
        return Completion Status for "":\n• Current Stage: COMPLETED (100% stage completion recorded).\n• Completed Date: .;
      }
      if (st.includes('RECOMMENDED')) {
        return Completion Status for "":\n• Current Stage: RECOMMENDED (Stage 1 Proposal).\n• Physical Execution Progress: 0% (Work is recommended; sanction & agency tender process pending).\n• Recommended Date: .;
      }
      return Completion Status for "":\n• Current Recorded Stage: .\n• Exact physical completion %: Not available in this source record.;
    }

    // 9. What does Recommended mean
    if (q.includes('recommended mean') || (q.includes('what') && q.includes('recommended'))) {
      return Meaning of "RECOMMENDED" Status:\n\nIn the MPLADS / e-SAKSHI lifecycle:\n1. Stage 1 (Recommended): The Member of Parliament has formally submitted the project proposal.\n2. Next Steps: Implementing District Authority (IDA) evaluates technical estimates, issues administrative sanction, and awards execution tenders.\n3. Expenditure: No public funds are disbursed until sanction approval.;
    }

    // 10. Where is this work located
    if (q.includes('where') || q.includes('location') || q.includes('located') || q.includes('hierarchy')) {
      let ans = Administrative Location Chain for "":\n\n;
      ans += • State: \n;
      ans += • District: \n;
      ans += • Constituency: \n;
      ans += • City/Town: \n;
      ans += • Block: \n;
      ans += • Village/Locality: \n;
      ans += • Ward: \n\n;
      if (hasRealCoords) {
        ans += • GPS Coordinates: Verified ° N, ° E;
      } else {
        ans += • GPS Coordinates: Not available in this source record;
      }
      return ans;
    }

    // 11. What information is missing
    if (q.includes('missing')) {
      const missing = [];
      if (!locWard) missing.push('Ward Number');
      if (!locVillage) missing.push('Village / Locality');
      if (!locBlock) missing.push('Block Name');
      if (!locCity) missing.push('City / Town');
      if (!hasRealCoords) missing.push('Verified Geo-tag GPS Coordinates');
      if (!work.mp_name && !item.mp_name) missing.push('MP Name');
      if (!work.ida_name && !agency.ida_name) missing.push('Implementing District Authority (IDA)');

      if (missing.length > 0) {
        return Missing Source Fields for ID :\n\n + missing.map(m => • : Not available in this source record).join('\n') + \n\nNote: Zero fake data is generated. Unrecorded fields remain transparently flagged for human audit.;
      }
      return All primary administrative fields for ID  are present in the portal source record.;
    }

    // 12. What should the officer verify / recommended solution / action
    if (q.includes('verify') || q.includes('action') || q.includes('solution') || q.includes('officer') || q.includes('recommend')) {
      const codes = (item.reason_codes || [item.risk_category || 'COST_OUTLIER']);
      const codeStr = (Array.isArray(codes) ? codes.join(' ') : String(codes)).toUpperCase();

      let ans = Officer Recommended Verification Actions for "":\n\n;
      if (codeStr.includes('COST') || codeStr.includes('OUTLIER')) {
        ans += 1. Sanction Limits: Verify technical estimates against peer category median ().\n;
      }
      if (codeStr.includes('SIMILAR') || codeStr.includes('DESCRIPTION')) {
        ans += 2. Work Uniqueness: Confirm recommended works across neighboring constituencies are distinct projects.\n;
      }
      if (codeStr.includes('BURST') || codeStr.includes('CONCENTRATION')) {
        ans += 3. Recommendation Pattern: Audit single-day recommendation burst dates ().\n;
      }
      if (codeStr.includes('DELAY') || codeStr.includes('TIMELINE')) {
        ans += 4. Progress Audit: Inspect physical site progress and validate milestone completion certificates.\n;
      }
      ans += \nMandatory Rule: Risk is an investigation priority, NOT proof of fraud. Human verification required.;
      return ans;
    }

    // Default response
    return NIDHI AI Assistant Response for ID :\n\n• Work Title: \n• Category: \n• Allocation: \n• Risk Score: /100 ()\n• Location: , \n\nAsk me about risk calculations, peer medians, IQR/Z-scores, location details, evidence findings, or recommended officer verification actions!;
  };

  const handleSend = (queryText) => {
    const txt = queryText || inputQuery;
    if (!txt.trim()) return;

    const userMsg = { sender: 'user', text: txt };
    const answer = generateAnswer(txt);
    const aiMsg = { sender: 'ai', text: answer };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    if (!queryText) setInputQuery('');
  };

  const quickPills = [
    'Why is this work flagged?',
    'How is risk calculated?',
    'What is the peer median?',
    'How is IQR calculated?',
    'How is Z-score calculated?',
    'Where is this work located?',
    'What should officer verify?'
  ];

  return (
    <div className="relative z-30">
      {/* Floating Circular NIDHI AI Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-xl shadow-amber-500/10 border border-amber-400/30 transition-all cursor-pointer active:scale-95"
        title="Open NIDHI AI Assistant for this Dossier"
      >
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>NIDHI AI</span>
      </button>

      {/* Compact Assistant Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-20 right-6 sm:right-10 w-[90vw] max-w-md h-[460px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 z-50"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-mono">NIDHI AI Assistant</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Context: {title.slice(0, 32)}...</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={lex }
                >
                  <div
                    className={max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed font-sans }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Pills */}
            <div className="px-4 py-2 bg-slate-900/50 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickPills.map((pill, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(pill)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/20 text-[10px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask NIDHI AI about this Dossier..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-mono"
              />
              <button
                onClick={() => handleSend()}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NidhiAiAssistant;
'''

with open('d:/NidhiDristi/frontend/src/components/works/NidhiAiAssistant.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('NidhiAiAssistant.jsx created successfully')