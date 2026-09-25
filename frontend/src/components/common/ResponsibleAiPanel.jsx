import React, { useState } from 'react';
import { ShieldCheck, Scale, UserCheck, FileCheck, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const ResponsibleAiPanel = ({ variant = 'compact', className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const TRUST_PRINCIPLES = [
    {
      title: 'Risk ≠ Fraud',
      desc: 'Risk score is an analytical indicator of spend deviation, not a legal finding of fraud or guilt.',
      icon: Scale,
    },
    {
      title: 'AI Support ≠ Final Decision',
      desc: 'AI assists investigation and evidence synthesis; human oversight authorities make all final decisions.',
      icon: UserCheck,
    },
    {
      title: 'Evidence Shown with Signal',
      desc: 'Every flagged alert is directly supported by real source API evidence and peer category benchmarks.',
      icon: FileCheck,
    },
    {
      title: 'Missing Info Disclosed',
      desc: 'Fields missing from source records are explicitly stated as "Not available in this source record".',
      icon: Info,
    },
    {
      title: 'Source Provenance Preserved',
      desc: 'Raw PostgreSQL dataset records and LGD administrative geography boundaries are strictly preserved.',
      icon: ShieldCheck,
    },
    {
      title: 'Human Verification Mandatory',
      desc: 'Physical inspection and officer audit remain mandatory prior to any official administrative action.',
      icon: UserCheck,
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-sans ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="uppercase tracking-wider text-[11px]">RESPONSIBLE AI & TRUST FRAMEWORK</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-slate-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isExpanded ? 'Collapse Principles' : 'View Trust Principles'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed">
          <strong className="text-amber-300 font-semibold">Institutional Governance Notice:</strong> Risk scores are analytical indicators, not proof of fraud. AI supports investigation; authorized public officials make final decisions.
        </p>

        {isExpanded && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TRUST_PRINCIPLES.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                    <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-normal font-normal">{p.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4 shadow-xl text-xs font-sans ${className}`}>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">ETHICAL GOVERNANCE</span>
          <h3 className="heading-editorial text-sm font-bold text-slate-100">RESPONSIBLE AI TRUST FRAMEWORK</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TRUST_PRINCIPLES.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
                <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{p.title}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-normal">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResponsibleAiPanel;
