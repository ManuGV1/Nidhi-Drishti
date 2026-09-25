import React, { useState } from 'react';
import { 
  Database, 
  Filter, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  UserCheck, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  Workflow,
  TrendingUp,
  Clock,
  MapPin,
  FileCheck,
  Building2,
  Scale,
  ShieldCheck,
  HelpCircle,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 8-STAGE TECHNICAL STORY PIPELINE
const TECHNICAL_STORY = [
  {
    step: '01',
    id: 'DATA',
    title: 'DATA',
    subTitle: 'Raw Ingestion',
    desc: 'Ingestion of real public expenditure records into PostgreSQL with 100% data losslessness.',
    icon: Database,
    details: {
      scope: 'Parses 60,359 recommended works and 44,028 completed works into structured PostgreSQL tables.',
      method: 'Exact CSV schema mapping, raw field retention, and ingestion provenance tracking.',
      safeguard: 'Zero synthetic physical progress values created or inferred.',
    },
  },
  {
    step: '02',
    id: 'VALIDATION',
    title: 'VALIDATION',
    subTitle: 'LGD & Integrity',
    desc: 'Resolution of administrative geography to official LGD codes and date standardization.',
    icon: Filter,
    details: {
      scope: 'Standardizes State and District boundaries across 36 States/UTs and 785 LGD Districts.',
      method: 'Polymorphic schema constraints, date formatting, and LGD code normalization.',
      safeguard: 'Unresolved geographical strings are flagged without inventing fake LGD codes.',
    },
  },
  {
    step: '03',
    id: 'ENGINES',
    title: 'INTELLIGENCE ENGINES',
    subTitle: '7 Multi-Signal Modules',
    desc: 'Parallel execution of specialized analytical engines evaluating spend, time, text, and compliance.',
    icon: Cpu,
    details: {
      scope: 'Generates multi-dimensional telemetry vectors for every public work entry.',
      method: 'Financial MAD statistics, temporal clustering, text Jaccard similarity, and HHI agency workload.',
      safeguard: 'Engines operate strictly on current source record fields without hallucination.',
    },
  },
  {
    step: '04',
    id: 'FUSION',
    title: 'RISK FUSION',
    subTitle: '0–100 Composite Score',
    desc: 'Non-parametric fusion of engine outputs into a composite 0–100 analytical risk score.',
    icon: ShieldAlert,
    details: {
      scope: 'Fuses multi-feature anomaly signals into a normalized composite score for auditing priority.',
      method: 'Weighted signal matrix aggregation, non-linear score scaling, and ceiling thresholds.',
      safeguard: 'Single-feature spikes cannot independently trigger CRITICAL risk classification.',
    },
  },
  {
    step: '05',
    id: 'EXPLAINABILITY',
    title: 'EXPLAINABILITY',
    subTitle: 'Grounded Signals',
    desc: 'Translation of quantitative vectors into transparent, plain-language reason codes.',
    icon: HelpCircle,
    details: {
      scope: 'Explains why a case was flagged with exact signal indicators and peer baselines.',
      method: 'Feature attribution mapping, natural-language explanation generation, and benchmark context.',
      safeguard: 'Explanations remain strictly grounded in current dossier telemetry.',
    },
  },
  {
    step: '06',
    id: 'EVIDENCE',
    title: 'EVIDENCE',
    subTitle: 'Evidence Chain',
    desc: 'Structured evidence chain linking Signal → Why → Evidence → Interpretation → Action.',
    icon: FileText,
    details: {
      scope: 'Distinguishes between observed evidence and unavailable source fields.',
      method: 'Structured evidence chain rendering and explicit unavailable field labeling.',
      safeguard: 'Absence of evidence is explicitly noted and never claimed as proof of wrongdoing.',
    },
  },
  {
    step: '07',
    id: 'INVESTIGATION',
    title: 'INVESTIGATION',
    subTitle: 'Officer Workflow',
    desc: 'Case dossier management enabling human oversight throughout investigation lifecycles.',
    icon: Workflow,
    details: {
      scope: 'Manages status transitions (OPEN, UNDER_REVIEW, VERIFIED, DISMISSED, ESCALATED).',
      method: 'Stateful case tracking, audit note logging, and dossier export for field inspection.',
      safeguard: 'Cases are never automatically verified or dismissed by AI.',
    },
  },
  {
    step: '08',
    id: 'HUMAN_DECISION',
    title: 'HUMAN DECISION',
    subTitle: 'Official Determination',
    desc: 'Final administrative determination rests strictly with human oversight authorities.',
    icon: UserCheck,
    details: {
      scope: 'Human oversight authority evaluates evidence chain and conducts physical verification.',
      method: 'Officer sign-off, official review log, and administrative action.',
      safeguard: 'AI assists investigation; human authorities make all final legal and administrative decisions.',
    },
  },
];

// 8 IMPLEMENTED INTELLIGENCE MODULES
const IMPLEMENTED_MODULES = [
  {
    name: 'Financial',
    tag: 'SPEND ANOMALIES',
    icon: TrendingUp,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    desc: 'Evaluates sanction amounts, expenditure magnitude, and category peer benchmarks (Median, IQR, MAD) to flag cost deviations.',
  },
  {
    name: 'Temporal',
    tag: 'APPROVAL TIMING',
    icon: Clock,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    bgColor: 'bg-indigo-500/10',
    desc: 'Analyzes approval timing, sanction date clustering, and temporal distribution patterns across fiscal sanction cycles.',
  },
  {
    name: 'Geo',
    tag: 'SPATIAL DENSITY',
    icon: MapPin,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    desc: 'Maps spatial density, LGD district distribution, and geographic allocation concentration across administrative boundaries.',
  },
  {
    name: 'Text Similarity',
    tag: 'VERBATIM WORDING',
    icon: FileText,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    desc: 'Detects verbatim or near-duplicate work title phrasing across recommendations using text similarity algorithms.',
  },
  {
    name: 'Compliance',
    tag: 'RULES ENGINE',
    icon: FileCheck,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    bgColor: 'bg-rose-500/10',
    desc: 'Evaluates sanction limits, statutory ceilings, and 6 active explainable compliance rules against official guidelines.',
  },
  {
    name: 'Predictive',
    tag: 'OVERRUN WARNING',
    icon: ShieldAlert,
    color: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/10',
    desc: 'Calculates predictive delay risk scores and velocity overrun indicators based on historical completion baselines.',
  },
  {
    name: 'Agency',
    tag: 'WORKLOAD INDEX',
    icon: Building2,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    desc: 'Measures Implementing District Authority (IDA) workload concentration and agency expenditure allocation indices.',
  },
  {
    name: 'Risk Fusion',
    tag: 'COMPOSITE MATRIX',
    icon: Cpu,
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    desc: 'Fuses multi-signal feature outputs into a composite 0–100 risk score without single-feature over-domination.',
  },
];

export const MethodologyPage = () => {
  const [selectedStep, setSelectedStep] = useState(TECHNICAL_STORY[0]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-100">
      {/* HEADER */}
      <div className="p-6 rounded-2xl panel-institutional panel-gold-header space-y-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 font-sans">
          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">SYSTEM ARCHITECTURE</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">TECHNICAL METHODOLOGY</span>
        </div>
        <h1 className="heading-editorial text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-slate-100 to-amber-200/90 tracking-wide leading-tight">
          NIDHI DRISHTI TECHNICAL METHODOLOGY & PIPELINE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          Transparent technical breakdown of NIDHI DRISHTI's 8-step analytical story, 8 implemented intelligence modules, and Responsible AI governance principles.
        </p>
      </div>

      {/* 8-STEP TECHNICAL STORY FLOW (DATA → HUMAN DECISION) */}
      <div className="p-6 rounded-2xl panel-institutional border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-amber-400" />
            <h2 className="heading-editorial text-sm sm:text-base font-bold uppercase tracking-wider text-amber-200">
              TECHNICAL STORY // END-TO-END PIPELINE FLOW
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-sans hidden sm:inline">Click any stage to expand technical specification</span>
        </div>

        {/* 8-Step Progression Diagram */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TECHNICAL_STORY.map((s, idx) => {
              const Icon = s.icon;
              const isSelected = selectedStep.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStep(s)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                        {s.step}
                      </span>
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-100 leading-tight font-sans">{s.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight font-sans line-clamp-2">{s.subTitle}</p>
                  </div>

                  {/* Flow Arrow Connector Indicator */}
                  {idx < TECHNICAL_STORY.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 hidden lg:block" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Sequential Step Arrow Ribbon */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800 overflow-x-auto">
            <span>DATA</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>VALIDATION</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>INTELLIGENCE ENGINES</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>RISK FUSION</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>EXPLAINABILITY</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>EVIDENCE</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span>INVESTIGATION</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-amber-300 font-bold">HUMAN DECISION</span>
          </div>
        </div>

        {/* EXPANDED TECHNICAL SPECIFICATION PANEL */}
        <AnimatePresence mode="wait">
          {selectedStep && (
            <motion.div
              key={selectedStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    STEP {selectedStep.step} SPECIFICATION
                  </span>
                  <h3 className="text-base font-bold text-slate-100 font-sans">{selectedStep.title} — {selectedStep.subTitle}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Pipeline Module Implemented</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Technical Scope</span>
                  <p className="text-slate-300 leading-relaxed font-normal">{selectedStep.details.scope}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider block text-[10px]">Computational Method</span>
                  <p className="text-slate-300 leading-relaxed font-normal">{selectedStep.details.method}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px]">Real-Data Safeguard</span>
                  <p className="text-slate-300 leading-relaxed font-normal">{selectedStep.details.safeguard}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 8 IMPLEMENTED INTELLIGENCE MODULES GRID */}
      <div className="p-6 rounded-2xl panel-institutional border border-slate-800 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="heading-editorial text-sm sm:text-base font-bold uppercase tracking-wider text-amber-200">
              IMPLEMENTED INTELLIGENCE MODULES
            </h2>
          </div>
          <span className="text-xs font-sans text-slate-400">8 Specialized Engines Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPLEMENTED_MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/40 transition-all space-y-3 shadow-inner flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${m.bgColor} ${m.color} border ${m.borderColor}`}>
                      {m.tag}
                    </span>
                    <Icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-100 font-sans">{m.name} Module</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{m.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Engine: Active</span>
                  <span className="text-emerald-400 font-bold">100% Implemented</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESPONSIBLE AI GOVERNANCE SECTION */}
      <div className="p-6 sm:p-8 rounded-2xl panel-institutional border border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden bg-amber-500/[0.02]">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block">
              ETHICAL GOVERNANCE & PRINCIPLES
            </span>
            <h2 className="heading-editorial text-lg sm:text-xl font-black text-slate-100">
              RESPONSIBLE AI GOVERNANCE FRAMEWORK
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Principle 1 */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Scale className="w-4 h-4 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 font-sans">
                "Risk is an indicator, not proof of fraud."
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Risk scores reflect quantitative analytical deviations generated across available telemetry signals to prioritize inspection attention. They are analytical indicators and never constitute a legal finding of fraud or guilt.
            </p>
          </div>

          {/* Principle 2 */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center gap-2.5 text-amber-400">
              <UserCheck className="w-4 h-4 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 font-sans">
                "AI supports investigation; authorities make final decisions."
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The platform equips oversight officers with structured evidence and decision-support checklists. Final administrative, legal, and audit determinations rest strictly with human oversight authorities.
            </p>
          </div>

          {/* Principle 3 */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center gap-2.5 text-amber-400">
              <FileCheck className="w-4 h-4 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 font-sans">
                "Unavailable source information is not fabricated."
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Fields missing from source dataset records are explicitly presented as "Not available in this source record". The system never invents missing data, fake percentages, or hallucinated evidence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPage;
