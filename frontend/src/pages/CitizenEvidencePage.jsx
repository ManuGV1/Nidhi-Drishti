import React, { useState, useEffect } from 'react';
import { citizenEvidenceService } from '../services/citizenEvidenceService';
import { ResponsibleAiPanel } from '../components/common/ResponsibleAiPanel';
import {
  ShieldCheck,
  Camera,
  Video,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Link,
  Upload,
  Search,
  Filter,
  Eye,
  Send,
  X,
  Sparkles,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CitizenEvidencePage = () => {
  const [evidences, setEvidences] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [linkCaseId, setLinkCaseId] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState('Physical Progress Discrepancy');
  const [description, setDescription] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [districtName, setDistrictName] = useState('Shivamogga');
  const [constituencyName, setConstituencyName] = useState('Shivamogga Rural');
  const [locationAddress, setLocationAddress] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [incidentDatetime, setIncidentDatetime] = useState(new Date().toISOString().slice(0, 16));
  const [photoName, setPhotoName] = useState('');
  const [videoName, setVideoName] = useState('');
  const [docName, setDocName] = useState('');
  const [targetWorkId, setTargetWorkId] = useState('');
  const [submittedEvidence, setSubmittedEvidence] = useState(null);

  const navigate = useNavigate();

  const loadEvidences = () => {
    const data = citizenEvidenceService.getEvidences();
    setEvidences(data);
  };

  useEffect(() => {
    loadEvidences();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const payload = {
      title,
      issue_category: issueCategory,
      description,
      state_name: stateName,
      district_name: districtName,
      constituency_name: constituencyName,
      location_address: locationAddress || 'Site Location Unspecified',
      coordinates: coordinates || '13.9299° N, 75.5681° E',
      incident_datetime: incidentDatetime.replace('T', ' '),
      photoName,
      videoName,
      docName,
      linked_work_id: targetWorkId ? `WORK-${targetWorkId}` : null
    };

    const newEvidence = citizenEvidenceService.submitEvidence(payload);
    setSubmittedEvidence(newEvidence);
    loadEvidences();

    // Reset Form
    setTitle('');
    setDescription('');
    setLocationAddress('');
    setCoordinates('');
    setPhotoName('');
    setVideoName('');
    setDocName('');
    setTargetWorkId('');
  };

  const handleVerify = (evidenceId) => {
    citizenEvidenceService.verifyEvidence(evidenceId, verifyNote || 'Verified by authorized oversight officer.');
    setVerifyNote('');
    loadEvidences();
    if (selectedEvidence?.evidence_id === evidenceId) {
      setSelectedEvidence(citizenEvidenceService.getEvidences().find(e => e.evidence_id === evidenceId));
    }
  };

  const handleReject = (evidenceId) => {
    citizenEvidenceService.rejectEvidence(evidenceId, verifyNote || 'Evidence rejected after verification audit.');
    setVerifyNote('');
    loadEvidences();
    if (selectedEvidence?.evidence_id === evidenceId) {
      setSelectedEvidence(citizenEvidenceService.getEvidences().find(e => e.evidence_id === evidenceId));
    }
  };

  const handleLinkCase = (evidenceId) => {
    if (!linkCaseId.trim()) return;
    citizenEvidenceService.linkToCase(evidenceId, linkCaseId.trim());
    setLinkCaseId('');
    loadEvidences();
    if (selectedEvidence?.evidence_id === evidenceId) {
      setSelectedEvidence(citizenEvidenceService.getEvidences().find(e => e.evidence_id === evidenceId));
    }
  };

  const filteredEvidences = filterStatus === 'ALL'
    ? evidences
    : evidences.filter(e => e.status === filterStatus || (filterStatus === 'LINKED' && e.linked_case_id));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              4. INVESTIGATE • CITIZEN OVERSIGHT
            </span>
            <span className="text-xs font-mono text-slate-500">PUBLIC EVIDENCE REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Citizen Evidence & Investigation Reporting Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Public accountability interface for reporting suspected work issues, ground media, and location provenance.
          </p>
        </div>

        <button
          onClick={() => { setShowSubmitModal(true); setSubmittedEvidence(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Submit Citizen Evidence</span>
        </button>
      </div>

      {/* Responsible AI Governance Panel */}
      <ResponsibleAiPanel variant="compact" />

      {/* FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">Filter Status:</span>
          {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'LINKED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === st
                  ? st === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    st === 'PENDING_VERIFICATION' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    st === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    st === 'LINKED' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                    'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st === 'PENDING_VERIFICATION' ? 'PENDING' : st}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-[11px]">
          Showing {filteredEvidences.length} Submission(s)
        </span>
      </div>

      {/* SUBMISSION SUCCESS BANNER */}
      {submittedEvidence && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-2 shadow-xl font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              <strong className="text-sm">Citizen Evidence Registered Successfully!</strong>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase">
              UNVERIFIED — PENDING HUMAN VERIFICATION
            </span>
          </div>
          <div className="text-xs space-y-1 text-slate-300 pt-1">
            <div>Evidence ID: <strong className="text-amber-300">{submittedEvidence.evidence_id}</strong></div>
            <div>Title: "{submittedEvidence.title}"</div>
            <div>Location: {submittedEvidence.location_address} ({submittedEvidence.district_name}, {submittedEvidence.state_name})</div>
          </div>
          <p className="text-[11px] text-slate-400 font-sans italic border-t border-slate-800/80 pt-2">
            "Your evidence has been assigned a unique Evidence ID and logged as Pending Verification. It will be reviewed by an authorized investigator before linking to official case workspaces."
          </p>
        </div>
      )}

      {/* EVIDENCE STREAM CARDS */}
      <div className="space-y-4">
        {filteredEvidences.map((item) => (
          <div
            key={item.evidence_id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80 font-mono">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-amber-400 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  {item.evidence_id}
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                  item.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  item.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {item.status === 'PENDING_VERIFICATION' ? 'UNVERIFIED — PENDING HUMAN VERIFICATION' : item.status}
                </span>
                {item.linked_case_id && (
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                    Linked to {item.linked_case_id}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                Submitted: {new Date(item.submitted_at).toLocaleDateString('en-IN')}
              </span>
            </div>

            {/* Content Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 font-sans">{item.title}</h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Cat: {item.issue_category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>
            </div>

            {/* Location & Time Provenance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Location Address</span>
                <span className="text-slate-200 truncate block">{item.location_address}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">GPS Coordinates</span>
                <span className="text-emerald-400 font-bold">{item.coordinates}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Incident Timestamp</span>
                <span className="text-slate-300">{item.incident_datetime}</span>
              </div>
            </div>

            {/* Media Attachments Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              {item.photos?.length > 0 && item.photos.map((p, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{p}</span>
                </span>
              ))}
              {item.videos?.length > 0 && item.videos.map((v, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300">
                  <Video className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{v}</span>
                </span>
              ))}
              {item.documents?.length > 0 && item.documents.map((d, idx) => (
                <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{d}</span>
                </span>
              ))}
              {item.linked_work_id && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target: {item.linked_work_id}</span>
                </span>
              )}
            </div>

            {/* Verification Audit Note */}
            {item.verification_notes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                  Investigator Verification Record (By: {item.verified_by || 'Oversight Officer'})
                </span>
                <p className="text-slate-300 font-sans text-xs">{item.verification_notes}</p>
              </div>
            )}

            {/* Investigator Action Controls */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerify(item.evidence_id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Evidence</span>
                </button>
                <button
                  onClick={() => handleReject(item.evidence_id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>Reject</span>
                </button>
              </div>

              {/* Link to Case Workspace Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Case ID (e.g. CASE-2026-001)..."
                  value={selectedEvidence?.evidence_id === item.evidence_id ? linkCaseId : ''}
                  onFocus={() => setSelectedEvidence(item)}
                  onChange={(e) => setLinkCaseId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 w-48 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleLinkCase(item.evidence_id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link to Case</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans space-y-0">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Submit Citizen Evidence Report</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => { handleSubmit(e); setShowSubmitModal(false); }} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-400">Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Headline summarizing suspected issue..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-400">Category *</label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Physical Progress Discrepancy">Physical Progress Discrepancy</option>
                    <option value="Material Quality Defect">Material Quality Defect</option>
                    <option value="Spatial / GPS Mismatch">Spatial / GPS Mismatch</option>
                    <option value="Unexecuted Work">Unexecuted Work</option>
                    <option value="Timeline Delay">Timeline Delay</option>
                    <option value="Financial Discrepancy">Financial Discrepancy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-400">Location Address</label>
                  <input
                    type="text"
                    placeholder="Street, ward, landmark..."
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-400">GPS Coordinates</label>
                  <input
                    type="text"
                    placeholder="13.9299° N, 75.5681° E"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-400">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={incidentDatetime}
                    onChange={(e) => setIncidentDatetime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-400">Description / Observation Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide objective facts, measurements, or observed discrepancy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload Attachments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-amber-400" /> Photo File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoName(e.target.files[0]?.name || '')}
                    className="hidden"
                    id="modal-photo-upload"
                  />
                  <label htmlFor="modal-photo-upload" className="block text-[11px] font-mono text-slate-300 truncate cursor-pointer underline">
                    {photoName || 'Attach JPG/PNG'}
                  </label>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-indigo-400" /> Video File
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoName(e.target.files[0]?.name || '')}
                    className="hidden"
                    id="modal-video-upload"
                  />
                  <label htmlFor="modal-video-upload" className="block text-[11px] font-mono text-slate-300 truncate cursor-pointer underline">
                    {videoName || 'Attach MP4/Video'}
                  </label>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Document File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocName(e.target.files[0]?.name || '')}
                    className="hidden"
                    id="modal-doc-upload"
                  />
                  <label htmlFor="modal-doc-upload" className="block text-[11px] font-mono text-slate-300 truncate cursor-pointer underline">
                    {docName || 'Attach PDF/Document'}
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center justify-between">
                <span>Initial Status upon submission:</span>
                <strong className="uppercase">UNVERIFIED — PENDING HUMAN VERIFICATION</strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !description.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold"
                >
                  SUBMIT EVIDENCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenEvidencePage;
