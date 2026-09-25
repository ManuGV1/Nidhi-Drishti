import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ShieldAlert, FolderPlus, CheckCircle2, FileText, Copy, Check, FileSearch, Layers, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/client';
import { RiskBadge } from '../common/RiskBadge';
import { NidhiAiAssistant } from '../works/NidhiAiAssistant';

export const ExplainSheet = ({ isOpen, onClose, anomalyItem, onInitiateCase, onViewProfile }) => {
  const [creatingCase, setCreatingCase] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !anomalyItem) return null;

  const item = anomalyItem || {};
  const featureValues = item.feature_values_json || {};
  const evidenceJson = item.evidence_json || {};
  const evidenceBullets = evidenceJson.bullet_points || [];
  const compliance = evidenceJson.compliance || {};
  const predictive = evidenceJson.predictive || {};
  const agency = evidenceJson.agency || {};

  const idVal = item.source_row_id || item.work_id || item.anomaly_id || 'N/A';
  const title = item.work_title || 'Public Work Anomaly Evaluation';
  const category = item.risk_category || 'General Infrastructure';
  const mpName = item.mp_name || agency.mp_name || null;
  const idaName = item.ida_name || agency.ida_name || null;
  const amount = item.amount || 0.0;
  const status = item.work_status || item.work_type || 'RECOMMENDED';
  const recDate = featureValues.recommended_date;
  const riskScore = item.risk_score !== undefined ? item.risk_score : 50.0;
  const riskLevel = item.risk_level || 'MEDIUM';
  const sourceDataset = item.source_dataset || 'Portal Source Dataset';

  // Location Hierarchy
  const locState = item.state_name || null;
  const locDistrict = item.district_name || item.district || featureValues.district || null;
  const locConstituency = item.constituency_name || item.constituency || null;
  const locCity = item.city || featureValues.city || null;
  const locBlock = item.block || featureValues.block || null;
  const locVillage = item.village || featureValues.village || featureValues.locality || null;
  const locWard = item.ward || featureValues.ward || null;

  // Coordinates
  const realLat = item.latitude || featureValues.latitude || null;
  const realLng = item.longitude || featureValues.longitude || null;
  const hasRealCoords = realLat && realLng && !isNaN(realLat) && !isNaN(realLng);

  const formatINR = (val) => {
    if (!val || val === 0) return 'Not available in this source record';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const unavailableText = "Not available in this source record.";

  const handleGenerateBrief = () => {
    const briefText = `==================================================
NIDHI DRISHTI — INTELLIGENCE CASE BRIEF
==================================================
Case ID: WORK-${idVal}
Title: ${title}
Category: ${category}
Status: ${status}
Risk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk)
Source Dataset: ${sourceDataset}
--------------------------------------------------
MONETARY ALLOCATION: ${formatINR(amount)}
PEER CATEGORY MEDIAN: ${featureValues.peer_median ? formatINR(featureValues.peer_median) : unavailableText}
SPENDING RATIO: ${featureValues.ratio_to_median ? `${featureValues.ratio_to_median}x` : '1.0x'}
--------------------------------------------------
LOCATION PROVENANCE:
- State: ${locState || unavailableText}
- District: ${locDistrict || unavailableText}
- Constituency: ${locConstituency || unavailableText}
- City/Town: ${locCity || unavailableText}
- Block: ${locBlock || unavailableText}
- Village/Locality: ${locVillage || unavailableText}
- Ward: ${locWard || unavailableText}
- GPS Coordinates: ${hasRealCoords ? `${realLat}° N, ${realLng}° E` : unavailableText}
--------------------------------------------------
ADMINISTRATIVE PROVENANCE:
- Recommending MP: ${mpName || unavailableText}
- Implementing Agency (IDA): ${idaName || unavailableText}
--------------------------------------------------
PRIMARY RISK REASON CODES:
${(item.reason_codes || [category]).map(c => `- ${c}`).join('\n')}

EVIDENCE SIGNALS:
${evidenceBullets.length > 0 ? evidenceBullets.map(b => `- ${b}`).join('\n') : `- Primary Flag: ${category}`}

RECOMMENDED VERIFICATION:
- Verify administrative sanction limit against technical estimate and category baseline.
- Audit physical execution progress and milestone records at IDA district office.
==================================================`;

    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  const handleInitiateCase = async () => {
    setCreatingCase(true);
    try {
      const payload = {
        work_type: item.work_type || 'RECOMMENDED',
        source_row_id: item.source_row_id || item.work_id || item.anomaly_id || idVal,
        priority: riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        assigned_to: 'Inspector General - Public Audit'
      };
      await apiService.createInvestigationCase(payload);
      if (onInitiateCase) {
        onInitiateCase(item);
      } else {
        onClose();
        navigate('/investigations');
      }
    } catch (err) {
      console.error('Failed to create investigation case:', err);
      if (onInitiateCase) onInitiateCase(item);
      else navigate('/investigations');
    } finally {
      setCreatingCase(false);
    }
  };

  const getReasonExplanation = (code) => {
    const c = String(code).toUpperCase();
    if (c.includes('COST') || c.includes('OUTLIER')) {
      return "Monetary allocation is significantly higher than historical category peer baseline median.";
    }
    if (c.includes('SIMILAR') || c.includes('DESCRIPTION')) {
      return "Work title shares high TF-IDF text similarity with multiple other project recommendations.";
    }
    if (c.includes('BATCH') || c.includes('RECOMMENDATION')) {
      return "Recommended in a single batch alongside multiple similar infrastructure works on the same date.";
    }
    if (c.includes('BURST') || c.includes('CONCENTRATION')) {
      return "High density burst of project recommendations submitted in a narrow time window.";
    }
    if (c.includes('DELAY') || c.includes('TIMELINE')) {
      return "Work execution velocity is lagging behind expected completion timeline standards.";
    }
    return "Computational statistical anomaly flagged during automated multi-signal peer scanning.";
  };

  const buildEvidenceChains = () => {
    const chains = [];
    const reasonCodes = item.reason_codes || [category];

    reasonCodes.forEach((code, index) => {
      const codeStr = String(code).toUpperCase();
      let signalTitle = "";
      let whyExplanation = "";
      let evidenceDetail = "";
      let interpretationText = "";
      let officerAction = "";

      if (codeStr.includes('COST') || codeStr.includes('OUTLIER')) {
        signalTitle = "Cost Allocation Anomaly Flagged";
        whyExplanation = getReasonExplanation(code);
        if (amount && featureValues.peer_median) {
          const ratioVal = featureValues.ratio_to_median || (amount / featureValues.peer_median).toFixed(2);
          evidenceDetail = `Work Allocation: ${formatINR(amount)} | Category Peer Median: ${formatINR(featureValues.peer_median)} | Spending Ratio: ${ratioVal}x`;
          interpretationText = `This allocation is ${ratioVal}x higher than standard peer median baseline for category "${category}", indicating an unusual cost pattern requiring verification.`;
        } else if (amount) {
          evidenceDetail = `Work Allocation: ${formatINR(amount)} | Category Peer Median: ${unavailableText}`;
          interpretationText = "Monetary allocation is recorded in source dataset but category peer median is not available in this source record.";
        } else {
          evidenceDetail = unavailableText;
          interpretationText = unavailableText;
        }
        officerAction = "Verify administrative sanction limit, technical estimate, and expenditure breakdown against peer category benchmarks.";
      } 
      else if (codeStr.includes('SIMILAR') || codeStr.includes('DESCRIPTION')) {
        signalTitle = "Text Similarity Signal Flagged";
        whyExplanation = getReasonExplanation(code);
        if (evidenceBullets && evidenceBullets.length > 0) {
          evidenceDetail = evidenceBullets[0];
        } else {
          evidenceDetail = `Work Title: "${title}" | TF-IDF text similarity index flagged.`;
        }
        interpretationText = "This indicates a potential pattern of identical description wording across recommendations requiring uniqueness verification.";
        officerAction = "Review whether recommended works across constituencies/subdistricts are genuinely distinct projects or work splitting.";
      }
      else {
        signalTitle = `Peer Anomaly Flagged (${code})`;
        whyExplanation = getReasonExplanation(code);
        if (evidenceBullets && evidenceBullets.length > 0) {
          evidenceDetail = evidenceBullets[0];
        } else {
          evidenceDetail = `Risk Score: ${riskScore.toFixed(1)} / 100 (${riskLevel} Risk Level)`;
        }
        interpretationText = "This indicates an unusual multi-signal peer pattern requiring routine administrative triage.";
        officerAction = "Conduct routine administrative verification of sanction documents, allocation limits, and work progress.";
      }

      chains.push({
        id: index + 1,
        code: code,
        signal: signalTitle,
        why: whyExplanation,
        evidence: evidenceDetail,
        interpretation: interpretationText,
        officerAction: officerAction
      });
    });

    return chains;
  };

  const evidenceChains = buildEvidenceChains();

  const buildEvidenceMatrix = () => {
    if (!evidenceChains || evidenceChains.length === 0) {
      return [{
        signal: item.risk_category || 'Peer Variance Signal',
        evidence: evidenceBullets && evidenceBullets.length > 0 ? evidenceBullets[0] : (amount ? formatINR(amount) : unavailableText),
        interpretation: "Multi-signal peer variance evaluation recorded in system."
      }];
    }
    return evidenceChains.map(c => ({
      signal: c.signal || 'Peer Signal',
      evidence: c.evidence || unavailableText,
      interpretation: c.interpretation || 'Signal recorded for review.'
    }));
  };

  const evidenceMatrix = buildEvidenceMatrix();

  const getAvailableContributingSignals = () => {
    const signals = [];
    const reasonCodesStr = String((item.reason_codes || [category || '']).join(' ')).toUpperCase();

    // 1. Financial Signal
    if (amount || featureValues.peer_median || featureValues.ratio_to_median || reasonCodesStr.includes('COST') || reasonCodesStr.includes('OUTLIER')) {
      const parts = [];
      if (amount) parts.push(`Allocation: ${formatINR(amount)}`);
      if (featureValues.peer_median) parts.push(`Category Peer Median: ${formatINR(featureValues.peer_median)}`);
      if (featureValues.ratio_to_median) parts.push(`Spending Ratio: ${featureValues.ratio_to_median}x`);
      
      signals.push({
        type: 'Financial',
        label: 'Financial Allocation Signal',
        evidence: parts.length > 0 ? parts.join(' | ') : 'Monetary allocation flagged relative to category peer baseline.'
      });
    }

    // 2. Temporal Signal
    if (recDate || reasonCodesStr.includes('BATCH') || reasonCodesStr.includes('BURST') || reasonCodesStr.includes('CONCENTRATION')) {
      const parts = [];
      if (recDate) parts.push(`Recommendation Date: ${new Date(recDate).toLocaleDateString('en-IN')}`);
      if (parts.length === 0) parts.push('Submission date cluster detected in time series analysis.');

      signals.push({
        type: 'Temporal',
        label: 'Temporal & Timing Signal',
        evidence: parts.join(' | ')
      });
    }

    // 3. Compliance Signal
    if (compliance.compliance_score !== undefined || (compliance.rules_triggered && compliance.rules_triggered.length > 0)) {
      const parts = [];
      if (compliance.compliance_score !== undefined) parts.push(`Compliance Score: ${compliance.compliance_score}/100`);
      if (compliance.rules_triggered && compliance.rules_triggered.length > 0) parts.push(`Rules Triggered: ${compliance.rules_triggered.length}`);
      
      signals.push({
        type: 'Compliance',
        label: 'Compliance Engine Signal',
        evidence: parts.join(' | ')
      });
    }

    // 4. Text Similarity Signal
    if (reasonCodesStr.includes('SIMILAR') || reasonCodesStr.includes('DESCRIPTION') || reasonCodesStr.includes('TFIDF')) {
      signals.push({
        type: 'Text Similarity',
        label: 'Text Similarity Signal',
        evidence: `TF-IDF wording similarity index flagged across project descriptions.`
      });
    }

    // 5. Predictive Signal
    if (predictive.delay_risk_score !== undefined || predictive.escalation_probability !== undefined) {
      const parts = [];
      if (predictive.delay_risk_score !== undefined) parts.push(`Delay Risk Score: ${predictive.delay_risk_score}/100`);
      if (predictive.escalation_probability !== undefined) parts.push(`Escalation Probability: ${(predictive.escalation_probability * 100).toFixed(1)}%`);
      
      signals.push({
        type: 'Predictive',
        label: 'Predictive Early Warning Signal',
        evidence: parts.join(' | ')
      });
    }

    // 6. Agency Signal
    if (agency.agency_risk_score !== undefined || agency.ida_workload_count || idaName) {
      const parts = [];
      if (agency.agency_risk_score !== undefined) parts.push(`Agency Risk Score: ${agency.agency_risk_score}/100`);
      if (agency.ida_workload_count) parts.push(`Active Works: ${agency.ida_workload_count}`);
      if (idaName) parts.push(`Agency: ${idaName}`);
      
      signals.push({
        type: 'Agency',
        label: 'Agency Workload Signal',
        evidence: parts.join(' | ')
      });
    }

    return signals;
  };

  const contributingSignals = getAvailableContributingSignals();

  const buildEvidenceStatusData = () => {
    const supportingSignals = [];
    const reasonCodes = item.reason_codes || [category];
    reasonCodes.forEach(code => {
      supportingSignals.push({
        title: `Flag Signal: ${code}`,
        detail: getReasonExplanation(code)
      });
    });
    if (evidenceBullets && evidenceBullets.length > 0) {
      evidenceBullets.forEach(b => {
        supportingSignals.push({
          title: "Diagnostic Peer Finding",
          detail: b
        });
      });
    }

    const availableEvidence = [];
    if (amount) {
      availableEvidence.push({ field: "Work Allocation Amount", value: formatINR(amount) });
    }
    if (featureValues.peer_median) {
      availableEvidence.push({ field: "Category Peer Median", value: formatINR(featureValues.peer_median) });
    }
    if (featureValues.ratio_to_median) {
      availableEvidence.push({ field: "Spending Ratio", value: `${featureValues.ratio_to_median}x` });
    }
    if (recDate) {
      availableEvidence.push({ field: "Recommendation Date", value: new Date(recDate).toLocaleDateString('en-IN') });
    }
    if (compliance.compliance_score !== undefined) {
      availableEvidence.push({ field: "Compliance Engine Score", value: `${compliance.compliance_score}/100` });
    }
    if (locState) {
      availableEvidence.push({ field: "State Provenance", value: locState });
    }
    if (locDistrict) {
      availableEvidence.push({ field: "District Location", value: locDistrict });
    }
    if (hasRealCoords) {
      availableEvidence.push({ field: "GPS Coordinates", value: `${realLat}° N, ${realLng}° E` });
    }
    if (mpName) {
      availableEvidence.push({ field: "Recommending MP", value: mpName });
    }
    if (idaName) {
      availableEvidence.push({ field: "Implementing Agency (IDA)", value: idaName });
    }

    const notAvailableFields = [];
    if (!hasRealCoords) {
      notAvailableFields.push({ field: "GPS Coordinates", status: unavailableText });
    }
    if (!mpName) {
      notAvailableFields.push({ field: "Recommending MP Name", status: unavailableText });
    }
    if (!idaName) {
      notAvailableFields.push({ field: "Implementing Agency (IDA)", status: unavailableText });
    }
    if (!featureValues.peer_median) {
      notAvailableFields.push({ field: "Category Peer Median Baseline", status: unavailableText });
    }
    notAvailableFields.push({ field: "Contractor GSTIN & Vendor Graph", status: unavailableText });
    notAvailableFields.push({ field: "Detailed Line-Item BOQ", status: unavailableText });
    notAvailableFields.push({ field: "Physical Site Inspection Media", status: unavailableText });

    const officerVerifications = [];
    const codeStr = String(reasonCodes.join(' ')).toUpperCase();
    if (codeStr.includes('COST') || codeStr.includes('OUTLIER')) {
      officerVerifications.push("Verify administrative sanction limit, technical estimate, and expenditure breakdown against peer category benchmarks.");
    }
    if (codeStr.includes('SIMILAR') || codeStr.includes('DESCRIPTION')) {
      officerVerifications.push("Review whether recommended works across constituencies/subdistricts are genuinely distinct projects or work splitting.");
    }
    if (codeStr.includes('BATCH') || codeStr.includes('BURST') || codeStr.includes('CONCENTRATION')) {
      officerVerifications.push("Audit single-day recommendation burst pattern and implementing agency workload concentration.");
    }
    if (codeStr.includes('DELAY') || codeStr.includes('TIMELINE')) {
      officerVerifications.push("Verify physical work progress on site and validate completion records against milestone timeline.");
    }
    if (officerVerifications.length === 0) {
      officerVerifications.push("Conduct routine administrative verification of sanction documents, allocation limits, and work progress.");
    }

    return {
      supportingSignals,
      availableEvidence,
      notAvailableFields,
      officerVerifications
    };
  };

  const evidenceStatus = buildEvidenceStatusData();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/85 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-full max-w-3xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto text-slate-100"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                <FileSearch className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  <span className="font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    EXPLAINABLE DOSSIER
                  </span>
                  <span className="text-slate-400 font-bold">DOSSIER #{idVal}</span>
                </div>
                <h2 className="text-base font-bold text-slate-100 truncate mt-0.5">
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGenerateBrief}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Copy formatted case brief to clipboard"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedBrief ? 'Brief Copied!' : 'Generate Brief'}</span>
              </button>

              <NidhiAiAssistant
                item={item}
                featureValues={featureValues}
                evidenceJson={evidenceJson}
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
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content (7-Section Investigation Flow) */}
          <div className="p-5 space-y-5 flex-1 text-xs">
            {/* 1. CASE HEADER */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  1. CASE HEADER // OVERVIEW
                </span>
                <span className="text-[10px] font-mono text-slate-400">Record ID: {idVal}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <RiskBadge score={riskScore} level={riskLevel} size="md" />
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">Risk Score</span>
                    <span className="font-bold text-slate-100 font-mono text-xs">{riskScore.toFixed(1)} / 100</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5 font-mono">
                  <span className="text-[9px] text-slate-400 uppercase block">Monetary Amount</span>
                  <div className="text-xs font-extrabold text-amber-400">{formatINR(amount)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Source Dataset</span>
                  <div className="text-xs font-bold text-slate-200 truncate">{sourceDataset}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5 font-mono">
                  <span className="text-[9px] text-slate-400 uppercase block">Status</span>
                  <div className="text-xs font-extrabold text-emerald-400 uppercase">{status}</div>
                </div>
              </div>
            </div>

            {/* VISUALLY DISTINCTIVE EVIDENCE CHAIN */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40 border border-indigo-500/30 shadow-xl space-y-4 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  EVIDENCE CHAIN // VERIFIED CAUSAL PATH
                </span>
                <span className="text-[9px] text-slate-400">{evidenceChains.length} Chain(s)</span>
              </div>

              {evidenceChains.map((chain, cIdx) => (
                <div key={cIdx} className="space-y-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  {/* Step 1: SIGNAL */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">STEP 01 // SIGNAL</span>
                    <div className="text-xs font-bold text-slate-100 font-mono">"{chain.signal}"</div>
                  </div>
                  <div className="text-center font-mono font-bold text-xs text-indigo-400 -my-0.5">↓ WHY</div>
                  {/* Step 2: WHY */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase block">STEP 02 // WHY</span>
                    <div className="text-xs text-slate-200">{chain.why}</div>
                  </div>
                  <div className="text-center font-mono font-bold text-xs text-indigo-400 -my-0.5">↓ EVIDENCE</div>
                  {/* Step 3: EVIDENCE */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-indigo-500/40 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase block">STEP 03 // EVIDENCE</span>
                    <div className="text-xs font-mono text-indigo-200">{chain.evidence}</div>
                  </div>
                  <div className="text-center font-mono font-bold text-xs text-indigo-400 -my-0.5">↓ INTERPRETATION</div>
                  {/* Step 4: INTERPRETATION */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase block">STEP 04 // INTERPRETATION</span>
                    <div className="text-xs text-slate-200">"{chain.interpretation}"</div>
                  </div>
                  <div className="text-center font-mono font-bold text-xs text-indigo-400 -my-0.5">↓ OFFICER ACTION</div>
                  {/* Step 5: OFFICER ACTION */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-violet-500/40 space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-violet-400 uppercase block">STEP 05 // OFFICER ACTION</span>
                    <div className="text-xs text-violet-200 font-medium">{chain.officerAction}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. WHY THIS CASE? */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-100">
                  2. WHY THIS CASE? // PRIMARY TRIGGERS
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">{category}</span>
              </div>
              <div className="space-y-2">
                {(item.reason_codes || [category]).map((code, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">{code}</span>
                      <span className="text-[9px] text-slate-500">Flag Signal</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{getReasonExplanation(code)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. RISK INTELLIGENCE PRESENTATION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-100">
                  3. RISK INTELLIGENCE // CONTRIBUTING SIGNALS
                </span>
                <span className="text-[9px] text-slate-400">{contributingSignals.length} Signal(s)</span>
              </div>

              {/* Sophisticated Risk Score Banner */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">RISK SCORE</span>
                    <div className="text-xl font-black font-mono text-slate-100">
                      {riskScore.toFixed(0)} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${
                    riskLevel === 'CRITICAL' ? 'bg-rose-950/50 text-rose-400 border-rose-800/60' :
                    riskLevel === 'HIGH' ? 'bg-amber-950/50 text-amber-400 border-amber-800/60' :
                    riskLevel === 'MEDIUM' ? 'bg-yellow-950/50 text-yellow-400 border-yellow-800/60' :
                    'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                  }`}>
                    {riskLevel}
                  </span>
                </div>

                {/* Subtle Disclaimer */}
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed pt-1 border-t border-slate-800/80">
                  "Risk score is an analytical indicator generated from multiple available signals. It is not a finding of fraud."
                </p>
              </div>

              {/* Available Signals */}
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">
                  Contributing Signals ({contributingSignals.length})
                </span>
                <div className="grid grid-cols-1 gap-2 font-mono">
                  {contributingSignals.map((sig, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-indigo-300">{sig.type} Signal</span>
                        <span className="text-[9px] text-slate-500">Verified Metric</span>
                      </div>
                      <p className="text-xs text-slate-200 pt-0.5 leading-relaxed">{sig.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. EVIDENCE MATRIX */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-100">
                  4. EVIDENCE MATRIX // SIGNAL • EVIDENCE • INTERPRETATION
                </span>
                <span className="text-[10px] font-mono text-slate-500">{evidenceMatrix.length} Tier(s)</span>
              </div>
              <div className="space-y-2">
                {evidenceMatrix.map((row, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-400 font-bold">SIGNAL: {row.signal}</span>
                      <span className="text-indigo-400">EVIDENCE: {row.evidence}</span>
                    </div>
                    <p className="text-xs text-slate-300 pt-0.5">{row.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. EVIDENCE STATUS // UNCERTAINTY & MISSING EVIDENCE AUDIT */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-100">
                  5. EVIDENCE STATUS // AUDIT UNCERTAINTY MATRIX
                </span>
                <span className="text-[9px] text-slate-400">Institutional Standard</span>
              </div>

              {/* Institutional Disclaimer */}
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 uppercase block">Absence of Evidence Standard:</strong>
                  "The absence of specific unrecorded attributes in a source dataset indicates data limitations of the public record, not evidence of irregularity or wrongdoing."
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* 1. SUPPORTING SIGNALS */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">
                    SUPPORTING SIGNALS ({evidenceStatus.supportingSignals.length})
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {evidenceStatus.supportingSignals.map((st, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 space-y-0.5">
                        <span className="text-amber-400 font-bold block text-[10px]">{st.title}</span>
                        <p className="text-slate-300 leading-snug">{st.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. AVAILABLE EVIDENCE */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                    AVAILABLE EVIDENCE ({evidenceStatus.availableEvidence.length})
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {evidenceStatus.availableEvidence.map((ev, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{ev.field}:</span>
                        <span className="font-bold text-slate-100">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. NOT AVAILABLE */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    NOT AVAILABLE ({evidenceStatus.notAvailableFields.length})
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {evidenceStatus.notAvailableFields.map((na, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">{na.field}:</span>
                        <span className="text-slate-500 italic font-sans">{na.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. OFFICER SHOULD VERIFY */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block">
                    OFFICER SHOULD VERIFY ({evidenceStatus.officerVerifications.length})
                  </span>
                  <div className="space-y-1.5 text-[11px]">
                    {evidenceStatus.officerVerifications.map((actionText, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{actionText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. RECOMMENDED VERIFICATION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-100">
                  6. RECOMMENDED VERIFICATION // PROTOCOL
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verify administrative sanction limit, technical estimate, and expenditure breakdown against category benchmarks.</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Audit Disclaimer:</strong> Risk is an investigation priority, not proof of fraud. Human verification required.</span>
              </div>
            </div>
          </div>

          {/* 7. INVESTIGATION ACTIONS FOOTER */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 sticky bottom-0 z-10">
            <button
              onClick={handleInitiateCase}
              disabled={creatingCase}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{creatingCase ? 'Creating...' : 'CREATE INVESTIGATION'}</span>
            </button>
            <button
              onClick={handleGenerateBrief}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            >
              {copiedBrief ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => onViewProfile && onViewProfile(item)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExplainSheet;

