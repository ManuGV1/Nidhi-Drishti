import React, { useState, useEffect, useRef } from 'react';
import { Printer, Sparkles, CheckCircle2, ChevronDown, Edit3, ShieldAlert } from 'lucide-react';
import { apiService } from '../api/client';

export const ReportsPage = () => {
  const printRef = useRef(null);
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable Brief State
  const [briefSummary, setBriefSummary] = useState(
    'This document represents an official intelligence brief produced by the NIDHI DRISHTI Core Engine for prioritization of manual physical and financial verification.'
  );
  const [briefWorkId, setBriefWorkId] = useState('10042 (RECOMMENDED)');
  const [briefState, setBriefState] = useState('Uttar Pradesh (Varanasi)');
  const [briefMpName, setBriefMpName] = useState('Prime Minister');
  const [briefAmount, setBriefAmount] = useState('₹25,00,000.00');
  const [briefStatus, setBriefStatus] = useState('RECOMMENDED (Stage 1)');
  const [briefAction, setBriefAction] = useState(
    'Prioritize target work ID for manual physical audit inspection and request sanction milestone documents from implementing agency.'
  );

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const res = await apiService.getWorks({ limit: 25 });
        const list = res?.data || [];
        setWorks(list);
        if (list.length > 0) {
          applyWorkToBrief(list[0]);
        }
      } catch (err) {
        console.error('Failed to load works for brief selector:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  const formatINR = (val) => {
    if (!val) return '₹0.00';
    return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const applyWorkToBrief = (work) => {
    setSelectedWork(work);
    const wId = `${work.id || 'N/A'} (${work.work_type || 'RECOMMENDED'})`;
    const wState = `${work.state_name || 'State N/A'} (${work.constituency_name || 'Constituency N/A'})`;
    const wMp = work.mp_name || 'Not available in source record';
    const wAmt = formatINR(work.amount);
    const wStatus = work.status || 'RECOMMENDED (Stage 1 Proposal)';
    const wSummary = `Official intelligence brief for Work ID ${work.id}: "${work.work_title || 'Public Work'}". Sourced from verified public expenditure dataset for administrative triage and physical verification.`;
    const wAction = `Prioritize Work ID ${work.id} for physical site inspection with ${work.ida_name || 'Implementing District Authority'}. Validate sanction documentation against peer median allocations.`;

    setBriefWorkId(wId);
    setBriefState(wState);
    setBriefMpName(wMp);
    setBriefAmount(wAmt);
    setBriefStatus(wStatus);
    setBriefSummary(wSummary);
    setBriefAction(wAction);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* HEADER & DOSSIER SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              REPORT GENERATOR
            </span>
            <span className="text-xs font-mono text-slate-500">AI DOSSIER PLANNER & PUBLICATION BRIEF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Official Intelligence Brief
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Select any Dossier work to generate a case-specific report, edit planner details, preview, and download PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>{isEditing ? 'Close Editor' : 'Edit Brief Details'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/10 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Brief / Download PDF</span>
          </button>
        </div>
      </div>

      {/* AI PLANNER DOSSIER SELECTOR BAR */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Case Planner — Select Target Work Dossier</span>
          </label>
          <span className="text-xs font-mono text-slate-500">{works.length} Verified Works Available</span>
        </div>

        <div className="relative">
          <select
            onChange={(e) => {
              const selected = works.find((w) => String(w.id) === e.target.value);
              if (selected) applyWorkToBrief(selected);
            }}
            value={selectedWork?.id || ''}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                ID: {w.id} | {w.work_title?.slice(0, 45)}... | {w.state_name} | ₹{Number(w.amount).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* EDITABLE PLANNER PANEL */}
      {isEditing && (
        <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 text-xs font-mono print:hidden">
          <h3 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Brief Fields before PDF Export
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Target Work ID & Type</label>
              <input
                type="text"
                value={briefWorkId}
                onChange={(e) => setBriefWorkId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">State & Constituency</label>
              <input
                type="text"
                value={briefState}
                onChange={(e) => setBriefState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Parliamentary MP</label>
              <input
                type="text"
                value={briefMpName}
                onChange={(e) => setBriefMpName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Sanctioned Amount</label>
              <input
                type="text"
                value={briefAmount}
                onChange={(e) => setBriefAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 block mb-1">Executive Summary</label>
              <textarea
                rows={2}
                value={briefSummary}
                onChange={(e) => setBriefSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-400 block mb-1">Recommended Oversight Action</label>
              <textarea
                rows={2}
                value={briefAction}
                onChange={(e) => setBriefAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL INTELLIGENCE BRIEF CONTAINER */}
      <div ref={printRef} className="p-8 sm:p-10 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-8 text-slate-100 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* DOCUMENT HEADER */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src="/assets/branding/nidhi-drishti-logo.png"
              alt="NIDHI DRISHTI Logo"
              onError={(e) => { e.target.style.display = 'none'; }}
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-wider text-slate-100 font-sans print:text-black">NIDHI DRISHTI</h1>
              <h2 className="text-xs font-extrabold tracking-widest text-slate-400 uppercase print:text-slate-600">
                PUBLIC FUND INTELLIGENCE BRIEF
              </h2>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5 print:text-slate-500">Transparent Development • Stronger India</span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="px-3 py-1 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg inline-block print:border-black print:text-black">
              REF ID: ND-INV-2026-{(selectedWork?.id || 10042).toString().padStart(4, '0')}
            </span>
            <span className="block text-[11px] text-slate-400 mt-1 print:text-slate-600">
              DATE: {new Date().toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>

        {/* SECTION 1: EXECUTIVE SUMMARY */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5 print:text-black">
            <Sparkles className="w-3.5 h-3.5 print:hidden" />
            1. Executive Summary
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300 font-normal leading-relaxed print:bg-slate-100 print:text-black print:border-slate-300">
            <p>{briefSummary}</p>
          </div>
        </div>

        {/* SECTION 2: NATIONAL SIGNALS & TARGET SPECIFICATIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono print:text-black">
            2. Target Work Specifications & Metadata
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs font-sans print:bg-slate-100 print:text-black print:border-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px] font-mono uppercase print:text-slate-600">Work ID & Type</span>
              <span className="font-mono font-bold text-slate-100 print:text-black">{briefWorkId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-mono uppercase print:text-slate-600">State / Territory</span>
              <span className="font-medium text-slate-200 print:text-black">{briefState}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-mono uppercase print:text-slate-600">Parliamentary MP</span>
              <span className="font-medium text-slate-200 print:text-black">{briefMpName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px] font-mono uppercase print:text-slate-600">Sanctioned Amount</span>
              <span className="font-mono font-bold text-amber-400 print:text-black">{briefAmount}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: KEY FINDINGS & EVIDENCE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono print:text-black">
            3. Key Diagnostic Findings & Evidence Stream
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3 text-xs text-slate-300 print:bg-slate-100 print:text-black print:border-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:border-slate-300">
              <span>Status: <strong className="font-mono text-amber-400 text-sm print:text-black">{briefStatus}</strong></span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold print:border-black print:text-black">
                AUTOMATED TRIAGE SIGNAL
              </span>
            </div>
            <ul className="space-y-2 text-slate-300 print:text-black">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 print:bg-black" />
                <span>Work Category: {selectedWork?.category || 'General Infrastructure'}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 print:bg-black" />
                <span>Implementing District Authority (IDA): {selectedWork?.ida_name || 'UNSPECIFIED'}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 print:bg-black" />
                <span>Source Dataset Record: {selectedWork?.source_file || 'public.works_all'}.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 4: RECOMMENDED VERIFICATION PROTOCOL */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono print:text-black">
            4. Recommended Oversight Protocol
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs text-slate-300 print:bg-slate-100 print:text-black print:border-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 print:text-black" />
              <span>{briefAction}</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: METHODOLOGY & LEGAL DISCLAIMER */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-normal print:border-slate-300 print:text-slate-600">
          <p><strong>Methodology:</strong> Risk scoring utilizes robust z-scores, IQR outlier thresholds, and HHI spatial concentration metrics across LGD administrative boundaries.</p>
          <p><strong>Disclaimer:</strong> NIDHI DRISHTI risk indicators represent computational triage signals generated by statistical models. Flags prioritize administrative audit schedules and do not constitute legal proof of irregularity or fraud.</p>
          <p className="font-mono text-[10px] text-slate-500 pt-1 print:text-slate-500">Generated by NIDHI DRISHTI Core Engine • Smart India Hackathon 2026 (SIH26102)</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
