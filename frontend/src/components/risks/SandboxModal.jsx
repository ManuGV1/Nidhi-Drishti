import React, { useState } from 'react';
import { apiService } from '../../api/client';
import { RiskBadge } from '../common/RiskBadge';
import { X, Play, Loader2, Info } from 'lucide-react';

export const SandboxModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    work_title: 'Installation of Solar Streetlights in Rural Wards',
    category: 'Public Facilities',
    state_name: 'Uttar Pradesh',
    constituency_name: 'Varanasi',
    allocation_amount: 1500000,
    work_status: 'RECOMMENDED',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'allocation_amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.evaluateSandbox(formData);
      setResult(data);
    } catch (err) {
      console.error('Sandbox evaluation failed:', err);
      setError(err.detail || 'Failed to evaluate hypothetical payload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c2541] border border-[#24304f] rounded-lg max-w-2xl w-full p-6 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#141d36]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
            STATELESS SANDBOX
          </span>
          <h2 className="text-lg font-bold text-white">Live Risk Evaluator</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Test hypothetical work payloads against PostgreSQL peer statistics. Inputs evaluated here are strictly stateless and will <span className="text-amber-400 font-semibold">NEVER</span> be saved to production database tables.
        </p>

        <form onSubmit={handleEvaluate} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Description / Title</label>
              <input
                type="text"
                name="work_title"
                value={formData.work_title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#141d36] border border-[#24304f] rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#141d36] border border-[#24304f] rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Allocation Amount (₹)</label>
              <input
                type="number"
                name="allocation_amount"
                value={formData.allocation_amount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#141d36] border border-[#24304f] rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State Name</label>
              <input
                type="text"
                name="state_name"
                value={formData.state_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#141d36] border border-[#24304f] rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Constituency Name</label>
              <input
                type="text"
                name="constituency_name"
                value={formData.constituency_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#141d36] border border-[#24304f] rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating against Peer Baselines...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Live Risk Evaluation</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
            {error}
          </div>
        )}

        {/* Calculated Result Output */}
        {result && (
          <div className="p-4 rounded-lg bg-[#141d36] border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#24304f]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Evaluation Result</span>
              <RiskBadge score={result.risk_score} level={result.risk_level} size="lg" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Peer Median</span>
                <span className="font-mono font-bold text-white">
                  ₹{result.feature_values_json?.peer_median ? result.feature_values_json.peer_median.toLocaleString('en-IN') : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cost Ratio</span>
                <span className="font-mono font-bold text-white">
                  {result.feature_values_json?.ratio_to_median}x
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Peer Group Scope</span>
                <span className="font-medium text-slate-200">
                  {result.peer_stats_json?.peer_level || 'CATEGORY'}
                </span>
              </div>
            </div>

            {result.evidence_json?.bullet_points && (
              <div className="pt-2 border-t border-[#24304f]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Diagnostic Signals
                </span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {result.evidence_json.bullet_points.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.evidence_json?.recommended_action && (
              <div className="p-2.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 mt-2">
                <Info className="w-4 h-4 shrink-0 text-blue-400" />
                <span><strong>Recommended Action:</strong> {result.evidence_json.recommended_action}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SandboxModal;
