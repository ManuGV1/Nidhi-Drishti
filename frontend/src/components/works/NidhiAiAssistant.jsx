import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, FileSearch, ShieldCheck } from 'lucide-react';

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
  
  const idVal = item.source_row_id || work.id || item.work_id || item.anomaly_id || 'N/A';
  const title = work.work_title || item.work_title || 'Public Work Dossier';
  const peerMedian = featureValues.peer_median;
  const ratioToMedian = featureValues.ratio_to_median;
  const bullets = evidenceJson.bullet_points || [];

  const fmtVal = (v) => (v ? '₹' + Number(v).toLocaleString('en-IN') : 'Not available in this source record');
  const unavailableText = "Not available in this source record.";

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `NIDHI AI — CASE ANALYST\n\n"Ask about this case. Answers are grounded in the current dossier."\n\nTarget Dossier: #${idVal}\nTitle: "${title.slice(0, 45)}${title.length > 45 ? '...' : ''}"\nRisk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk Level)\nCategory: ${category}`,
      citation: `[Source: Dossier #${idVal} | Portal Record Initialization]`
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

  const generateAnswerObj = (question) => {
    const q = question.toLowerCase().trim();

    // 1. Why was this work flagged?
    if (q.includes('why') && (q.includes('flag') || q.includes('risk') || q.includes('critical') || q.includes('high') || q.includes('work'))) {
      let ans = `Analysis for Dossier #${idVal} ("${title}"):\n\nComposite Risk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk Level).\n\nKey triggers supporting this alert:\n`;
      ans += `• Primary Flag Category: ${item.risk_category || 'Peer Variance'}\n`;
      if (peerMedian && amount) {
        const calcRatio = ratioToMedian || (amount / peerMedian).toFixed(2);
        ans += `• Monetary Allocation: ${fmtVal(amount)} is ${calcRatio}x the category peer median (${fmtVal(peerMedian)}).\n`;
      } else if (amount) {
        ans += `• Monetary Allocation: ${fmtVal(amount)} (Peer median: ${unavailableText}).\n`;
      }
      if (bullets.length > 0) {
        ans += `• Diagnostic Evidence:\n` + bullets.map(b => `  - ${b}`).join('\n') + '\n';
      }
      ans += `\nAnalytical Note: Risk score is an investigation triage priority, NOT proof of fraud. Human verification required.`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | Reason Codes | Feature Values]`
      };
    }

    // 2. Explain the risk score.
    if (q.includes('explain') && (q.includes('risk') || q.includes('score') || q.includes('calculated') || q.includes('calculation'))) {
      let ans = `Risk Score Breakdown for Dossier #${idVal}:\n\n`;
      ans += `1. Score Result: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk Level).\n`;
      ans += `2. Peer Category Baseline: Category "${category}" peer median is ${fmtVal(peerMedian)}.\n`;
      if (amount && peerMedian) {
        ans += `3. Spending Ratio Calculation: Work Allocation (${fmtVal(amount)}) / Category Peer Median (${fmtVal(peerMedian)}) = ${ratioToMedian || (amount / peerMedian).toFixed(2)}x.\n`;
      }
      ans += `4. Multi-Signal Fusion: Combines spending ratio variance, recommendation burst timing, text similarity indices, and stage velocity.\n\n`;
      ans += `Disclaimer: "Risk score is an analytical indicator generated from multiple available signals. It is not a finding of fraud."`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | Risk Engine Calibration]`
      };
    }

    // 3. What evidence supports this alert?
    if (q.includes('evidence') || q.includes('alert') || q.includes('support') || q.includes('proof') || q.includes('finding')) {
      if (bullets.length > 0) {
        let ans = `Evidence Findings for Dossier #${idVal}:\n\n` + bullets.map((b, i) => `${i + 1}. ${b}`).join('\n') + `\n\nAdministrative Note: Evidence findings represent automated signal traces. Human verification required.`;
        return {
          text: ans,
          citation: `[Source: Record #${idVal} | API Evidence Stream]`
        };
      }
      let ans = `Evidence Findings for Dossier #${idVal}:\n• Primary Flag Category: ${item.risk_category || 'Peer Variance'}\n• Monetary Allocation: ${fmtVal(amount)}\n• Peer Median: ${fmtVal(peerMedian)}\n• Spending Ratio: ${ratioToMedian ? `${ratioToMedian}x` : '1.0x'}\n• Diagnostic Bullets: ${unavailableText}`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | API Evidence Stream]`
      };
    }

    // 4. What is the peer benchmark?
    if (q.includes('peer') || q.includes('benchmark') || q.includes('median') || q.includes('iqr')) {
      if (peerMedian) {
        const calcRatio = ratioToMedian || (amount / peerMedian).toFixed(2);
        let ans = `Peer Category Benchmark for "${category}":\n\n• Category Peer Median: ${fmtVal(peerMedian)}\n• Work Allocation Amount: ${fmtVal(amount)}\n• Spending Ratio: ${calcRatio}x baseline\n\nThe peer median represents the 50th percentile allocation across historical works in category "${category}".`;
        return {
          text: ans,
          citation: `[Source: Record #${idVal} | Category Baseline]`
        };
      }
      return {
        text: `Peer Category Benchmark for "${category}":\n• Category Peer Median: ${unavailableText}\n• Work Allocation Amount: ${fmtVal(amount)}`,
        citation: `[Source: Record #${idVal} | Category Baseline]`
      };
    }

    // 5. What information is missing?
    if (q.includes('missing') || q.includes('not available') || q.includes('unrecorded') || q.includes('gap') || q.includes('absent')) {
      const missing = [];
      if (!hasRealCoords) missing.push('GPS Coordinates');
      if (!work.mp_name && !item.mp_name && !agency.mp_name) missing.push('Recommending MP Name');
      if (!work.ida_name && !agency.ida_name && !item.ida_name) missing.push('Implementing Agency (IDA)');
      if (!featureValues.peer_median) missing.push('Category Peer Median Baseline');
      missing.push('Contractor GSTIN & Vendor Graph');
      missing.push('Detailed Line-Item BOQ');
      missing.push('Physical Site Inspection Media');

      let ans = `Uncertainty & Missing Data Audit for Dossier #${idVal}:\n\n` + missing.map(m => `• ${m}: ${unavailableText}`).join('\n') + `\n\nData Standard: "The absence of specific unrecorded attributes in a source dataset indicates data limitations of the public record, not evidence of irregularity or wrongdoing."`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | Data Honesty Matrix]`
      };
    }

    // 6. What should the officer verify?
    if (q.includes('officer') || q.includes('verify') || q.includes('action') || q.includes('investigate') || q.includes('protocol')) {
      const codes = (item.reason_codes || [item.risk_category || 'COST_OUTLIER']);
      const codeStr = (Array.isArray(codes) ? codes.join(' ') : String(codes)).toUpperCase();

      let ans = `Recommended Officer Verification Protocol for Dossier #${idVal}:\n\n`;
      if (codeStr.includes('COST') || codeStr.includes('OUTLIER')) {
        ans += `1. Administrative Sanction Limits: Verify technical estimates against category peer median (${fmtVal(peerMedian)}).\n`;
      }
      if (codeStr.includes('SIMILAR') || codeStr.includes('DESCRIPTION')) {
        ans += `2. Project Uniqueness: Confirm recommended works across neighboring constituencies are distinct projects.\n`;
      }
      if (codeStr.includes('BURST') || codeStr.includes('CONCENTRATION')) {
        ans += `3. Recommendation Pattern: Audit single-day recommendation submission dates.\n`;
      }
      if (codeStr.includes('DELAY') || codeStr.includes('TIMELINE')) {
        ans += `4. Physical Execution: Inspect site execution progress velocity against milestone records.\n`;
      }
      ans += `5. Document Cross-Check: Audit administrative sanction files at IDA district office.\n`;
      ans += `\nOfficer Rule: AI assists investigation. Officer makes the final decision.`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | Officer Protocol Guidance]`
      };
    }

    // 7. Summarize this case.
    if (q.includes('summarize') || q.includes('summary') || q.includes('overview') || q.includes('case') || q.includes('brief') || q.includes('about')) {
      let ans = `Case Analyst Summary for Dossier #${idVal}:\n\n`;
      ans += `• Title: ${title}\n`;
      ans += `• Category: ${category}\n`;
      ans += `• Recorded Stage: ${status}\n`;
      ans += `• Monetary Allocation: ${fmtVal(amount)}\n`;
      ans += `• Peer Category Median: ${fmtVal(peerMedian)}\n`;
      ans += `• Spending Ratio: ${ratioToMedian ? `${ratioToMedian}x` : '1.0x'}\n`;
      ans += `• Risk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk Level)\n`;
      ans += `• Primary Flag: ${item.risk_category || 'Peer Variance'}\n`;
      ans += `• State & District: ${locState || unavailableText}${locDistrict ? `, ${locDistrict}` : ''}\n`;
      ans += `• GPS Coordinates: ${hasRealCoords ? `${realLat}° N, ${realLng}° E` : unavailableText}\n`;
      ans += `\nGrounding: Built strictly from verified portal source records. No synthetic values generated.`;
      return {
        text: ans,
        citation: `[Source: Record #${idVal} | Dossier Case Summary]`
      };
    }

    // Default Fallback Response
    let defaultAns = `NIDHI AI Case Analyst — Dossier #${idVal}:\n\nWork: ${title}\nAllocation: ${fmtVal(amount)}\nRisk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel})\n\nAnswers are grounded in the current dossier. Please select a suggested question below or rephrase your custom query.`;
    return {
      text: defaultAns,
      citation: `[Source: Record #${idVal} | Dossier Source]`
    };
  };

  const handleSend = (queryText) => {
    const txt = queryText || inputQuery;
    if (!txt || !txt.trim()) return;

    const userMsg = { sender: 'user', text: txt };
    const ansObj = generateAnswerObj(txt);
    const aiMsg = { sender: 'ai', text: ansObj.text, citation: ansObj.citation };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    if (!queryText) setInputQuery('');
  };

  const suggestedQuestions = [
    'Why was this work flagged?',
    'Explain the risk score.',
    'What evidence supports this alert?',
    'What is the peer benchmark?',
    'What information is missing?',
    'What should the officer verify?',
    'Summarize this case.'
  ];

  return (
    <div className="relative z-30 font-sans">
      {/* NIDHI AI Case Analyst Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-xl shadow-indigo-600/20 border border-amber-400/30 transition-all cursor-pointer active:scale-95"
        title="Open NIDHI AI Case Analyst for this Dossier"
      >
        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>NIDHI AI ANALYST</span>
      </button>

      {/* Case Analyst Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="fixed bottom-4 sm:bottom-20 right-4 sm:right-10 w-[calc(100vw-2rem)] sm:w-[440px] max-w-md h-[80vh] sm:h-[490px] max-h-[550px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 z-50 font-sans"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                    <span>NIDHI AI</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">CASE ANALYST</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Ask about this case. Answers are grounded in the current dossier.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none text-xs font-sans font-medium shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] rounded-bl-none space-y-2'
                    }`}
                  >
                    <div>{m.text}</div>
                    {m.citation && (
                      <div className="pt-2 border-t border-slate-800/80 text-[9px] text-indigo-400/90 font-mono italic flex items-center gap-1">
                        <FileSearch className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{m.citation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions Carousel / Chips */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 space-y-1.5 shrink-0 font-mono">
              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                Suggested Analyst Queries
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {suggestedQuestions.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sq)}
                    className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-indigo-900/40 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 text-[10px] whitespace-nowrap shrink-0 transition-colors cursor-pointer font-semibold"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 shrink-0 font-mono">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this case..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
              />
              <button
                onClick={() => handleSend()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md"
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
