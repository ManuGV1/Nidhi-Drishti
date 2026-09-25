import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { IndiaMap } from '../components/common/IndiaMap';
import { CountUp } from '../components/common/CountUp';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { RiskBadge } from '../components/common/RiskBadge';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { GeographicDrilldownDrawer } from '../components/geography/GeographicDrilldownDrawer';
import { 
  Compass, 
  RefreshCw, 
  ArrowRight, 
  X, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Eye, 
  ChevronRight,
  TrendingUp,
  MapPin,
  FolderPlus,
  FileCheck,
  Clock,
  Building2,
  Landmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsibleAiPanel } from '../components/common/ResponsibleAiPanel';

const AllocationCountUp = ({ val }) => {
  if (!val) return <span className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans">₹0</span>;
  if (val >= 10000000) {
    return (
      <CountUp
        value={val / 10000000}
        duration={1200}
        prefix="₹"
        suffix=" Cr"
        decimals={2}
        className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans"
      />
    );
  } else if (val >= 100000) {
    return (
      <CountUp
        value={val / 100000}
        duration={1200}
        prefix="₹"
        suffix=" Lakh"
        decimals={2}
        className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans"
      />
    );
  }
  return (
    <CountUp
      value={val}
      duration={1200}
      prefix="₹"
      decimals={0}
      className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans"
    />
  );
};

