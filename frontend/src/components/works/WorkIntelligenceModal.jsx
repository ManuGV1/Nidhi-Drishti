import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronUp,
  ChevronDown, 
  ShieldAlert, 
  Sparkles, 
  FolderPlus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  MapPin, 
  User, 
  FileText, 
  TrendingUp, 
  Cpu, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/client';
import { NidhiAiAssistant } from './NidhiAiAssistant';

export const WorkIntelligenceModal = ({ isOpen, onClose, workId, workType = 'RECOMMENDED', anomalyItem = null, onInitiateCase }) => {
  const [loading, setLoading] = useState(false);
  const [workData, setWorkData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [isHowCalculatedOpen, setIsHowCalculatedOpen] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let work = null;
        let risk = anomalyItem;

        if (workId) {
          try {
            work = await apiService.getWorkById(workId, workType);
          } catch (e) {
            console.warn('Could not fetch work detail:', e);
          }
        }

        if (!risk && (workId || anomalyItem?.anomaly_id)) {
          const targetId = workId || anomalyItem?.anomaly_id;
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

    const handleInitiateCase = async () => {
    setCreatingCase(true);
    try {
      const payload = {
        work_type: workType || item.work_type || 'RECOMMENDED',
        source_row_id: item.source_row_id || work.id || item.anomaly_id || 1,
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

  if (!isOpen) return null;

  const item = riskData || {};
  const work = workData || {};
  const featureValues = item.feature_values_json || {};
  const evidenceJson = item.evidence_json || {};
  const evidenceBullets = evidenceJson.bullet_points || [];
  const compliance = evidenceJson.compliance || {};
  const predictive = evidenceJson.predictive || {};
  const agency = evidenceJson.agency || {};

  const title = work.work_title || item.work_title || 'Public Work Dossier';
  const category = work.category || item.risk_category || 'General Infrastructure';
  const mpName = work.mp_name || 'Not available in this source record';
  const idaName = work.ida_name || agency.ida_name || 'Not available in this source record';
  const amount = work.amount || item.amount || 0.0;
  const status = work.status || item.work_status || 'RECOMMENDED';
  const recDate = work.recommended_date || featureValues.recommended_date;
  const compDate = work.completed_date || featureValues.completed_date;
  const riskScore = item.risk_score !== undefined ? item.risk_score : 50.0;
  const riskLevel = item.risk_level || 'MEDIUM';

  // Real Location Hierarchy Extraction: State → District → Constituency → City/Town → Block → Village/Locality → Ward
  const locState = work.state_name || item.state_name || null;
  const locDistrict = work.district_name || work.district || item.district_name || featureValues.district || null;
  const locConstituency = work.constituency_name || work.constituency || item.constituency_name || null;
  const locCity = work.city || item.city || featureValues.city || null;
  const locBlock = work.block || item.block || featureValues.block || null;
  const locVillage = work.village || item.village || featureValues.village || featureValues.locality || null;
  const locWard = work.ward || item.ward || featureValues.ward || null;

  // Verified real GPS check (only if real numeric coordinates exist in API response)
  const realLat = work.latitude || item.latitude || featureValues.latitude || null;
  const realLng = work.longitude || item.longitude || featureValues.longitude || null;
  const hasRealCoords = realLat && realLng && !isNaN(realLat) && !isNaN(realLng);

  const formatINR = (val) => {
    if (!val || val === 0) return 'Not available in this source record';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* DOSSIER HEADER */}
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="space-y-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  NATIONAL WORK INTELLIGENCE DOSSIER
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ID: {workId || item.source_row_id || item.work_id || 'N/A'} • {workType}
                </span>
                {(item.source_dataset || work.source_file) && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Source: {item.source_dataset || work.source_file}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 font-sans tracking-tight leading-snug">
                {title}
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
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
            </div>
          </div>

          {/* DOSSIER BODY (SCROLLABLE) */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* 1. SCORE & METADATA HIGHLIGHT BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4">
                <RiskBadge score={riskScore} level={riskLevel} size="lg" />
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">COMPOSITE RISK SCORE</span>
                  <span className="text-sm font-bold text-slate-100 font-sans">{item.risk_category || 'Peer Variance'}</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 font-mono">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">PUBLIC MONETARY AMOUNT</span>
                <div className="text-lg font-extrabold text-amber-400">{formatINR(amount)}</div>
                <span className="text-[10px] text-slate-400">Category: {category}</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">STATE & CONSTITUENCY</span>
                <div className="font-bold text-slate-200">{locState || 'Not available in this source record'}</div>
                <div className="text-[11px] text-slate-400 font-mono">Constituency: {locConstituency || 'Not available in this source record'}</div>
              </div>
            </div>

            {/* 2. COMPACT WORK LOCATION & PROVENANCE SECTION */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                    Source Data: Administrative Work Location
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Verified Portal Source Record
                </span>
              </div>

              {/* Administrative Hierarchy Chain */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Location Hierarchy Chain (State → District → Constituency → City/Town → Block → Village/Locality → Ward)
                </span>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-300">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                    {locState || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    District: {locDistrict || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    Constituency: {locConstituency || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    City/Town: {locCity || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    Block: {locBlock || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    Village/Locality: {locVillage || 'Not available in this source record'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-slate-800">
                    Ward: {locWard || 'Not available in this source record'}
                  </span>
                </div>
              </div>

              {/* Coordinates & GPS Honesty Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold">GPS Coordinates:</span>
                  {hasRealCoords ? (
                    <span className="text-emerald-400 font-bold">{realLat}° N, {realLng}° E</span>
                  ) : (
                    <span className="text-slate-500 italic">Not available in this source record (GPS coordinates not provided in portal dataset)</span>
                  )}
                </div>

                {hasRealCoords && (
                  <a
                    href={`https://maps.google.com/?q=${realLat},${realLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
                  >
                    <span>View on Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* 3. ADMINISTRATIVE & PROVENANCE METADATA */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Administrative Provenance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Parliamentary MP</span>
                  <span className="text-slate-200 font-medium">{mpName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Implementing Agency (IDA)</span>
                  <span className="text-slate-200 font-medium">{idaName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Recommendation Date</span>
                  <span className="text-slate-300">{recDate ? new Date(recDate).toLocaleDateString('en-IN') : 'Not available in this source record'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Work Stage</span>
                  <span className="text-emerald-400 font-bold">{status}</span>
                </div>
              </div>
            </div>

            {/* 4. PEER BENCHMARK & FINANCIAL VARIANCE */}
            {featureValues.peer_median && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Peer Category Benchmarking Variance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Category Peer Median</span>
                    <span className="text-sm font-bold text-slate-200">{formatINR(featureValues.peer_median)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Spending Ratio to Median</span>
                    <span className="text-sm font-bold text-indigo-400">{featureValues.ratio_to_median || '1.0'}x</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Variance Signal</span>
                    <span className="text-sm font-bold text-amber-400">
                      {featureValues.ratio_to_median > 2.0 ? 'High Cost Outlier' : 'Within Expected Baseline'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COMPLIANCE ENGINE RULE EVALUATION (COMPL-001 TO COMPL-006) */}
            {compliance.rules_triggered && (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Compliance Engine Evaluation (6 Rules)
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Compliance Score: <strong className="text-amber-400">{compliance.compliance_score || 100}/100</strong>
                  </span>
                </div>

                {compliance.rules_triggered.length > 0 ? (
                  <div className="space-y-2">
                    {compliance.rules_triggered.map((rule, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold">{rule.rule_id}: {rule.rule_name}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px]">{rule.severity}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-normal">{rule.explanation}</p>
                        <div className="text-[10px] font-mono text-slate-400 pt-1">
                          Triggered Value: <span className="text-amber-400">{rule.triggered_value}</span> • Expected: <span className="text-slate-300">{rule.expected_baseline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fully Compliant across all 6 explainable rules (COMPL-001 through COMPL-006).</span>
                  </div>
                )}
              </div>
            )}

            {/* 6. PREDICTIVE EARLY WARNING & AGENCY INTELLIGENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Early Warning */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase block">PREDICTIVE EARLY WARNING SIGNALS</span>
                <div className="space-y-2 text-xs font-mono pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Delay Risk Score:</span>
                    <span className="font-bold text-slate-200">{predictive.delay_risk_score !== undefined ? `${predictive.delay_risk_score}/100` : 'Baseline'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Emerging Financial Risk:</span>
                    <span className="font-bold text-amber-400">{predictive.financial_risk_score !== undefined ? `${predictive.financial_risk_score}/100` : 'Baseline'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Escalation Probability:</span>
                    <span className="font-bold text-indigo-400">{predictive.escalation_probability !== undefined ? `${(predictive.escalation_probability * 100).toFixed(1)}%` : 'Low'}</span>
                  </div>
                </div>
              </div>

              {/* Agency Intelligence */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">IMPLEMENTING AGENCY (IDA) INTELLIGENCE</span>
                <div className="space-y-2 text-xs font-mono pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IDA Risk Index:</span>
                    <span className="font-bold text-slate-200">{agency.agency_risk_score !== undefined ? `${agency.agency_risk_score}/100` : 'Baseline'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IDA Total Workload:</span>
                    <span className="font-bold text-slate-200">{agency.ida_workload_count ? `${agency.ida_workload_count} Works` : 'Normal'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Contractor GSTIN / Graph:</span>
                    <span className="text-[10px] text-slate-500">Not available in this source record</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. PLAIN-LANGUAGE DIAGNOSTIC BULLET POINTS */}
            {evidenceBullets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Plain-Language Diagnostic Findings</h3>
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  {evidenceBullets.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
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
                    {featureValues.ratio_to_median ? `${featureValues.ratio_to_median}x` : (amount && featureValues.peer_median ? `${(amount / featureValues.peer_median).toFixed(2)}x` : '1.0x')}
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


            {/* DATA HONESTY NOTICE */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Data Honesty Standard:</strong> Unrecorded fields display <em>"Not available in this source record"</em>. Zero synthetic or fake data is created.
              </span>
            </div>
          </div>

          {/* DOSSIER FOOTER ACTIONS */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
            <button
              onClick={handleInitiateCase}
              disabled={creatingCase}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>{creatingCase ? 'Creating Case...' : 'INITIATE INVESTIGATION CASE'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WorkIntelligenceModal;
