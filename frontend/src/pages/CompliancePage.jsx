import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { RiskBadge } from '../components/common/RiskBadge';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Layers, 
  Sparkles, 
  Eye, 
  Filter,
  ArrowRight
} from 'lucide-react';

const COMPLIANCE_RULES = [
  {
    id: 'COMPL-001',
    name: 'Sanction Amount Exceeds Recommendation Threshold',
    severity: 'HIGH',
    description: 'Triggers when sanction amount significantly exceeds the original MP recommendation allocation.',
    category: 'Financial Compliance'
  },
  {
    id: 'COMPL-002',
    name: 'Actual Expenditure Exceeds Sanctioned Amount',
    severity: 'CRITICAL',
    description: 'Triggers when actual completion cost breaches the officially approved sanction amount.',
    category: 'Financial Compliance'
  },
  {
    id: 'COMPL-003',
    name: 'Timeline Gap Anomaly (Delay Signal)',
    severity: 'MEDIUM',
    description: 'Triggers when sanction or completion gap exceeds historical baseline threshold for category.',
    category: 'Temporal Compliance'
  },
  {
    id: 'COMPL-004',
    name: 'Status vs. Financial Execution Mismatch',
    severity: 'HIGH',
    description: 'Triggers when work is marked completed with missing actual amounts or 0 allocation.',
    category: 'Integrity Check'
  },
  {
    id: 'COMPL-005',
    name: 'Cross-Region Work Description Similarity Signal',
    severity: 'MEDIUM',
    description: 'Triggers when near-identical work descriptions are flagged across separate constituencies.',
    category: 'Text & Scope Anomaly'
  },
  {
    id: 'COMPL-006',
    name: 'High Locality Concentration Signal',
    severity: 'LOW',
    description: 'Triggers when public works demonstrate heavy spatial concentration within a single ward/subdistrict.',
    category: 'Spatial Clustering'
  }
];

export const CompliancePage = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRuleId, setSelectedRuleId] = useState('ALL');
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);

  const fetchRisks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getRisks({ limit: 40 });
      setRisks(data.data || []);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
      setError(err.detail || 'Could not load compliance evaluations from PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const filteredRisks = selectedRuleId === 'ALL'
    ? risks
    : risks.filter(r => {
        const triggered = r.evidence_json?.compliance?.rules_triggered || [];
        return triggered.some(t => t.rule_id === selectedRuleId);
      });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              DETECT & AUDIT
            </span>
            <span className="text-xs font-mono text-slate-500">EXPLAINABLE RULE ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Compliance Engine Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Automated verification of 6 explainable compliance rules across all 275,366 dataset works.
          </p>
        </div>
      </div>

      {/* 6 COMPLIANCE RULES MATRIX GRID */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-indigo-400" />
          The 6 Institutional Compliance Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPLIANCE_RULES.map((rule) => {
            const isSelected = selectedRuleId === rule.id;
            return (
              <div
                key={rule.id}
                onClick={() => setSelectedRuleId(isSelected ? 'ALL' : rule.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-amber-400">{rule.id}</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 leading-snug">{rule.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{rule.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{rule.category}</span>
                  <span className={isSelected ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                    {isSelected ? 'Filter Active ✓' : 'Filter by Rule →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-300">
            Active Filter: <strong className="text-amber-400 font-mono">{selectedRuleId}</strong>
          </span>
          {selectedRuleId !== 'ALL' && (
            <button
              onClick={() => setSelectedRuleId('ALL')}
              className="text-xs text-indigo-400 underline ml-2 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredRisks.length} Evaluated Works
        </span>
      </div>

      {loading && <LoadingSpinner message="Fetching compliance rule evaluations from PostgreSQL..." />}
      {error && <ErrorAlert message={error} onRetry={fetchRisks} />}

      {/* COMPLIANCE EVALUATIONS FEED */}
      {!loading && (
        <div className="space-y-4">
          {filteredRisks.map((item) => {
            const comp = item.evidence_json?.compliance || {};
            const rules = comp.rules_triggered || [];

            return (
              <div
                key={item.anomaly_id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RiskBadge score={item.risk_score} level={item.risk_level} size="sm" />
                      <span className="text-[11px] font-mono text-slate-400">ID: {item.source_row_id || item.work_id} ({item.work_type})</span>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Compliance Score: {comp.compliance_score || 100}/100
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">{item.work_title}</h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {item.state_name} ({item.constituency_name}) • ₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedWorkItem(item)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>EXAMINE DOSSIER</span>
                  </button>
                </div>

                {/* Triggered Rules Bullets */}
                {rules.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">Triggered Compliance Rules:</span>
                    {rules.map((r, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 font-mono">{r.rule_id}: {r.rule_name}</strong> — {r.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

export default CompliancePage;