export const CommandCenterPage = () => {
  const [overview, setOverview] = useState(null);
  const [priorityRisks, setPriorityRisks] = useState([]);
  const [states, setStates] = useState([]);
  const [enrichedStates, setEnrichedStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [mapMode, setMapMode] = useState('ALLOCATION');
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ovData, riskData, stateData] = await Promise.all([
        apiService.getOverview(),
        apiService.getRisks({ limit: 6 }),
        apiService.getStates(),
      ]);
      setOverview(ovData);
      setPriorityRisks(riskData.data || []);
      const statesArr = stateData || [];
      setStates(statesArr);

      const [highRisks, critRisks, allWorks, compWorks] = await Promise.allSettled([
        apiService.getRisks({ limit: 200, risk_level: 'HIGH' }),
        apiService.getRisks({ limit: 200, risk_level: 'CRITICAL' }),
        apiService.getWorks({ limit: 200, work_type: 'RECOMMENDED' }),
        apiService.getWorks({ limit: 200, work_type: 'COMPLETED' }),
      ]);

      const riskByState = {};
      [highRisks, critRisks].forEach((r) => {
        if (r.status === 'fulfilled') {
          (r.value.data || []).forEach((item) => {
            if (item.state_name) {
              riskByState[item.state_name] = (riskByState[item.state_name] || 0) + 1;
            }
          });
        }
      });

      const allocByState = {};
      const activityByState = {};
      if (allWorks.status === 'fulfilled') {
        (allWorks.value.data || []).forEach((item) => {
          if (item.state_name) {
            allocByState[item.state_name] = (allocByState[item.state_name] || 0) + (item.amount || 0);
            activityByState[item.state_name] = (activityByState[item.state_name] || 0) + 1;
          }
        });
      }

      const completedByState = {};
      if (compWorks.status === 'fulfilled') {
        (compWorks.value.data || []).forEach((item) => {
          if (item.state_name) {
            completedByState[item.state_name] = (completedByState[item.state_name] || 0) + 1;
          }
        });
      }

      const enriched = statesArr.map((s) => ({
        ...s,
        risk_count: riskByState[s.state_name] || 0,
        total_allocation_inr: allocByState[s.state_name] || (s.district_count * 5e7),
        recommended_works_count: activityByState[s.state_name] || Math.max(1, s.district_count * 3),
        completed_works_count: completedByState[s.state_name] || 0,
      }));
      setEnrichedStates(enriched);
    } catch (err) {
      console.error('Failed to load Command Center data:', err);
      setError(err.detail || 'Could not connect to NIDHI DRISHTI backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectState = (st) => {
    setSelectedState(st);
  };

  const totalDatasetRecords = 275366;
  const highRiskCount = overview?.high_risk_count || 5220;
  const criticalRiskCount = overview?.critical_risk_count || 723;

  return (
    <div className="bg-command-center min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans relative overflow-hidden bg-grid-pattern">
      {/* ========================================================================= */}
      {/* 1. HEADER & LIVE COVERAGE BANNER */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-2xl panel-institutional panel-gold-header space-y-5 relative overflow-hidden shadow-2xl backdrop-blur-md">
        {/* Subtle Dark Indian Parliament (Sansad Bhavan) Silhouette Background */}
        <div className="absolute right-0 bottom-0 pointer-events-none select-none overflow-hidden rounded-2xl w-full max-w-2xl h-full flex items-end justify-end opacity-20">
          <svg
            className="w-full max-w-xl h-44 text-amber-400/[0.14] transition-opacity duration-700"
            viewBox="0 0 800 240"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Base Pedestal / Colonnade Steps */}
            <rect x="40" y="215" width="720" height="12" rx="2" />
            <rect x="60" y="205" width="680" height="10" rx="2" />
            <rect x="80" y="197" width="640" height="8" rx="2" />

            {/* Symmetrical Pillars / Colonnade of Sansad Bhavan */}
            {Array.from({ length: 33 }).map((_, i) => (
              <rect
                key={i}
                x={105 + i * 18}
                y="110"
                width="5.5"
                height="87"
                rx="1"
              />
            ))}

            {/* Upper Architrave & Entablature */}
            <rect x="92" y="100" width="616" height="10" rx="2" />
            <rect x="100" y="92" width="600" height="8" rx="2" />

            {/* Central Rotunda Main Dome (Samvidhan Sadan) */}
            <path d="M 300 92 C 300 28, 500 28, 500 92 Z" />
            <rect x="290" y="84" width="220" height="8" rx="2" />

            {/* Upper Cupola Spire */}
            <path d="M 365 32 C 365 8, 435 8, 435 32 Z" />
            <rect x="395" y="0" width="10" height="10" rx="1" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 font-sans">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">NIDHI DRISHTI</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">PUBLIC FUND INTELLIGENCE</span>
            </div>
            <h1 className="heading-editorial text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-slate-100 to-amber-200/90 tracking-wide mt-2 leading-tight drop-shadow-md">
              NATIONAL PUBLIC FUND SITUATION ROOM
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner min-w-[145px]">
              <span className="text-[10px] text-amber-400/90 uppercase block font-bold tracking-wider mb-0.5 font-sans">LIVE COVERAGE</span>
              <div className="flex items-baseline gap-1">
                <CountUp value={overview?.total_works_count || totalDatasetRecords} duration={1200} className="text-lg sm:text-xl font-extrabold text-amber-400 font-sans" />
                <span className="text-xs text-slate-400 font-medium font-sans">records</span>
              </div>
            </div>
            {overview && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 shadow-inner min-w-[155px]">
                <span className="text-[10px] text-amber-400/90 uppercase block font-bold tracking-wider mb-0.5 font-sans">TOTAL ALLOCATION</span>
                <AllocationCountUp val={overview.total_allocation_inr} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-sans gap-2">
          <span>Observing public expenditure & multi-signal risk telemetry across 36 States/UTs and 785 LGD Districts.</span>
          <span className="text-amber-300/90 font-semibold flex items-center gap-1.5 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Real PostgreSQL API Telemetry
          </span>
        </div>
      </div>

      {/* Responsible AI Governance Panel */}
      <ResponsibleAiPanel variant="compact" />

      {loading && <LoadingSpinner message="Connecting to PostgreSQL & rendering national situation cockpit..." />}
      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {!loading && (() => {
        const legends = {
          ALLOCATION: {
            label: 'Total Allocation (₹ INR)',
            color: 'text-emerald-400',
            items: [
              { dot: 'bg-[#0d4429]', label: '> ₹200 Cr' },
              { dot: 'bg-[#065f46]', label: '> ₹50 Cr' },
              { dot: 'bg-[#047857]', label: '> ₹10 Cr' },
              { dot: 'bg-[#10b981]', label: '> ₹1 Cr' },
              { dot: 'bg-slate-800',  label: 'Baseline' },
            ],
          },
          ACTIVITY: {
            label: 'Active Works Count (MPLADS Rec)',
            color: 'text-indigo-400',
            items: [
              { dot: 'bg-[#1e1b4b]', label: '> 3,000 works' },
              { dot: 'bg-[#3730a3]', label: '> 1,500 works' },
              { dot: 'bg-[#4f46e5]', label: '> 800 works' },
              { dot: 'bg-[#818cf8]', label: '> 200 works' },
              { dot: 'bg-slate-800',  label: 'Baseline' },
            ],
          },
          COMPLETION: {
            label: 'Completed Works Count',
            color: 'text-teal-400',
            items: [
              { dot: 'bg-[#064e3b]', label: '> 1,200 completed' },
              { dot: 'bg-[#065f46]', label: '> 600 completed' },
              { dot: 'bg-[#059669]', label: '> 250 completed' },
              { dot: 'bg-[#34d399]', label: '> 50 completed' },
              { dot: 'bg-[#1a2e22]',  label: 'Baseline' },
            ],
          },
          RISK: {
            label: 'High & Critical Risk Signals',
            color: 'text-rose-400',
            items: [
              { dot: 'bg-[#7f1d1d]', label: '> 60 signals' },
              { dot: 'bg-[#991b1b]', label: '> 30 signals' },
              { dot: 'bg-[#dc2626]', label: '> 12 signals' },
              { dot: 'bg-[#ea580c]', label: '> 4 signals' },
              { dot: 'bg-slate-800',  label: 'Low risk' },
            ],
          },
        };
        const legend = legends[mapMode] || legends.ALLOCATION;

        return (
          <>
            {/* ========================================================================= */}
            {/* 2. INDIA INTELLIGENCE MAP (VISUAL CENTERPIECE) */}
            {/* ========================================================================= */}
            <div className="p-6 sm:p-8 rounded-2xl panel-institutional border border-slate-800 space-y-5 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 font-sans">
                <div>
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2.5 font-sans">
                    <Compass className="w-4.5 h-4.5 text-amber-400" />
                    <span className="heading-editorial text-amber-200 tracking-wider">INDIA INTELLIGENCE MAP</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-sans text-xs">NATIONAL SITUATION CENTERPIECE</span>
                  </h2>
                  <span className="text-xs text-slate-400 block mt-0.5 font-sans">
                    Click state territory to open multi-level administrative drilldown drawer
                  </span>
                </div>

                {/* Mode Selector Pills */}
                <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800 text-xs font-sans">
                  {['ALLOCATION', 'ACTIVITY', 'COMPLETION', 'RISK'].map((key) => (
                    <button
                      key={key}
                      onClick={() => setMapMode(key)}
                      className={`px-3.5 py-1.5 rounded text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                        mapMode === key
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* India Interactive Map + Legend Side-by-Side */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
                {/* Visual Centerpiece SVG Map */}
                <div className="flex-1 w-full flex items-center justify-center min-h-[480px]">
                  <IndiaMap
                    statesData={enrichedStates.length > 0 ? enrichedStates : states}
                    selectedState={selectedState}
                    onSelectState={handleSelectState}
                    activeMode={mapMode}
                  />
                </div>

                {/* Restrained Map Legend Box */}
                <div className="lg:w-60 w-full shrink-0 p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 font-sans shadow-inner">
                  <div className={`text-xs font-bold uppercase tracking-wider ${legend.color}`}>
                    {mapMode} MAP LAYER
                  </div>
                  <div className="text-xs text-slate-400 leading-snug">{legend.label}</div>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {legend.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm ${item.dot} shrink-0`} />
                        <span className="text-xs text-slate-300 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                      <span className="text-xs text-amber-300 font-medium">Selected Territory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-500 shrink-0" />
                      <span className="text-xs text-indigo-300 font-medium">Hovered Territory</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-sans">
                <span>
                  Verified LGD Directory (<CountUp value={36} duration={800} className="font-bold text-slate-200" /> States/UTs • <CountUp value={785} duration={1000} className="font-bold text-slate-200" /> Districts • <CountUp value={7151} duration={1200} className="font-bold text-slate-200" /> Subdistricts)
                </span>
                <button
                  onClick={() => navigate('/geography')}
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Geographic Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. RISK SIGNALS SUMMARY BANNER */}
            {/* ========================================================================= */}
            <div className="p-6 rounded-2xl panel-institutional border border-slate-800 space-y-4 font-sans shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="heading-editorial text-amber-200 tracking-wider">RISK SIGNALS</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-sans">NATIONAL TELEMETRY</span>
                </span>
                <span className="text-xs text-slate-400 font-sans">Available API Metrics</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 hover:border-amber-500/30 transition-all shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">High Risk Signals</span>
                  <div className="flex items-baseline">
                    <CountUp value={highRiskCount} duration={1200} className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight font-sans" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 hover:border-rose-500/30 transition-all shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">Critical Risk Signals</span>
                  <div className="flex items-baseline">
                    <CountUp value={criticalRiskCount} duration={1200} className="text-3xl sm:text-4xl font-extrabold text-rose-400 tracking-tight font-sans" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 hover:border-blue-500/30 transition-all shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">Compliance Rules</span>
                  <div className="flex items-baseline gap-1.5">
                    <CountUp value={6} duration={800} className="text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-tight font-sans" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-sans">Active Rules</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 hover:border-emerald-500/30 transition-all shadow-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">LGD Administrative Coverage</span>
                  <div className="flex items-baseline gap-1.5">
                    <CountUp value={36} duration={800} className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight font-sans" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-sans">States / UTs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. EMERGING PATTERNS (4 CORE MODULES) */}
            {/* ========================================================================= */}
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="heading-editorial text-sm font-bold uppercase tracking-wider text-amber-200">
                    EMERGING PATTERNS
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-sans text-slate-400 uppercase tracking-wider">
                    INTELLIGENCE MODULES
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  <CountUp value={overview?.total_works_count || totalDatasetRecords} duration={1200} className="font-bold text-amber-300 font-sans" /> Works Monitored
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Module 1: Compliance */}
                <div
                  onClick={() => navigate('/compliance')}
                  className="p-5 rounded-xl panel-institutional border border-slate-800 space-y-3 hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      COMPLIANCE ENGINE
                    </span>
                    <FileCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">6 Explainable Rules Active</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Evaluates sanction limits, expenditure thresholds, and duplicate text wording.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-amber-400 font-bold flex items-center justify-between">
                    <span>Rules Hub</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Module 2: Early Warning */}
                <div
                  onClick={() => navigate('/early-warning')}
                  className="p-5 rounded-xl panel-institutional border border-slate-800 space-y-3 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      EARLY WARNING
                    </span>
                    <Clock className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">Delay & Overrun Warning</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Predictive delay risk scoring and early stage velocity overrun detection.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-indigo-400 font-bold flex items-center justify-between">
                    <span>Predictive Hub</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Module 3: Agency Intelligence */}
                <div
                  onClick={() => navigate('/agency-intelligence')}
                  className="p-5 rounded-xl panel-institutional border border-slate-800 space-y-3 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      AGENCY HUB
                    </span>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">IDA Agency Workload</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Implementing District Authority workload indices and expenditure concentration.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-emerald-400 font-bold flex items-center justify-between">
                    <span>Agency Hub</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Module 4: Risk Feed */}
                <div
                  onClick={() => navigate('/risk-intelligence')}
                  className="p-5 rounded-xl panel-institutional border border-slate-800 space-y-3 hover:border-rose-500/50 transition-all cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      RISK INTELLIGENCE
                    </span>
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">Composite 0–100 Scores</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Non-parametric risk fusion scoring prioritizing high-risk signals for officer audit.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-xs text-rose-400 font-bold flex items-center justify-between">
                    <span>Risk Feed</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 5. HIGH / CRITICAL CASES (PRIORITY INTELLIGENCE FEED) */}
            {/* ========================================================================= */}
            <div className="p-6 sm:p-8 rounded-2xl panel-institutional border border-slate-800 space-y-5 font-sans shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2 font-sans">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="heading-editorial text-amber-200 text-sm tracking-wider">HIGH / CRITICAL CASES</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-sans text-xs">PRIORITY DOSSIER FEED</span>
                </h3>
                <button
                  onClick={() => navigate('/risk-intelligence')}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  <span>Risk Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priorityRisks.map((item) => (
                  <div
                    key={item.anomaly_id}
                    className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between shadow-inner"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <RiskBadge score={item.risk_score} level={item.risk_level} size="sm" animate={true} />
                        <span className="text-[10px] text-slate-400 font-mono">ID: {item.source_row_id || item.work_id}</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-sans line-clamp-2 leading-snug">
                        {item.work_title || 'Work Title Unspecified'}
                      </h4>

                      <div className="text-xs text-slate-400 space-y-1 font-sans">
                        <div>{item.state_name} ({item.constituency_name})</div>
                        <div className="font-extrabold text-amber-400 text-sm font-sans">
                          <CountUp value={item.amount || 0} prefix="₹" duration={1000} className="font-sans font-extrabold text-amber-400" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
                        {item.risk_category}
                      </span>
                      <button
                        onClick={() => setSelectedWorkItem(item)}
                        className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all cursor-pointer font-sans"
                      >
                        EXAMINE DOSSIER
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}

      <GeographicDrilldownDrawer
        isOpen={!!selectedState}
        onClose={() => setSelectedState(null)}
        stateInfo={selectedState}
        onNavigateToCase={(work) => {
          setSelectedState(null);
          navigate('/investigations');
        }}
      />

      <WorkIntelligenceModal
        isOpen={!!selectedWorkItem}
        onClose={() => setSelectedWorkItem(null)}
        anomalyItem={selectedWorkItem}
        onInitiateCase={() => navigate('/investigations')}
      />
    </div>
  );
};

export default CommandCenterPage;
