import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../common/RiskBadge';
import { AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export const PriorityAlerts = ({ risks }) => {
  const navigate = useNavigate();

  if (!risks || risks.length === 0) {
    return (
      <div className="panel-card p-5 mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">Priority Investigation Alerts</h3>
        <p className="text-xs text-slate-400">No active high-risk alerts registered.</p>
      </div>
    );
  }

  return (
    <div className="panel-card p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#24304f]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Priority Investigation Alerts</h3>
        </div>
        <button
          onClick={() => navigate('/risk-intelligence')}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View All Signals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {risks.map((item) => (
          <div
            key={item.anomaly_id}
            className="p-3.5 rounded bg-[#1c2541]/60 border border-[#24304f] hover:border-slate-500 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <RiskBadge score={item.risk_score} level={item.risk_level} size="sm" />
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {item.work_type} • ID: {item.source_row_id || item.work_id}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">{item.work_title || 'Work Title Unspecified'}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>{item.state_name} ({item.constituency_name})</span>
                <span>•</span>
                <span className="font-mono">₹{item.amount ? item.amount.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/risk-intelligence?id=${item.anomaly_id}`)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#141d36] hover:bg-[#24304f] text-xs font-medium text-blue-300 border border-[#24304f] shrink-0 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityAlerts;
