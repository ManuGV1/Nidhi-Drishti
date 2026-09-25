import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { citizenEvidenceService } from '../services/citizenEvidenceService';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { 
  FolderCheck, 
  ShieldAlert, 
  FileText, 
  Send, 
  CheckCircle2, 
  User, 
  Calendar, 
  Clock, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsibleAiPanel } from '../components/common/ResponsibleAiPanel';

const LIFECYCLE_STAGES = ['RECOMMENDED', 'APPROVED', 'SANCTIONED', 'ONGOING', 'COMPLETED'];

export const InvestigationPage = () => {
  const [cases, setCases] = useState([]);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkDossier, setSelectedWorkDossier] = useState(null);
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = activeStatus !== 'ALL' ? activeStatus : undefined;
      const data = await apiService.getInvestigations(statusParam);
      setCases(data || []);
      if (data && data.length > 0) {
        setSelectedCase(data[0]);
      } else {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error('Failed to load investigation cases:', err);
      setError(err.detail || 'Could not fetch cases from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [activeStatus]);

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedCase) return;
    try {
      const updated = await apiService.updateInvestigationCase(selectedCase.case_id, {
        status: newStatus,
        note_text: noteText ? noteText : `Case status updated to ${newStatus}.`,
      });
      setSelectedCase(updated);
      setNoteText('');
      fetchCases();
    } catch (err) {
      console.error('Failed to update case status:', err);
      alert('Status update error: ' + (err.detail || 'Failed to update case.'));
    }
  };

  const getActiveStageIndex = (workType) => {
    if (workType === 'COMPLETED' || workType === 'NIRIKSHAN_COMPLETED') return 4;
    return 2;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              4. INVESTIGATE
            </span>
            <span className="text-xs font-mono text-slate-500">FORENSIC CASE DOSSIER WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Evidence-Driven Case Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Signal → Why Flagged → Supporting Data → Risk Score → Recommended Human Verification Protocol.
          </p>
        </div>
      </div>

      {/* Responsible AI Governance Panel */}
      <ResponsibleAiPanel variant="compact" />

      {/* FILTER STATUS TABS */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto border-b border-slate-800 font-mono">
        {['ALL', 'OPEN', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED', 'ESCALATED'].map((st) => (
          <button
            key={st}
            onClick={() => setActiveStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              activeStatus === st
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner message="Loading investigation case dossiers from PostgreSQL..." />}
      {error && <ErrorAlert message={error} onRetry={fetchCases} />}

      {!loading && cases.length === 0 && (
        <div className="p-12 text-center text-slate-400 text-sm rounded-2xl bg-slate-900/60 border border-slate-800">
          No investigation cases found for status '{activeStatus}'.
        </div>
      )}

      {!loading && cases.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Active Cases List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 font-mono">
              Active Case Dossiers ({cases.length})
            </h3>
            <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
              {cases.map((c) => (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCase?.case_id === c.case_id
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 font-mono">
                    <span className="text-xs font-bold text-indigo-400">{c.case_number}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                      c.status === 'OPEN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      c.status === 'UNDER_REVIEW' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                      c.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      c.status === 'ESCALATED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="text-[11px] text-slate-400">Work ID: {c.source_row_id || c.work_id}</span>
                    <RiskBadge score={c.risk_score} level={c.risk_level} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Case Workspace */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-6">
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3 font-mono">
                      <h2 className="text-xl font-bold text-slate-100">{selectedCase.case_number}</h2>
                      <RiskBadge score={selectedCase.risk_score} level={selectedCase.risk_level} size="md" />
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block font-mono">
                      Target Work ID: {selectedCase.source_row_id || selectedCase.work_id} ({selectedCase.work_type})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedWorkDossier({
                        source_row_id: selectedCase.source_row_id,
                        work_id: selectedCase.work_id,
                        work_type: selectedCase.work_type,
                        risk_score: selectedCase.risk_score,
                        risk_level: selectedCase.risk_level,
                        evidence_json: { bullet_points: Array.isArray(selectedCase.signals_summary) ? selectedCase.signals_summary : [] }
                      })}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>Full Dossier</span>
                    </button>
                    <button
                      onClick={() => navigate('/reports')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shrink-0"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Print Brief</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 6-STAGE INVESTIGATION WORKFLOW PROGRESSION TIMELINE */}
                {/* ========================================================================= */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border border-indigo-500/30 shadow-xl space-y-4 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                          INVESTIGATION WORKFLOW PROGRESSION
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          6-Stage Human-in-the-Loop Audit Trail
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-300 font-bold">
                      AI Assists Investigation • Officer Makes Final Decision
                    </div>
                  </div>

                  {/* 6-Stage Timeline Stepper */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                    {[
                      { step: 1, label: '1. SIGNAL DETECTED', icon: AlertTriangle, desc: 'Multi-signal flag' },
                      { step: 2, label: '2. WHY FLAGGED', icon: ShieldAlert, desc: 'Plain-language why' },
                      { step: 3, label: '3. EVIDENCE REVIEW', icon: FileText, desc: 'API metric audit' },
                      { step: 4, label: '4. OFFICER VERIFY', icon: Clock, desc: 'Ground verification' },
                      { step: 5, label: '5. CASE DOSSIER', icon: FolderCheck, desc: 'Formal tracking' },
                      { step: 6, label: '6. HUMAN DECISION', icon: CheckCircle2, desc: 'Officer sign-off' },
                    ].map((s) => {
                      const Icon = s.icon;
                      const getActiveStep = (status) => {
                        if (status === 'VERIFIED' || status === 'DISMISSED' || status === 'ESCALATED') return 6;
                        if (status === 'UNDER_REVIEW') return 4;
                        return 5;
                      };
                      const currentStep = getActiveStep(selectedCase.status);
                      const isCompleted = s.step <= currentStep;
                      const isCurrent = s.step === currentStep;

                      return (
                        <div
                          key={s.step}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                            isCurrent
                              ? 'bg-indigo-950/70 border-indigo-400 shadow-md shadow-indigo-500/20'
                              : isCompleted
                              ? 'bg-slate-900 border-indigo-500/40'
                              : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              isCurrent
                                ? 'bg-indigo-500 text-white border-indigo-400'
                                : isCompleted
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>
                              STAGE 0{s.step}
                            </span>
                            <Icon className={`w-3.5 h-3.5 ${
                              isCurrent ? 'text-indigo-300' : isCompleted ? 'text-indigo-400' : 'text-slate-600'
                            }`} />
                          </div>

                          <div>
                            <div className={`text-[10px] font-bold leading-tight ${
                              isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                            }`}>
                              {s.label}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate mt-0.5">
                              {s.desc}
                            </div>
                          </div>

                          <div className="w-full h-1 bg-slate-950 rounded-full mt-2.5 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-indigo-500' : 'bg-transparent'
                            }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Case Metadata Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Assigned Officer</span>
                    <span className="font-medium text-slate-200">{selectedCase.assigned_to || 'Oversight Officer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Priority Level</span>
                    <span className="font-bold text-amber-400">{selectedCase.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Initiated Date</span>
                    <span className="text-slate-300">
                      {new Date(selectedCase.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* EVIDENCE STREAM */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Forensic Evidence Stream & Signals Summary
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                    {Array.isArray(selectedCase.signals_summary) ? (
                      <ul className="space-y-2">
                        {selectedCase.signals_summary.map((sig, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{sig}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="font-mono text-[11px] whitespace-pre-wrap text-slate-300">
                        {JSON.stringify(selectedCase.signals_summary, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {/* LINKED CITIZEN EVIDENCE & INVESTIGATION REPORTS */}
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Linked Citizen Evidence & Field Reports
                    </h4>
                    <button
                      onClick={() => navigate('/citizen-evidence')}
                      className="text-[11px] text-emerald-400 underline hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      Audit All Citizen Reports →
                    </button>
                  </div>

                  {(() => {
                    const allEvidences = citizenEvidenceService.getEvidences();
                    const linked = allEvidences.filter(
                      (e) =>
                        e.linked_case_id === selectedCase.case_id ||
                        e.linked_work_id === `WORK-${selectedCase.source_row_id || selectedCase.work_id}`
                    );

                    if (linked.length === 0) {
                      return (
                        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between font-sans italic">
                          <span>No verified citizen evidence explicitly linked to this case dossier yet.</span>
                          <button
                            onClick={() => navigate('/citizen-evidence')}
                            className="text-xs font-mono font-bold text-amber-400 underline not-italic hover:text-amber-300 cursor-pointer"
                          >
                            + Review & Link Evidence
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {linked.map((ev) => (
                          <div
                            key={ev.evidence_id}
                            className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400">{ev.evidence_id}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  ev.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {ev.status === 'PENDING_VERIFICATION' ? 'UNVERIFIED — PENDING HUMAN VERIFICATION' : ev.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{ev.incident_datetime}</span>
                            </div>

                            <div className="font-bold text-slate-200 font-sans">{ev.title}</div>
                            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">{ev.description}</p>
                            <div className="text-[10px] text-slate-400">
                              Location: {ev.location_address} ({ev.coordinates})
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* RECOMMENDED VERIFICATION PROTOCOL ACTION */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <strong className="block font-bold">Recommended Human Verification Protocol</strong>
                      <span>Prioritize for manual physical inspection & financial milestone approval.</span>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* HUMAN OFFICER DECISION CONTROLS */}
                {/* ========================================================================= */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        STAGE 6: HUMAN OFFICER FINAL DECISION
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        AI assists investigation. The oversight officer makes the final decision.
                      </p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold uppercase">
                      Current Case Status: <strong className="text-indigo-400">{selectedCase.status}</strong>
                    </span>
                  </div>

                  {/* Decision Status Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {[
                      { status: 'OPEN', label: 'OPEN CASE', color: 'hover:bg-slate-800 text-slate-300 border-slate-700' },
                      { status: 'UNDER_REVIEW', label: 'UNDER REVIEW', color: 'hover:bg-indigo-900/50 text-indigo-300 border-indigo-500/40' },
                      { status: 'VERIFIED', label: 'MARK VERIFIED', color: 'hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/40' },
                      { status: 'DISMISSED', label: 'DISMISS CASE', color: 'hover:bg-slate-800 text-slate-400 border-slate-700' },
                      { status: 'ESCALATED', label: 'ESCALATE AUDIT', color: 'hover:bg-rose-900/50 text-rose-300 border-rose-500/40' },
                    ].map((item) => (
                      <button
                        key={item.status}
                        onClick={() => handleUpdateStatus(item.status)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold flex flex-col items-center justify-center gap-1 ${
                          selectedCase.status === item.status
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                            : `bg-slate-900 ${item.color}`
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="text-[9px] font-normal opacity-70">
                          {selectedCase.status === item.status ? 'Current Active' : 'Officer Action'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Audit Note Entry */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">
                      Official Audit Investigation Note
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter official officer verification notes, sanction numbers, or ground audit findings..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
                      />
                      <button
                        onClick={() => handleUpdateStatus(selectedCase.status)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 font-mono"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Note</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm rounded-2xl bg-slate-900/60 border border-slate-800">
                Select an investigation dossier from the left list to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORK INTELLIGENCE DOSSIER MODAL */}
      <WorkIntelligenceModal
        isOpen={!!selectedWorkDossier}
        onClose={() => setSelectedWorkDossier(null)}
        workId={selectedWorkDossier?.source_row_id || selectedWorkDossier?.work_id}
        workType={selectedWorkDossier?.work_type}
        anomalyItem={selectedWorkDossier}
      />
    </div>
  );
};

export default InvestigationPage;
