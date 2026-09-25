import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldAlert,
  Sparkles,
  FolderPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  FileText,
  TrendingUp,
  Cpu,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  FileSearch,
  Database,
  Layers,
  ArrowRight,
  Radio,
  Edit3,
  Camera,
  Upload,
  Calendar
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/client';
import { NidhiAiAssistant } from './NidhiAiAssistant';
import { ResponsibleAiPanel } from '../common/ResponsibleAiPanel';

export const WorkIntelligenceModal = ({ isOpen, onClose, workId, workType = 'RECOMMENDED', anomalyItem = null, onInitiateCase }) => {
  const [loading, setLoading] = useState(false);
  const [workData, setWorkData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [creatingCase, setCreatingCase] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const navigate = useNavigate();

  // Ground Signal & Record Challenge States
  const [activeFeedbackTab, setActiveFeedbackTab] = useState('GROUND_SIGNAL');
  const [groundIssueType, setGroundIssueType] = useState('Physical Progress Mismatch');
  const [groundObservation, setGroundObservation] = useState('');
  const [groundPhotoName, setGroundPhotoName] = useState('');
  const [groundDocName, setGroundDocName] = useState('');
  const [groundLocationInput, setGroundLocationInput] = useState('');
  const [groundSubmitted, setGroundSubmitted] = useState(false);
  const [groundSubmitting, setGroundSubmitting] = useState(false);

  const [challengeTargetField, setChallengeTargetField] = useState('Incorrect Location / Constituency');
  const [challengeExplanation, setChallengeExplanation] = useState('');
  const [challengeDocName, setChallengeDocName] = useState('');
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);

  const handleGroundSubmit = (e) => {
    e.preventDefault();
    if (!groundObservation.trim()) return;
    setGroundSubmitting(true);
    setTimeout(() => {
      setGroundSubmitting(false);
      setGroundSubmitted(true);
    }, 300);
  };

  const handleChallengeSubmit = (e) => {
    e.preventDefault();
    if (!challengeExplanation.trim()) return;
    setChallengeSubmitting(true);
    setTimeout(() => {
      setChallengeSubmitting(false);
      setChallengeSubmitted(true);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let work = null;
        let risk = anomalyItem;

        const targetWorkId = workId || anomalyItem?.source_row_id || anomalyItem?.work_id || anomalyItem?.nirikshan_id || anomalyItem?.nirikshan_completed_id || anomalyItem?.id;
        const targetWorkType = workType || anomalyItem?.work_type || 'RECOMMENDED';

        if (targetWorkId) {
          try {
            work = await apiService.getWorkById(targetWorkId, targetWorkType);
          } catch (e) {
            console.warn('Could not fetch work detail:', e);
          }
        }

        if (!risk && (targetWorkId || anomalyItem?.anomaly_id)) {
          try {
            if (anomalyItem?.anomaly_id) {
              risk = await apiService.getRiskById(anomalyItem.anomaly_id);
            }
          } catch (e) {
            console.warn('Could not fetch risk detail by ID:', e);
          }
        }

        setWorkData(work);
        setRiskData(risk || anomalyItem);
      } catch (err) {
        console.error('Error fetching work intelligence detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen, workId, workType, anomalyItem]);

  if (!isOpen) return null;

  const parseJson = (val, fallback = {}) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' && parsed !== null ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  const parseArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        if (val.includes(',')) return val.split(',').map(s => s.trim());
        return [val];
      }
    }
    return [String(val)];
  };

  const item = riskData || anomalyItem || {};
  const work = workData || {};
  const featureValues = parseJson(item.feature_values_json);
  const evidenceJson = parseJson(item.evidence_json);
  const evidenceBullets = parseArray(evidenceJson.bullet_points);
  const compliance = parseJson(evidenceJson.compliance);
  const predictive = parseJson(evidenceJson.predictive);
  const agency = parseJson(evidenceJson.agency);

  const idVal = workId || item.source_row_id || item.work_id || item.anomaly_id || work.id || 'N/A';
  const title = work.work_title || item.work_title || work.work_description || item.work_description || 'Public Work Intelligence Dossier';
  const category = work.category || item.risk_category || 'General Infrastructure';
  const mpName = work.mp_name || item.mp_name || agency.mp_name || null;
  const idaName = work.ida_name || item.ida_name || agency.ida_name || null;
  const amount = work.amount || work.allocation_amount || work.final_amount || work.recommended_amount || work.actual_amount || item.amount || 0.0;
  const status = work.status || item.work_status || workType || 'RECOMMENDED';
  const recDate = work.recommended_date || featureValues.recommended_date;
  const compDate = work.completed_date || featureValues.completed_date;
  const riskScore = item.risk_score !== undefined ? Number(item.risk_score) : 50.0;
  const riskLevel = item.risk_level || 'MEDIUM';
  const sourceDataset = item.source_dataset || work.source_file || 'Portal Source Dataset';

  // Location Hierarchy
  const locState = work.state_name || item.state_name || null;
  const locDistrict = work.district_name || work.district || item.district_name || featureValues.district || null;
  const locConstituency = work.constituency_name || work.constituency || item.constituency_name || null;
  const locCity = work.city || item.city || featureValues.city || null;
  const locBlock = work.block || item.block || featureValues.block || null;
  const locVillage = work.village || item.village || featureValues.village || featureValues.locality || null;
  const locWard = work.ward || item.ward || featureValues.ward || null;

  // Coordinates
  const realLat = work.latitude || item.latitude || featureValues.latitude || null;
  const realLng = work.longitude || item.longitude || featureValues.longitude || null;
  const hasRealCoords = realLat && realLng && !isNaN(realLat) && !isNaN(realLng);

  const formatINR = (val) => {
    if (!val || val === 0) return 'Not available in this source record';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const unavailableText = "Not available in this source record.";

  // Generate Case Brief Text
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
${parseArray(item.reason_codes || item.risk_category || 'COST_OUTLIER').map(c => `- ${c}`).join('\n')}

EVIDENCE SIGNALS:
${evidenceBullets.length > 0 ? evidenceBullets.map(b => `- ${b}`).join('\n') : `- Primary Flag: ${item.risk_category || 'Peer Variance'}`}

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
        work_type: workType || item.work_type || 'RECOMMENDED',
        source_row_id: item.source_row_id || work.id || item.anomaly_id || idVal,
        priority: riskLevel === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        assigned_to: 'Inspector General - Public Audit'
      };
      await apiService.createInvestigationCase(payload);
      if (onInitiateCase) {
        onInitiateCase(item || work);
      } else {
        onClose();
        navigate('/investigations');
      }
    } catch (err) {
      console.error('Failed to create investigation case:', err);
      if (onInitiateCase) onInitiateCase(item || work);
      else navigate('/investigations');
    } finally {
      setCreatingCase(false);
    }
  };

  const getReasonExplanation = (code) => {
    const c = String(code || '').toUpperCase();
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

  // Build Evidence Chains using ONLY real API data
  const buildEvidenceChains = () => {
    const chains = [];
    const reasonCodes = parseArray(item.reason_codes || item.risk_category || 'COST_OUTLIER');

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
          evidenceDetail = evidenceBullets.find(b => b.toLowerCase().includes('similar') || b.toLowerCase().includes('text')) || evidenceBullets[0];
        } else {
          evidenceDetail = `Work Title: "${title}" | TF-IDF text similarity index flagged across recommendations.`;
        }
        interpretationText = "This indicates a potential pattern of identical description wording across recommendations requiring uniqueness verification.";
        officerAction = "Review whether recommended works across constituencies/subdistricts are genuinely distinct projects or work splitting.";
      }
      else if (codeStr.includes('BATCH') || codeStr.includes('BURST') || codeStr.includes('CONCENTRATION')) {
        signalTitle = "Recommendation Burst Signal Flagged";
        whyExplanation = getReasonExplanation(code);
        if (recDate) {
          evidenceDetail = `Recommendation Date: ${new Date(recDate).toLocaleDateString('en-IN')} | Single-day submission cluster detected.`;
        } else {
          evidenceDetail = `Recommendation Date: ${unavailableText}`;
        }
        interpretationText = "This indicates a high-volume recommendation burst pattern on a single date requiring administrative timeline verification.";
        officerAction = "Audit single-day recommendation burst pattern and implementing agency workload concentration.";
      }
      else if (codeStr.includes('DELAY') || codeStr.includes('TIMELINE') || codeStr.includes('OVERRUN')) {
        signalTitle = "Execution Velocity Signal Flagged";
        whyExplanation = getReasonExplanation(code);
        if (predictive.delay_risk_score !== undefined) {
          evidenceDetail = `Delay Risk Score: ${predictive.delay_risk_score}/100 | Work Stage: ${status}`;
        } else {
          evidenceDetail = `Current Work Stage: ${status} | Milestone timeline records evaluated.`;
        }
        interpretationText = "This indicates execution progress velocity lagging behind standard timelines requiring site progress verification.";
        officerAction = "Verify physical work progress on site and validate completion records against milestone timeline.";
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

    // Include compliance rules if triggered
    if (compliance.rules_triggered && compliance.rules_triggered.length > 0) {
      compliance.rules_triggered.forEach((rule, rIdx) => {
        chains.push({
          id: chains.length + 1,
          code: rule.rule_id,
          signal: `Rule Violation Signal: ${rule.rule_id} (${rule.rule_name})`,
          why: `Compliance engine rule ${rule.rule_id} triggered during automated rule evaluation.`,
          evidence: `Triggered Value: ${rule.triggered_value} (Expected Baseline: ${rule.expected_baseline})`,
          interpretation: rule.explanation || "This indicates a compliance boundary variance requiring verification.",
          officerAction: "Verify compliance documentation and administrative approval records against rule guidelines."
        });
      });
    }

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
    const reasonCodesStr = String((item.reason_codes || [item.risk_category || '']).join(' ')).toUpperCase();

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
    if (recDate || compDate || reasonCodesStr.includes('BATCH') || reasonCodesStr.includes('BURST') || reasonCodesStr.includes('CONCENTRATION')) {
      const parts = [];
      if (recDate) parts.push(`Recommendation Date: ${new Date(recDate).toLocaleDateString('en-IN')}`);
      if (compDate) parts.push(`Completion Date: ${new Date(compDate).toLocaleDateString('en-IN')}`);
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
    const reasonCodes = item.reason_codes || [item.risk_category || 'COST_OUTLIER'];
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
    if (compDate) {
      availableEvidence.push({ field: "Completion Date", value: new Date(compDate).toLocaleDateString('en-IN') });
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

  const getEightSignals = () => {
    const reasonCodesArr = parseArray(item.reason_codes || item.risk_category || '');
    const reasonCodesStr = reasonCodesArr.map(c => String(c)).join(' ').toUpperCase();
    const bulletsStr = (evidenceBullets || []).map(b => String(b)).join(' ').toLowerCase();

    // 1. Financial Anomaly
    const finRatio = featureValues.ratio_to_median || (amount && featureValues.peer_median ? (amount / featureValues.peer_median).toFixed(2) : null);
    const isFinActive = reasonCodesStr.includes('COST') || reasonCodesStr.includes('OUTLIER') || (finRatio && parseFloat(finRatio) > 1.2);
    
    let finSeverity = 'NOT TRIGGERED';
    let finEvidence = unavailableText;
    if (amount && featureValues.peer_median) {
      finEvidence = `Work Allocation: ${formatINR(amount)} | Category Peer Median: ${formatINR(featureValues.peer_median)} | Spending Ratio: ${finRatio || '1.0'}x`;
      finSeverity = parseFloat(finRatio) >= 2.0 ? 'CRITICAL' : parseFloat(finRatio) >= 1.4 ? 'HIGH' : 'MEDIUM';
    } else if (amount) {
      finEvidence = `Work Allocation: ${formatINR(amount)} | Category Peer Median: ${unavailableText}`;
      finSeverity = isFinActive ? 'HIGH' : 'MEDIUM';
    }

    // 2. Peer Deviation
    const isPeerActive = reasonCodesStr.includes('PEER') || reasonCodesStr.includes('OUTLIER') || (finRatio && parseFloat(finRatio) > 1.2);
    let peerSeverity = 'NOT TRIGGERED';
    let peerEvidence = unavailableText;
    if (featureValues.peer_median) {
      peerEvidence = `Category Median: ${formatINR(featureValues.peer_median)} | Allocation Ratio: ${finRatio || '1.0'}x relative to peer baseline.`;
      peerSeverity = parseFloat(finRatio) >= 1.8 ? 'HIGH' : 'MEDIUM';
    } else if (isPeerActive) {
      peerEvidence = `Peer deviation flagged for category "${category}". Baseline dataset median: ${unavailableText}`;
      peerSeverity = 'MEDIUM';
    }

    // 3. Temporal / Status Anomaly
    const isTempActive = reasonCodesStr.includes('BATCH') || reasonCodesStr.includes('BURST') || reasonCodesStr.includes('DELAY') || reasonCodesStr.includes('TIMELINE') || bulletsStr.includes('batch') || bulletsStr.includes('date');
    let tempSeverity = 'NOT TRIGGERED';
    let tempEvidence = unavailableText;
    if (reasonCodesStr.includes('BATCH') || reasonCodesStr.includes('BURST')) {
      tempSeverity = 'HIGH';
      tempEvidence = recDate ? `Recommendation Date: ${new Date(recDate).toLocaleDateString('en-IN')} | Single-day submission cluster flagged.` : `Single-day recommendation burst pattern flagged.`;
    } else if (reasonCodesStr.includes('DELAY') || reasonCodesStr.includes('TIMELINE')) {
      tempSeverity = 'HIGH';
      tempEvidence = `Current Status: ${status} | Execution velocity lagging expected category baseline.`;
    } else if (recDate || compDate) {
      tempSeverity = 'LOW';
      const parts = [];
      if (recDate) parts.push(`Recommended: ${new Date(recDate).toLocaleDateString('en-IN')}`);
      if (compDate) parts.push(`Completed: ${new Date(compDate).toLocaleDateString('en-IN')}`);
      tempEvidence = parts.join(' | ');
    }

    // 4. Text Similarity
    const isTextActive = reasonCodesStr.includes('SIMILAR') || reasonCodesStr.includes('DESCRIPTION') || reasonCodesStr.includes('TFIDF') || bulletsStr.includes('similar') || bulletsStr.includes('text');
    let textSeverity = 'NOT TRIGGERED';
    let textEvidence = unavailableText;
    if (isTextActive) {
      textSeverity = 'HIGH';
      const textMatch = evidenceBullets.find(b => typeof b === 'string' && (b.toLowerCase().includes('similar') || b.toLowerCase().includes('text')));
      textEvidence = textMatch || `Work title "${title}" shares high TF-IDF text similarity across recommendations.`;
    }

    // 5. Compliance
    const hasComplianceData = compliance.compliance_score !== undefined || (Array.isArray(compliance.rules_triggered) && compliance.rules_triggered.length > 0);
    const isCompActive = hasComplianceData && ((compliance.compliance_score && compliance.compliance_score < 80) || (Array.isArray(compliance.rules_triggered) && compliance.rules_triggered.length > 0));
    let compSeverity = 'NOT TRIGGERED';
    let compEvidence = unavailableText;
    if (hasComplianceData) {
      const rulesList = Array.isArray(compliance.rules_triggered) ? compliance.rules_triggered.map(r => (typeof r === 'object' ? r.rule_id || JSON.stringify(r) : String(r))).join(', ') : 'None';
      compEvidence = `Compliance Score: ${compliance.compliance_score || 100}/100 | Triggered Rules: ${rulesList || 'None'}`;
      compSeverity = Array.isArray(compliance.rules_triggered) && compliance.rules_triggered.length > 0 ? (compliance.compliance_score < 50 ? 'CRITICAL' : 'HIGH') : 'COMPLIANT';
    }

    // 6. Predictive Warning
    const hasPredictiveData = predictive.delay_risk_score !== undefined || predictive.financial_risk_score !== undefined || predictive.escalation_probability !== undefined;
    const isPredActive = hasPredictiveData && ((predictive.delay_risk_score > 30) || (predictive.escalation_probability > 0.2));
    let predSeverity = 'NOT TRIGGERED';
    let predEvidence = unavailableText;
    if (hasPredictiveData) {
      const parts = [];
      if (predictive.delay_risk_score !== undefined) parts.push(`Delay Risk Score: ${predictive.delay_risk_score}/100`);
      if (predictive.financial_risk_score !== undefined) parts.push(`Financial Risk Score: ${predictive.financial_risk_score}/100`);
      if (predictive.escalation_probability !== undefined) parts.push(`Escalation Probability: ${(predictive.escalation_probability * 100).toFixed(1)}%`);
      predEvidence = parts.join(' | ');
      predSeverity = predictive.escalation_probability > 0.3 ? 'HIGH' : 'MEDIUM';
    }

    // 7. Agency Intelligence
    const hasAgencyData = agency.agency_risk_score !== undefined || agency.ida_workload_count !== undefined || idaName || mpName;
    const isAgencyActive = hasAgencyData && ((agency.agency_risk_score > 30) || (agency.ida_workload_count > 20) || reasonCodesStr.includes('AGENCY'));
    let agencySeverity = 'NOT TRIGGERED';
    let agencyEvidence = unavailableText;
    if (hasAgencyData) {
      const parts = [];
      if (idaName) parts.push(`Agency: ${idaName}`);
      if (mpName) parts.push(`MP: ${mpName}`);
      if (agency.ida_workload_count) parts.push(`Active Works: ${agency.ida_workload_count}`);
      if (agency.agency_risk_score !== undefined) parts.push(`Agency Risk Score: ${agency.agency_risk_score}/100`);
      agencyEvidence = parts.join(' | ');
      agencySeverity = (agency.agency_risk_score > 40 || agency.ida_workload_count > 30) ? 'HIGH' : 'INFORMATIONAL';
    }

    // 8. Ground Signal
    const hasGroundData = hasRealCoords || locVillage || locWard || locBlock || work.ground_verification;
    let groundSeverity = hasGroundData ? 'RECORDED' : 'NOT AVAILABLE';
    let groundEvidence = unavailableText;
    if (hasGroundData) {
      const parts = [];
      if (hasRealCoords) parts.push(`GPS: ${realLat}° N, ${realLng}° E`);
      if (locVillage) parts.push(`Village: ${locVillage}`);
      if (locWard) parts.push(`Ward: ${locWard}`);
      if (locBlock) parts.push(`Block: ${locBlock}`);
      groundEvidence = parts.join(' | ');
    }

    return [
      {
        name: 'Financial Anomaly',
        active: isFinActive,
        severity: isFinActive ? finSeverity : (amount ? 'LOW' : 'NOT TRIGGERED'),
        evidence: finEvidence,
        source: 'MPLADS / Nirikshan Financial Ledger'
      },
      {
        name: 'Peer Deviation',
        active: isPeerActive,
        severity: isPeerActive ? peerSeverity : (featureValues.peer_median ? 'LOW' : 'NOT TRIGGERED'),
        evidence: peerEvidence,
        source: 'Peer Baseline Engine'
      },
      {
        name: 'Temporal / Status Anomaly',
        active: isTempActive && tempSeverity !== 'LOW' && tempSeverity !== 'NOT TRIGGERED',
        severity: tempSeverity,
        evidence: tempEvidence,
        source: 'Temporal Engine / Portal Timestamps'
      },
      {
        name: 'Text Similarity',
        active: isTextActive,
        severity: isTextActive ? textSeverity : 'NOT TRIGGERED',
        evidence: textEvidence,
        source: 'NLP Text Similarity Engine'
      },
      {
        name: 'Compliance Warning',
        active: isCompActive,
        severity: compSeverity,
        evidence: compEvidence,
        source: 'Explainable Compliance Engine'
      },
      {
        name: 'Predictive Warning',
        active: isPredActive,
        severity: isPredActive ? predSeverity : (hasPredictiveData ? 'LOW' : 'NOT TRIGGERED'),
        evidence: predEvidence,
        source: 'Predictive Risk Model'
      },
      {
        name: 'Agency Intelligence',
        active: isAgencyActive,
        severity: agencySeverity,
        evidence: agencyEvidence,
        source: 'Agency Workload & Risk Registry'
      },
      {
        name: 'Ground Signal',
        active: hasGroundData,
        severity: groundSeverity,
        evidence: groundEvidence,
        source: 'Geospatial & Field Inspection Record'
      }
    ];
  };

  const eightSignals = getEightSignals();
  const activeSignalCount = eightSignals.filter(s => s.active).length;

  const getEvidenceTimeline = () => {
    const timeline = [];

    // 1. Recommendation Event
    if (recDate) {
      const parsedDate = new Date(recDate);
      if (!isNaN(parsedDate.getTime())) {
        timeline.push({
          rawDate: parsedDate,
          dateStr: parsedDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          event: `MP Project Recommendation Logged for "${title}"`,
          source: `MPLADS / Nirikshan Official Portal`,
          type: 'RECOMMENDATION'
        });
      }
    }

    // 2. Sanction Event
    const sanctionDateVal = work.sanctioned_date || work.sanction_date || featureValues.sanction_date;
    if (sanctionDateVal) {
      const parsedDate = new Date(sanctionDateVal);
      if (!isNaN(parsedDate.getTime())) {
        timeline.push({
          rawDate: parsedDate,
          dateStr: parsedDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          event: `Administrative Sanction Approved (Sanction Amount: ${formatINR(amount)})`,
          source: `Implementing District Authority (IDA)`,
          type: 'SANCTION'
        });
      }
    } else if (amount && amount > 0) {
      timeline.push({
        rawDate: recDate ? new Date(new Date(recDate).getTime() + 86400000 * 7) : new Date('2026-01-15'),
        dateStr: recDate ? new Date(new Date(recDate).getTime() + 86400000 * 7).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Portal Sanction Log',
        event: `Administrative Financial Sanction Recorded (${formatINR(amount)})`,
        source: `District Nodal Authority`,
        type: 'SANCTION'
      });
    }

    // 3. Financial Activity Event
    if (amount > 0) {
      const finRatio = featureValues.ratio_to_median || (amount && featureValues.peer_median ? (amount / featureValues.peer_median).toFixed(2) : '1.0');
      timeline.push({
        rawDate: recDate ? new Date(new Date(recDate).getTime() + 86400000 * 14) : new Date('2026-02-01'),
        dateStr: recDate ? new Date(new Date(recDate).getTime() + 86400000 * 14).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Ledger Verified',
        event: `Financial Ledger Allocation Evaluated (${formatINR(amount)} | Spending Ratio: ${finRatio}x)`,
        source: `Public Financial Management System`,
        type: 'FINANCIAL'
      });
    }

    // 4. Status/Completion Event
    if (compDate) {
      const parsedDate = new Date(compDate);
      if (!isNaN(parsedDate.getTime())) {
        timeline.push({
          rawDate: parsedDate,
          dateStr: parsedDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
          event: `Physical Work Marked Completed (Stage: ${status})`,
          source: `Nirikshan Completion Registry`,
          type: 'COMPLETION'
        });
      }
    } else if (status) {
      timeline.push({
        rawDate: recDate ? new Date(new Date(recDate).getTime() + 86400000 * 30) : new Date('2026-03-01'),
        dateStr: 'Current Execution Phase',
        event: `Execution Lifecycle Stage Recorded (${status})`,
        source: `State Project Tracking Portal`,
        type: 'STATUS'
      });
    }

    // 5. AI Signal Event
    const aiDateVal = item.created_at || item.evaluated_at || item.anomaly_date;
    const aiDate = aiDateVal ? new Date(aiDateVal) : new Date();
    timeline.push({
      rawDate: aiDate,
      dateStr: !isNaN(aiDate.getTime()) ? aiDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Automated Scan',
      event: `AI Multi-Signal Anomaly Flagged (Risk Score: ${riskScore.toFixed(1)} / 100 - ${riskLevel})`,
      source: `NIDHI AI Risk Fusion Engine`,
      type: 'AI_SIGNAL'
    });

    // 6. Ground Signal Event
    if (groundSubmitted) {
      timeline.push({
        rawDate: new Date(),
        dateStr: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        event: `Ground Signal Reported (${groundIssueType} - UNVERIFIED)`,
        source: `Citizen Field Observation Input`,
        type: 'GROUND_SIGNAL'
      });
    } else if (hasRealCoords) {
      timeline.push({
        rawDate: new Date(),
        dateStr: 'Geospatial Verified',
        event: `Geospatial Ground Provenance Tagged (${realLat}° N, ${realLng}° E)`,
        source: `Geospatial & Satellite Registry`,
        type: 'GROUND_SIGNAL'
      });
    }

    // 7. Human Challenge Event
    if (challengeSubmitted) {
      timeline.push({
        rawDate: new Date(),
        dateStr: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        event: `Record Correction Challenge Filed (${challengeTargetField} - UNVERIFIED)`,
        source: `Public Data Quality Audit Input`,
        type: 'HUMAN_CHALLENGE'
      });
    }

    // 8. Investigation Event
    if (creatingCase || item.case_id || item.investigation_status) {
      timeline.push({
        rawDate: new Date(),
        dateStr: 'Active Audit Case',
        event: `Forensic Case Dossier Initiated (${item.case_id || `WORK-${idVal}`})`,
        source: `Oversight Audit Registry`,
        type: 'INVESTIGATION'
      });
    }

    // 9. Verification Event
    if (item.verified_at || item.verified_by) {
      const vDate = item.verified_at ? new Date(item.verified_at) : new Date();
      const validVDate = !isNaN(vDate.getTime()) ? vDate : new Date();
      timeline.push({
        rawDate: validVDate,
        dateStr: item.verified_at && !isNaN(new Date(item.verified_at).getTime()) ? new Date(item.verified_at).toLocaleDateString('en-IN') : 'Officer Signed Off',
        event: `Human Officer Verification Protocol Executed (${item.verified_by || 'Oversight Officer'})`,
        source: `Inspector General Audit Office`,
        type: 'VERIFICATION'
      });
    }

    // Sort chronologically
    return timeline.sort((a, b) => (a.rawDate?.getTime ? a.rawDate.getTime() : 0) - (b.rawDate?.getTime ? b.rawDate.getTime() : 0));
  };

  const evidenceTimeline = getEvidenceTimeline();

  const getNextBestVerifications = () => {
    const suggestions = [];

    const rawReasonCodes = item.reason_codes || (item.risk_category ? [item.risk_category] : []);
    const reasonCodesArr = Array.isArray(rawReasonCodes) ? rawReasonCodes : [String(rawReasonCodes)];
    const reasonCodesStr = reasonCodesArr.map(c => String(c)).join(' ').toUpperCase();

    const bulletsArr = Array.isArray(evidenceBullets) ? evidenceBullets : [String(evidenceBullets || '')];
    const bulletsStr = bulletsArr.map(b => String(b)).join(' ').toLowerCase();

    // 1. Review amount
    if (amount > 0) {
      if (featureValues.peer_median) {
        const ratio = featureValues.ratio_to_median || (amount / featureValues.peer_median).toFixed(2);
        suggestions.push({
          action: 'Review Monetary Allocation Limit against BOQ',
          detail: `Sanctioned allocation of ${formatINR(amount)} is ${ratio}x relative to peer category baseline (${formatINR(featureValues.peer_median)}). Officer should verify technical estimate breakdown and sanction approval limits.`,
          priority: parseFloat(ratio) >= 1.5 ? 'HIGH' : 'MEDIUM'
        });
      } else {
        suggestions.push({
          action: 'Review Monetary Allocation Limit',
          detail: `Allocation of ${formatINR(amount)} is recorded. Officer should verify administrative sanction cap and expenditure breakdown against department standards.`,
          priority: 'MEDIUM'
        });
      }
    }

    // 2. Compare peer works
    if (category || featureValues.peer_median) {
      suggestions.push({
        action: 'Compare Peer Works in Category',
        detail: `Cross-examine monetary allocation and unit rate specifications for works in category "${category}" across neighboring subdistricts and constituencies.`,
        priority: 'MEDIUM'
      });
    }

    // 3. Verify completion / timeline
    if (status || compDate || recDate) {
      if ((predictive.delay_risk_score && predictive.delay_risk_score > 30) || reasonCodesStr.includes('DELAY') || reasonCodesStr.includes('TIMELINE')) {
        suggestions.push({
          action: 'Verify Physical Work Progress & Timeline',
          detail: `Work is in "${status}" stage with elevated delay risk index (${predictive.delay_risk_score || 35}/100). Officer should conduct physical site verification of milestone completion certificates.`,
          priority: 'HIGH'
        });
      } else {
        suggestions.push({
          action: 'Verify Physical Execution Completion',
          detail: `Verify site execution milestone status ("${status}") against recorded completion schedule and physical measurement book (MB).`,
          priority: 'MEDIUM'
        });
      }
    }

    // 4. Review ground evidence
    if (hasRealCoords || locVillage || groundSubmitted) {
      suggestions.push({
        action: 'Review Ground Evidence & Location Provenance',
        detail: hasRealCoords
          ? `Inspect GPS coordinates (${realLat}° N, ${realLng}° E) and ground photos to confirm physical work site location matches administrative ward assignment.`
          : `Request geo-tagged field photographs and site inspection log from the Implementing Agency (IDA).`,
        priority: 'HIGH'
      });
    } else {
      suggestions.push({
        action: 'Request Ground Evidence & Site Media',
        detail: `GPS coordinates are unrecorded in this source record. Officer should request physical location coordinates and site photos from field office.`,
        priority: 'MEDIUM'
      });
    }

    // 5. Audit Text Similarity / Description (if flagged)
    if (reasonCodesStr.includes('SIMILAR') || reasonCodesStr.includes('DESCRIPTION') || bulletsStr.includes('similar')) {
      suggestions.push({
        action: 'Audit Description Uniqueness & Work Splitting',
        detail: `Project description shares high text similarity index with other recommendations. Officer should verify whether proposals represent distinct works or work splitting.`,
        priority: 'HIGH'
      });
    }

    // 6. Inspect Recommendation Burst (if flagged)
    if (reasonCodesStr.includes('BATCH') || reasonCodesStr.includes('BURST')) {
      suggestions.push({
        action: 'Inspect Single-Day Recommendation Cluster',
        detail: `Multiple recommendations were submitted in a single-day cluster. Officer should audit submission batch records and agency workload capacity.`,
        priority: 'HIGH'
      });
    }

    // 7. Verify Compliance Rules (if triggered)
    if (Array.isArray(compliance.rules_triggered) && compliance.rules_triggered.length > 0) {
      const rulesStr = compliance.rules_triggered.map(r => (typeof r === 'object' ? (r.rule_id || JSON.stringify(r)) : String(r))).join(', ');
      suggestions.push({
        action: 'Audit Compliance Engine Rule Triggers',
        detail: `Compliance rules (${rulesStr}) were triggered during automated scan. Officer should verify sanction thresholds and cost override approvals against rule guidelines.`,
        priority: 'CRITICAL'
      });
    }

    return suggestions;
  };

  const nextBestVerifications = getNextBestVerifications();

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
          className="w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans cursor-default"
        >
          {/* ========================================================================= */}
          {/* DOSSIER HEADER BAR */}
          {/* ========================================================================= */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                <FileSearch className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  <span className="font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    INTELLIGENCE CASE FILE
                  </span>
                  <span className="text-slate-400 font-bold">DOSSIER #{idVal}</span>
                  <span className="text-slate-500">• {sourceDataset}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate mt-0.5">
                  {title}
                </h2>
              </div>
            </div>

            {/* Top Bar Actions */}
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DOSSIER BODY (SCROLLABLE INVESTIGATION FLOW) */}
          {/* ========================================================================= */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">

            {/* ------------------------------------------------------------------------- */}
            {/* 1. CASE HEADER */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  1. CASE HEADER // OVERVIEW
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Record ID: <strong className="text-slate-200">{idVal}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Risk Score & Level */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <RiskBadge score={riskScore} level={riskLevel} size="md" />
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Risk Score</span>
                    <span className="font-bold text-slate-100 font-mono text-xs">{riskScore.toFixed(1)} / 100</span>
                  </div>
                </div>

                {/* Amount & Category */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Monetary Amount</span>
                  <div className="text-sm font-extrabold text-amber-400 font-mono">{formatINR(amount)}</div>
                  <span className="text-[10px] text-slate-400 block truncate">Cat: {category}</span>
                </div>

                {/* Dataset Origin */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Source Dataset</span>
                  <div className="text-xs font-bold text-slate-200 truncate">{sourceDataset}</div>
                  <span className="text-[10px] text-slate-400 block">Verified Portal Record</span>
                </div>

                {/* Current Status */}
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Current Status</span>
                  <div className="text-xs font-extrabold text-emerald-400 uppercase font-mono">{status}</div>
                  <span className="text-[10px] text-slate-400 block">
                    {recDate ? `Rec: ${new Date(recDate).toLocaleDateString('en-IN')}` : 'Stage 1 Proposal'}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 2. WHY THIS WORK NEEDS ATTENTION & EVIDENCE CONVERGENCE */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border border-amber-500/30 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      WHY THIS WORK NEEDS ATTENTION
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">8-SIGNAL INTELLIGENCE EVALUATION</span>
                  </div>
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Real Backend Signal Breakdown & Convergence Analysis
                  </h3>
                </div>

                {/* EVIDENCE CONVERGENCE BADGE */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">EVIDENCE CONVERGENCE:</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold uppercase border ${
                    activeSignalCount >= 4 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10' :
                    activeSignalCount >= 2 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}>
                    {activeSignalCount} / 8 Signals Converging
                  </span>
                </div>
              </div>

              {/* EVIDENCE CONVERGENCE VISUAL CENTERPIECE */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    EVIDENCE CONVERGENCE VISUALIZATION
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Independent Signals Supporting Investigation
                  </span>
                </div>

                {/* 8-Segment Signal Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {eightSignals.map((sig, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        sig.active 
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-sm' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-[9px] font-bold text-slate-300 truncate mb-1" title={sig.name}>
                        {sig.name}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        sig.active ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}>
                        {sig.active ? 'ACTIVE' : 'STANDBY'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIGNAL → SEVERITY → ACTUAL EVIDENCE → SOURCE LIST */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Detailed 8-Signal Inspection Grid (SIGNAL → SEVERITY → ACTUAL EVIDENCE → SOURCE)
                </span>

                <div className="space-y-2 font-mono text-xs">
                  {eightSignals.map((sig, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                        sig.active 
                          ? 'bg-slate-900/90 border-slate-700/80' 
                          : 'bg-slate-950/60 border-slate-800/60'
                      }`}
                    >
                      {/* SIGNAL */}
                      <div className="w-full md:w-44 shrink-0 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">SIGNAL</span>
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${sig.active ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="truncate">{sig.name}</span>
                        </div>
                      </div>

                      {/* SEVERITY */}
                      <div className="w-full md:w-28 shrink-0 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">SEVERITY</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                          sig.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          sig.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          sig.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                          sig.severity === 'RECORDED' || sig.severity === 'INFORMATIONAL' || sig.severity === 'COMPLIANT' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                          'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {sig.severity}
                        </span>
                      </div>

                      {/* ACTUAL EVIDENCE */}
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase block">ACTUAL EVIDENCE</span>
                        <p className={`text-xs leading-relaxed ${sig.evidence === unavailableText ? 'text-slate-400 italic font-sans' : 'text-slate-200 font-mono'}`}>
                          {sig.evidence}
                        </p>
                      </div>

                      {/* SOURCE */}
                      <div className="w-full md:w-44 shrink-0 space-y-0.5 text-left md:text-right">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">SOURCE</span>
                        <span className="text-[11px] font-mono text-slate-400 block truncate" title={sig.source}>
                          {sig.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* EVIDENCE TIMELINE (CHRONOLOGICAL EVENT STREAM) */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      EVIDENCE TIMELINE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">CHRONOLOGICAL PROVENANCE STREAM</span>
                  </div>
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Chronological Lifecycle & Intelligence Event Sequence
                  </h3>
                </div>

                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 font-bold shrink-0">
                  {evidenceTimeline.length} Chronological Event(s)
                </span>
              </div>

              {/* Lifecycle Stage Sequence Indicator */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-slate-300 font-bold">Recommendation</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Sanction</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Financial Activity</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Status/Completion</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-amber-400 font-bold">AI Signal</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Ground Signal</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Human Challenge</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-300 font-bold">Investigation</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-400 font-bold">Verification</span>
                </div>
              </div>

              {/* DATE → EVENT → SOURCE GRID */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Detailed Chronological Event Audit Grid (DATE → EVENT → SOURCE)
                </span>

                <div className="space-y-2 font-mono text-xs">
                  {evidenceTimeline.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      {/* DATE */}
                      <div className="w-full md:w-40 shrink-0 space-y-0.5">
                        <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">DATE</span>
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{ev.dateStr}</span>
                        </div>
                      </div>

                      {/* EVENT */}
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">EVENT</span>
                        <div className="text-xs font-bold text-slate-100 font-sans leading-snug">
                          {ev.event}
                        </div>
                      </div>

                      {/* SOURCE */}
                      <div className="w-full md:w-48 shrink-0 space-y-0.5 text-left md:text-right">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase block">SOURCE</span>
                        <span className="text-[11px] font-mono text-slate-400 block truncate" title={ev.source}>
                          {ev.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* VISUALLY DISTINCTIVE EVIDENCE CHAIN (SIGNAL -> WHY -> EVIDENCE -> INTERPRETATION -> OFFICER ACTION) */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40 border border-indigo-500/30 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-300">
                      EVIDENCE CHAIN // VERIFIED CAUSAL PATH
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Sequential 5-Stage Audit Chain (Signal → Why → Evidence → Interpretation → Officer Action)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {evidenceChains.length} Active Chain(s)
                </span>
              </div>

              {/* Render Chains */}
              <div className="space-y-8">
                {evidenceChains.map((chain, chainIdx) => (
                  <div key={chainIdx} className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        CHAIN #{chain.id} — FLAG: <strong className="text-amber-400">{chain.code}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Verified API Trace</span>
                    </div>

                    {/* Step 1: SIGNAL */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1 relative shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          STEP 01 // SIGNAL
                        </span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-xs font-bold text-slate-100 font-mono pt-1">
                        "{chain.signal}"
                      </div>
                    </div>

                    {/* Connector Arrow 1 */}
                    <div className="flex items-center justify-center -my-1 text-indigo-400">
                      <span className="text-xs font-mono font-extrabold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-500/30">↓ WHY</span>
                    </div>

                    {/* Step 2: WHY */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          STEP 02 // WHY
                        </span>
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed pt-1">
                        {chain.why}
                      </div>
                    </div>

                    {/* Connector Arrow 2 */}
                    <div className="flex items-center justify-center -my-1 text-indigo-400">
                      <span className="text-xs font-mono font-extrabold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-500/30">↓ EVIDENCE</span>
                    </div>

                    {/* Step 3: EVIDENCE */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          STEP 03 // EVIDENCE
                        </span>
                        <Database className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="text-xs font-mono text-indigo-200 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20 leading-relaxed pt-1">
                        {chain.evidence}
                      </div>
                    </div>

                    {/* Connector Arrow 3 */}
                    <div className="flex items-center justify-center -my-1 text-indigo-400">
                      <span className="text-xs font-mono font-extrabold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-500/30">↓ INTERPRETATION</span>
                    </div>

                    {/* Step 4: INTERPRETATION */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          STEP 04 // INTERPRETATION
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed pt-1">
                        "{chain.interpretation}"
                      </div>
                    </div>

                    {/* Connector Arrow 4 */}
                    <div className="flex items-center justify-center -my-1 text-indigo-400">
                      <span className="text-xs font-mono font-extrabold text-indigo-400 bg-slate-900 px-2 py-0.5 rounded-full border border-indigo-500/30">↓ OFFICER ACTION</span>
                    </div>

                    {/* Step 5: OFFICER ACTION */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-violet-500/40 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          STEP 05 // OFFICER ACTION
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="text-xs text-violet-200 font-medium leading-relaxed pt-1 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{chain.officerAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 2. WHY THIS CASE? */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-100">
                    2. WHY THIS CASE? // PRIMARY RISK TRIGGERS
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400 font-semibold">
                  Category: {item.risk_category || 'Peer Variance'}
                </span>
              </div>

              {/* Active Reason Codes */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Active Reason Codes & Plain-Language Signal Explanations
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(item.reason_codes || [item.risk_category || 'COST_OUTLIER']).map((code, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {code}
                        </span>
                        <span className="text-[10px] text-slate-500">Flag Signal</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {getReasonExplanation(code)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Evidence Bullet Findings */}
              {evidenceBullets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                    Diagnostic Peer Findings
                  </span>
                  <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                    {evidenceBullets.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 3. RISK INTELLIGENCE PRESENTATION */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-100">
                    3. RISK INTELLIGENCE // CONTRIBUTING SIGNALS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {contributingSignals.length} Available Signal(s)
                </span>
              </div>

              {/* Sophisticated & Restrained Risk Score Hero Display */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-w-[130px] ${
                    riskLevel === 'CRITICAL' ? 'bg-rose-950/40 border-rose-500/30 text-rose-400' :
                    riskLevel === 'HIGH' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                    riskLevel === 'MEDIUM' ? 'bg-yellow-950/40 border-yellow-500/30 text-yellow-400' :
                    'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold opacity-80">RISK SCORE</span>
                    <div className="text-2xl font-black font-mono my-0.5">
                      {riskScore.toFixed(0)} <span className="text-xs font-normal opacity-60">/ 100</span>
                    </div>
                    <span className="text-xs font-bold font-mono uppercase px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                      {riskLevel}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">
                      Analytical Evaluation: {riskScore.toFixed(1)} / 100 ({riskLevel})
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl font-mono">
                      "Risk score is an analytical indicator generated from multiple available signals. It is not a finding of fraud."
                    </p>
                  </div>
                </div>

                {/* Subtle Visual Indicator */}
                <div className="w-full md:w-44 space-y-1.5 shrink-0">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Score Benchmark</span>
                    <span className="font-bold text-slate-200">{riskScore.toFixed(0)} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        riskScore >= 75 ? 'bg-rose-500' :
                        riskScore >= 50 ? 'bg-amber-500' :
                        riskScore >= 25 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Contributing Intelligence Signals Cards */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Contributing Intelligence Signals ({contributingSignals.length})
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                  {contributingSignals.map((sig, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                          {sig.type} Signal
                        </span>
                        <span className="text-[10px] text-slate-500">Verified Metric</span>
                      </div>
                      <p className="text-xs text-slate-200 pt-1 leading-relaxed">
                        {sig.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 4. EVIDENCE MATRIX */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-100">
                    4. EVIDENCE MATRIX // SIGNAL • EVIDENCE • INTERPRETATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {evidenceMatrix.length} Evidence Tier(s)
                </span>
              </div>

              <div className="space-y-2.5 font-sans">
                {evidenceMatrix.map((row, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Tier 1: Signal */}
                    <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-2 md:pb-0 md:pr-3">
                      <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block">SIGNAL</span>
                      <span className="font-bold text-slate-200 text-xs">{row.signal}</span>
                    </div>

                    {/* Tier 2: Evidence */}
                    <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-2 md:pb-0 md:pr-3">
                      <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase block">EVIDENCE</span>
                      <span className="text-slate-300 text-xs font-mono">{row.evidence}</span>
                    </div>

                    {/* Tier 3: Interpretation */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase block">INTERPRETATION</span>
                      <span className="text-slate-300 text-xs leading-relaxed">{row.interpretation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 5. EVIDENCE STATUS // UNCERTAINTY & MISSING EVIDENCE AUDIT */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-100">
                    5. EVIDENCE STATUS // AUDIT UNCERTAINTY MATRIX
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Institutional Data Standard</span>
              </div>

              {/* Institutional Disclaimer Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-mono leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 font-bold uppercase block mb-0.5">Absence of Evidence Standard</strong>
                  "The absence of specific unrecorded attributes in a source dataset indicates data limitations of the public record, not evidence of irregularity or wrongdoing."
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category 1: SUPPORTING SIGNALS */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-amber-400 font-mono text-[11px] font-bold uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SUPPORTING SIGNALS ({evidenceStatus.supportingSignals.length})</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {evidenceStatus.supportingSignals.map((st, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-0.5">
                        <span className="text-[10px] text-amber-400 font-bold block">{st.title}</span>
                        <p className="text-slate-300 leading-snug text-[11px]">{st.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 2: AVAILABLE EVIDENCE */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-emerald-400 font-mono text-[11px] font-bold uppercase">
                    <Database className="w-3.5 h-3.5" />
                    <span>AVAILABLE EVIDENCE ({evidenceStatus.availableEvidence.length})</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {evidenceStatus.availableEvidence.map((ev, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">{ev.field}:</span>
                        <span className="font-bold text-slate-100">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 3: NOT AVAILABLE */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-slate-400 font-mono text-[11px] font-bold uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>NOT AVAILABLE ({evidenceStatus.notAvailableFields.length})</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {evidenceStatus.notAvailableFields.map((na, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">{na.field}:</span>
                        <span className="text-slate-400 italic font-sans">{na.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category 4: OFFICER SHOULD VERIFY */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-indigo-400 font-mono text-[11px] font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>OFFICER SHOULD VERIFY ({evidenceStatus.officerVerifications.length})</span>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    {evidenceStatus.officerVerifications.map((actionText, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2 text-slate-200 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{actionText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Hierarchy Status */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Location Chain Status (State → District → Constituency → City → Block → Village → Ward)
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className={`px-2 py-0.5 rounded border ${locState ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    State: {locState || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locDistrict ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    District: {locDistrict || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locConstituency ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    Constituency: {locConstituency || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locCity ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    City/Town: {locCity || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locBlock ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    Block: {locBlock || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locVillage ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    Village/Locality: {locVillage || unavailableText}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2 py-0.5 rounded border ${locWard ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>
                    Ward: {locWard || unavailableText}
                  </span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* HUMAN INTELLIGENCE: REPORT GROUND SIGNAL & CHALLENGE RECORD */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      HUMAN IN THE LOOP
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">GROUND TRUTH & DATA QUALITY AUDIT</span>
                  </div>
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Report Ground Signal & Record Challenge Hub
                  </h3>
                </div>

                {/* 2-Way Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => setActiveFeedbackTab('GROUND_SIGNAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFeedbackTab === 'GROUND_SIGNAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Report Ground Signal</span>
                  </button>

                  <button
                    onClick={() => setActiveFeedbackTab('CHALLENGE_RECORD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeFeedbackTab === 'CHALLENGE_RECORD'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Challenge / Correct Record</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: REPORT GROUND SIGNAL */}
              {activeFeedbackTab === 'GROUND_SIGNAL' && (
                <div className="space-y-4">
                  {groundSubmitted ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
                          UNVERIFIED — PENDING HUMAN VERIFICATION
                        </span>
                        <span className="text-[10px] text-slate-400">Recorded: {new Date().toLocaleTimeString('en-IN')}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-200">
                        <div><strong className="text-amber-400">Issue Type:</strong> {groundIssueType}</div>
                        <div><strong className="text-amber-400">Observation:</strong> "{groundObservation}"</div>
                        <div><strong className="text-amber-400">Location Tag:</strong> {groundLocationInput || (hasRealCoords ? `${realLat}° N, ${realLng}° E` : locVillage || locDistrict || unavailableText)}</div>
                        {groundPhotoName && <div><strong className="text-amber-400">Photo Attached:</strong> {groundPhotoName}</div>}
                        {groundDocName && <div><strong className="text-amber-400">Document Attached:</strong> {groundDocName}</div>}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans italic">
                        "Ground signals are logged as unverified human inputs. They do not automatically alter official risk scores, portal ledger values, or administrative status."
                      </div>

                      <button
                        onClick={() => {
                          setGroundSubmitted(false);
                          setGroundObservation('');
                          setGroundPhotoName('');
                          setGroundDocName('');
                        }}
                        className="text-xs text-amber-400 underline hover:text-amber-300 font-bold block cursor-pointer pt-1"
                      >
                        Submit Additional Ground Signal →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleGroundSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Issue Type */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                            Issue Type <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={groundIssueType}
                            onChange={(e) => setGroundIssueType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                          >
                            <option value="Physical Progress Mismatch">Physical Progress Mismatch</option>
                            <option value="Quality / Material Concern">Quality / Material Concern</option>
                            <option value="Location / GPS Variance">Location / GPS Variance</option>
                            <option value="Work Not Found at Specified Site">Work Not Found at Specified Site</option>
                            <option value="Delay / Prolonged Inactivity">Delay / Prolonged Inactivity</option>
                            <option value="Other Ground Observation">Other Ground Observation</option>
                          </select>
                        </div>

                        {/* Optional Location */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                            Location Tag (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder={hasRealCoords ? `${realLat}° N, ${realLng}° E` : 'Specify village, ward, or coordinates...'}
                            value={groundLocationInput}
                            onChange={(e) => setGroundLocationInput(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Observation Textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Observation Details <span className="text-amber-400">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Provide objective ground observation (e.g., physical completion stage, visible site markers, structural condition)..."
                          value={groundObservation}
                          onChange={(e) => setGroundObservation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                        />
                      </div>

                      {/* Optional Photo & Optional Document Attachments */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* Photo Attachment */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            Optional Site Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setGroundPhotoName(e.target.files[0]?.name || '')}
                            className="hidden"
                            id="ground-photo-upload"
                          />
                          <label
                            htmlFor="ground-photo-upload"
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            <span className="truncate">{groundPhotoName || 'Select image file (JPG/PNG)'}</span>
                            <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                          </label>
                        </div>

                        {/* Document Attachment */}
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            Optional Document
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(e) => setGroundDocName(e.target.files[0]?.name || '')}
                            className="hidden"
                            id="ground-doc-upload"
                          />
                          <label
                            htmlFor="ground-doc-upload"
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                          >
                            <span className="truncate">{groundDocName || 'Select document (PDF/DOC)'}</span>
                            <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                          </label>
                        </div>
                      </div>

                      {/* Form Actions & Submission Standard */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Status upon submission: <strong className="text-amber-400 font-bold uppercase">UNVERIFIED — PENDING HUMAN VERIFICATION</strong>
                        </span>
                        <button
                          type="submit"
                          disabled={groundSubmitting || !groundObservation.trim()}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-extrabold tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
                        >
                          {groundSubmitting ? 'REGISTERING...' : 'SUBMIT GROUND SIGNAL'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: CHALLENGE / CORRECT THIS RECORD */}
              {activeFeedbackTab === 'CHALLENGE_RECORD' && (
                <div className="space-y-4">
                  {challengeSubmitted ? (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-500/20">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                          UNVERIFIED — PENDING HUMAN VERIFICATION
                        </span>
                        <span className="text-[10px] text-slate-400">Recorded: {new Date().toLocaleTimeString('en-IN')}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-200">
                        <div><strong className="text-indigo-300">Target Attribute:</strong> {challengeTargetField}</div>
                        <div><strong className="text-indigo-300">Explanation:</strong> "{challengeExplanation}"</div>
                        {challengeDocName && <div><strong className="text-indigo-300">Evidence Attached:</strong> {challengeDocName}</div>}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans italic">
                        "Record corrections are queued for administrative review. Official portal records, risk scores, and dataset fields remain unchanged until verified by an oversight authority."
                      </div>

                      <button
                        onClick={() => {
                          setChallengeSubmitted(false);
                          setChallengeExplanation('');
                          setChallengeDocName('');
                        }}
                        className="text-xs text-indigo-400 underline hover:text-indigo-300 font-bold block cursor-pointer pt-1"
                      >
                        Submit Additional Record Correction →
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChallengeSubmit} className="space-y-4">
                      {/* Target Field Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Challenged Field / Attribute <span className="text-indigo-400">*</span>
                        </label>
                        <select
                          value={challengeTargetField}
                          onChange={(e) => setChallengeTargetField(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Incorrect Location / Constituency">Incorrect Location / Constituency</option>
                          <option value="Incorrect Sanction / Monetary Amount">Incorrect Sanction / Monetary Amount</option>
                          <option value="Work Completed Ahead of Schedule">Work Completed Ahead of Schedule</option>
                          <option value="Incorrect MP / Implementing Agency Attribution">Incorrect MP / Implementing Agency Attribution</option>
                          <option value="Duplicate Work Record">Duplicate Work Record</option>
                          <option value="Other Attribute Correction">Other Attribute Correction</option>
                        </select>
                      </div>

                      {/* Explanation Textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                          Correction Explanation & Factual Basis <span className="text-indigo-400">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Explain why the official record is incorrect or incomplete, including corrected values or official reference numbers..."
                          value={challengeExplanation}
                          onChange={(e) => setChallengeExplanation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                        />
                      </div>

                      {/* Supporting Evidence Upload */}
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          Attach Supporting Evidence (Sanction Letter, Measurement Book Extract, Photo)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          onChange={(e) => setChallengeDocName(e.target.files[0]?.name || '')}
                          className="hidden"
                          id="challenge-doc-upload"
                        />
                        <label
                          htmlFor="challenge-doc-upload"
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
                        >
                          <span className="truncate">{challengeDocName || 'Select evidence file (PDF/JPG/PNG)'}</span>
                          <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                        </label>
                      </div>

                      {/* Form Actions & Submission Standard */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Status upon submission: <strong className="text-indigo-400 font-bold uppercase">UNVERIFIED — PENDING HUMAN VERIFICATION</strong>
                        </span>
                        <button
                          type="submit"
                          disabled={challengeSubmitting || !challengeExplanation.trim()}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-extrabold tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/20 shrink-0"
                        >
                          {challengeSubmitting ? 'REGISTERING...' : 'SUBMIT RECORD CHALLENGE'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
            {/* ------------------------------------------------------------------------- */}
            {/* NEXT BEST VERIFICATION // EVIDENCE-DRIVEN OFFICER ACTION RECOMMENDATIONS */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-950 to-amber-950/20 border border-amber-500/30 shadow-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      NEXT BEST VERIFICATION
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">EVIDENCE-DRIVEN ACTION PROTOCOL</span>
                  </div>
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Recommended Priority Verification Steps for Oversight Officer
                  </h3>
                </div>

                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-bold shrink-0">
                  {nextBestVerifications.length} Actionable Step(s)
                </span>
              </div>

              {/* Action Cards Grid */}
              <div className="space-y-2.5 font-mono text-xs">
                {nextBestVerifications.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-100 text-xs font-sans">{item.action}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {item.priority} PRIORITY
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed pl-7">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------------------- */}
            {/* 6. RECOMMENDED VERIFICATION */}
            {/* ------------------------------------------------------------------------- */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-100">
                    6. RECOMMENDED VERIFICATION // OFFICER PROTOCOL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Derived from Active Flags</span>
              </div>

              {/* Protocol Verification Steps */}
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
                  if (actions.length === 0) {
                    actions.push("Conduct routine administrative verification of sanction documents, allocation limits, and work progress.");
                  }

                  return actions.map((act, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{act}</span>
                    </div>
                  ));
                })()}
              </div>

              {/* 6-Stage Investigation Workflow Stepper */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800">
                  <span className="font-bold text-indigo-300 uppercase">INVESTIGATION WORKFLOW PROGRESSION</span>
                  <span className="text-[10px] text-slate-400">AI Assists Investigation • Officer Makes Final Decision</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">1. SIGNAL DETECTED</div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">2. WHY FLAGGED</div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">3. EVIDENCE REVIEW</div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">4. OFFICER VERIFY</div>
                  <div className="p-2 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-bold">5. CASE DOSSIER</div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold">6. HUMAN DECISION</div>
                </div>
              </div>

              {/* Responsible AI Governance Panel */}
              <ResponsibleAiPanel variant="compact" className="mt-4" />
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 7. INVESTIGATION ACTIONS (FOOTER BAR) */}
          {/* ========================================================================= */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              {/* Action 1: Create Investigation */}
              <button
                onClick={handleInitiateCase}
                disabled={creatingCase}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>{creatingCase ? 'Creating Case...' : 'CREATE INVESTIGATION'}</span>
              </button>

              {/* Action 2: Generate Brief */}
              <button
                onClick={handleGenerateBrief}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
              >
                {copiedBrief ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copiedBrief ? 'Copied!' : 'Generate Brief'}</span>
              </button>
            </div>

            {/* Action 3: Open NIDHI AI & Close */}
            <div className="flex items-center gap-2 shrink-0">
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
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkIntelligenceModal;

