import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { RiskBadge } from '../components/common/RiskBadge';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  Filter, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

export const EarlyWarningPage = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);

  const fetchRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getRisks({ limit: 40 });
      setRisks(data.data || []);
    } catch (err) {
      console.error('Failed to load early warning data:', err);
      setError(err.detail || 'Could not fetch early warning signals from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              PREDICT & ALERT
            </span>
            <span className="text-xs font-mono text-slate-500">PREDICTIVE EARLY WARNING ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Predictive Early Warning Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Early signals detecting execution delay risk, emerging cost overruns, and escalation probability before completion.
          </p>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase block">EVALUATED EARLY WARNING SIGNALS</span>
          <div className="text-3xl font-extrabold text-slate-100">{risks.length} Signals</div>
          <span className="text-[11px] text-slate-500 font-sans">Active database risk anomaly records</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-amber-400 uppercase block">DELAY RISK DETECTED</span>
          <div className="text-3xl font-extrabold text-amber-400">
            {risks.filter(r => r.evidence_json?.predictive?.delay_risk_score > 30).length} Works
          </div>
          <span className="text-[11px] text-slate-500 font-sans">Timeline gap exceeding peer baseline</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <span className="text-xs font-mono text-indigo-400 uppercase block">EMERGING FINANCIAL OVERRUN</span>
          <div className="text-3xl font-extrabold text-indigo-400">
            {risks.filter(r => r.evidence_json?.predictive?.financial_risk_score > 30).length} Works
          </div>
          <span className="text-[11px] text-slate-500 font-sans">Cost ratio &gt; 1.5x peer median</span>
        </div>
      </div>

      {loading && <LoadingSpinner message="Evaluating predictive early warning signals from PostgreSQL..." />}
      {error && <ErrorAlert message={error} onRetry={fetchRisks} />}

      {/* EARLY WARNING CARDS GRID */}
      {!loading && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Predictive Early Warning Signals Stream
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((item) => {
              const pred = item.evidence_json?.predictive || {};
              const delayScore = pred.delay_risk_score || 25;
              const finScore = pred.financial_risk_score || 30;
              const prob = pred.escalation_probability ? (pred.escalation_probability * 100).toFixed(1) : '15.0';

              return (
                <div
                  key={item.anomaly_id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <RiskBadge score={item.risk_score} level={item.risk_level} size="sm" />
                      <span className="text-[10px] font-mono text-slate-400">ID: {item.source_row_id || item.work_id} ({item.work_type})</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 leading-snug">{item.work_title}</h4>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {item.state_name} ({item.constituency_name}) • ₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}
                    </div>

                    {/* Predictive Gauges */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Delay Risk</span>
                        <span className="font-bold text-amber-400">{delayScore}/100</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Financial Risk</span>
                        <span className="font-bold text-indigo-400">{finScore}/100</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Escalation Prob</span>
                        <span className="font-bold text-rose-400">{prob}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      Category: {item.risk_category}
                    </span>
                    <button
                      onClick={() => setSelectedWorkItem(item)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Examine Signal</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WORK INTELLIGENCE DOSSIER MODAL */}
      <WorkIntelligenceModal
        isOpen={!!selectedWorkItem}
        onClose={() => setSelectedWorkItem(null)}
        anomalyItem={selectedWorkItem}
      />
    </div>
  );
};

export default EarlyWarningPage;
