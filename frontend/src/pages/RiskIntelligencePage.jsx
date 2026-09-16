import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { RiskBadge } from '../components/common/RiskBadge';
import { ExplainSheet } from '../components/risks/ExplainSheet';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { SandboxModal } from '../components/risks/SandboxModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { 
  ShieldAlert, 
  Play, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  FolderPlus, 
  Eye, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RiskIntelligencePage = () => {
  const [risks, setRisks] = useState([]);
  const [activeLevel, setActiveLevel] = useState('ALL');
  const [workType, setWorkType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [selectedExplainItem, setSelectedExplainItem] = useState(null);
  const [selectedWorkDossier, setSelectedWorkDossier] = useState(null);
  const [initiatedCaseId, setInitiatedCaseId] = useState(null);
  const navigate = useNavigate();

  const fetchRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (activeLevel !== 'ALL') {
        params.risk_level = activeLevel;
      }
      if (workType !== 'ALL') {
        params.work_type = workType;
      }
      const data = await apiService.getRisks(params);
      setRisks(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotalRecords(data.total_records || 0);
    } catch (err) {
      console.error('Failed to load risks:', err);
      setError(err.detail || 'Could not fetch risk results from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [activeLevel, workType, page]);

  const handleCreateCase = async (item) => {
    try {
      const payload = {
        work_type: item.work_type,
        source_row_id: item.source_row_id,
        work_id: item.work_id,
        priority: item.risk_level === 'CRITICAL' ? 'URGENT' : item.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
        assigned_to: 'Oversight Officer',
      };
      const res = await apiService.createInvestigationCase(payload);
      setInitiatedCaseId(res.case_id);
      setTimeout(() => setInitiatedCaseId(null), 4000);
    } catch (err) {
      console.error('Failed to create case:', err);
      alert('Case creation error: ' + (err.detail || 'Could not initiate case.'));
    }
  };

  const criticalCount = risks.filter(r => r.risk_level === 'CRITICAL').length;
  const highCount = risks.filter(r => r.risk_level === 'HIGH').length;
  const mediumCount = risks.filter(r => r.risk_level === 'MEDIUM').length;
  const lowCount = risks.filter(r => r.risk_level === 'LOW').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* DETECT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              2. DETECT
            </span>
            <span className="text-xs font-mono text-slate-500">EXPLAINABLE RISK INTELLIGENCE HUB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Risk & Alerts Intelligence Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Explainable non-parametric risk fusion scoring (0–100) prioritizing high-risk signals across 275,366 works.
          </p>
        </div>

        <button
          onClick={() => setIsSandboxOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Open Live Sandbox Evaluator</span>
        </button>
      </div>

      {/* Case Initiated Toast */}
      {initiatedCaseId && (
        <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Investigation Dossier Created Successfully! Case ID: <strong className="font-mono text-emerald-200">{initiatedCaseId}</strong></span>
          </div>
          <button onClick={() => navigate('/investigations')} className="underline hover:text-white font-semibold">View Cases →</button>
        </div>
      )}

      {/* VISUAL SEVERITY LANDSCAPE BAR */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-slate-400 uppercase tracking-wider">Severity Distribution Landscape</span>
          <span className="text-slate-500">{totalRecords.toLocaleString('en-IN')} Total Evaluated Works</span>
        </div>

        {/* Multi-segment severity progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex">
          <div className="h-full bg-rose-500 transition-all" style={{ width: `${Math.max(5, (criticalCount / Math.max(1, risks.length)) * 100)}%` }} title="Critical Risk" />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.max(15, (highCount / Math.max(1, risks.length)) * 100)}%` }} title="High Risk" />
          <div className="h-full bg-yellow-500 transition-all" style={{ width: `${Math.max(25, (mediumCount / Math.max(1, risks.length)) * 100)}%` }} title="Medium Risk" />
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.max(20, (lowCount / Math.max(1, risks.length)) * 100)}%` }} title="Low Risk" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Critical ({criticalCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              High ({highCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Medium ({mediumCount})
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Low ({lowCount})
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Risk Fusion 7-Module Aggregation</span>
        </div>
      </div>

      {/* FILTER TOOLBAR (LEVEL & WORK TYPE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">Level:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setActiveLevel(lvl);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                activeLevel === lvl
                  ? lvl === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    lvl === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    lvl === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                    lvl === 'LOW' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Work Type Filter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Source Dataset:</span>
          <select
            value={workType}
            onChange={(e) => {
              setWorkType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Source Datasets (4)</option>
            <option value="RECOMMENDED">MPLADS Recommended (60.3k)</option>
            <option value="COMPLETED">MPLADS Completed (44.0k)</option>
            <option value="NIRIKSHAN_RECOMMENDED">Nirikshan Recommended (127.2k)</option>
            <option value="NIRIKSHAN_COMPLETED">Nirikshan Completed (43.6k)</option>
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner message="Fetching explainable risk results from PostgreSQL..." />}
      {error && <ErrorAlert message={error} onRetry={fetchRisks} />}

      {/* PRIORITY SIGNAL CARDS */}
      {!loading && risks.length > 0 && (
        <div className="space-y-4">
          {risks.map((item) => (
            <div
              key={item.anomaly_id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md flex flex-col md:flex-row md:items-start justify-between gap-6 group"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge score={item.risk_score} level={item.risk_level} size="lg" />
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                    {item.work_type} • ID: {item.source_row_id || item.work_id}
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-800 font-mono">
                    Category: <strong className="text-slate-200">{item.risk_category}</strong>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-amber-400 transition-colors">
                  {item.work_title || 'Work Title Unspecified'}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Location</span>
                    <span className="font-medium text-slate-200 truncate block">{item.state_name} ({item.constituency_name})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Allocation</span>
                    <span className="font-mono font-bold text-amber-400">
                      ₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Peer Median</span>
                    <span className="font-mono font-medium text-slate-300">
                      ₹{item.feature_values_json?.peer_median ? item.feature_values_json.peer_median.toLocaleString('en-IN') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Cost Ratio</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {item.feature_values_json?.ratio_to_median ? `${item.feature_values_json.ratio_to_median}x` : '1.0x'}
                    </span>
                  </div>
                </div>

                {/* Evidence narrative bullets */}
                {item.evidence_json?.bullet_points && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Diagnostic Intelligence Signals
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {item.evidence_json.bullet_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Sidebar */}
              <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => setSelectedWorkDossier(item)}
                  className="flex-1 md:w-44 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>EXAMINE DOSSIER</span>
                </button>
                <button
                  onClick={() => handleCreateCase(item)}
                  className="flex-1 md:w-44 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Initiate Case</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Explain Sheet Modal */}
      <ExplainSheet
        isOpen={!!selectedExplainItem}
        onClose={() => setSelectedExplainItem(null)}
        anomalyItem={selectedExplainItem}
        onInitiateCase={handleCreateCase}
      />

      {/* WORK INTELLIGENCE DOSSIER MODAL */}
      <WorkIntelligenceModal
        isOpen={!!selectedWorkDossier}
        onClose={() => setSelectedWorkDossier(null)}
        anomalyItem={selectedWorkDossier}
        onInitiateCase={handleCreateCase}
      />

      {/* Live Sandbox Modal */}
      <SandboxModal isOpen={isSandboxOpen} onClose={() => setIsSandboxOpen(false)} />
    </div>
  );
};

export default RiskIntelligencePage;
