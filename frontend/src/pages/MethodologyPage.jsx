import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { 
  Database, 
  Filter, 
  BarChart2, 
  ShieldAlert, 
  Cpu, 
  FileText, 
  UserCheck, 
  ChevronRight, 
  X, 
  Sparkles,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PIPELINE_STAGES = [
  {
    stage: '01',
    title: 'Data Ingestion',
    desc: 'Raw CSVs parsed with 100% losslessness into PostgreSQL database schema.',
    icon: Database,
    details: {
      overview: 'Preserves 60,359 recommended works and 44,028 completed works cleanly in PostgreSQL.',
      methods: ['100% Lossless CSV Parsing', 'snake_case Schema Mapping', 'Exact Ingestion Provenance'],
      safeguards: 'Zero synthetic physical progress values created or inferred.',
    },
  },
  {
    stage: '02',
    title: 'Validation & Normalization',
    desc: 'Snake_case mapping, date parsing, LGD administrative geography resolution.',
    icon: Filter,
    details: {
      overview: 'Maps state and district names to official Local Government Directory (LGD) codes across 36 States/UTs and 785 Districts.',
      methods: ['LGD Directory Mapping', 'Polymorphic Foreign Key Constraints', 'Clean Date Standardization'],
      safeguards: 'Maintains source MP names without inventing non-existent IDs.',
    },
  },
  {
    stage: '03',
    title: 'Peer Analytics',
    desc: 'Multi-tier peer statistics (Median, IQR, MAD, Percentiles).',
    icon: BarChart2,
    details: {
      overview: 'Computes robust non-parametric baselines grouped by (Category, State, Constituency).',
      methods: ['Median Absolute Deviation (MAD)', 'Interquartile Range (IQR)', 'Non-Parametric Peer Centering'],
      safeguards: 'Prevents extreme monetary outliers from skewing baselines.',
    },
  },
  {
    stage: '04',
    title: 'Anomaly Detection',
    desc: 'Robust z-scores, text similarity, HHI concentration.',
    icon: ShieldAlert,
    details: {
      overview: 'Detects spending deviations, subdistrict spatial concentration, and title patterns.',
      methods: ['Robust Z-Score', 'Herfindahl-Hirschman Index (HHI)', 'Constellation Similarity'],
      safeguards: 'Protects legitimate batch recommendations issued by MPs on identical dates.',
    },
  },
  {
    stage: '05',
    title: 'Risk Fusion',
    desc: 'Explainable 0–100 composite risk scoring & non-linear scaling.',
    icon: Cpu,
    details: {
      overview: 'Fuses feature anomaly signals into normalized 0–100 composite risk scores.',
      methods: ['Weighted Multi-Feature Aggregation', 'Non-linear Score Capping', 'Stage 3 Risk Threshold Alignment'],
      safeguards: 'Single feature spikes cannot independently trigger CRITICAL risk levels.',
    },
  },
  {
    stage: '06',
    title: 'Explainable Evidence',
    desc: 'Structured narrative evidence bullet points & peer context.',
    icon: FileText,
    details: {
      overview: 'Translates quantitative feature vectors into human-readable narrative bullet points.',
      methods: ['Structured Narrative Generation', 'Feature Contribution Attribution', 'Verification Checklist Protocol'],
      safeguards: 'Never declares fraud or irregularity legally confirmed.',
    },
  },
  {
    stage: '07',
    title: 'Human Investigation',
    desc: 'Oversight authorities review prioritized case dossiers.',
    icon: UserCheck,
    details: {
      overview: 'Unified case workspace allowing investigators to track dossier status and post audit notes.',
      methods: ['Lifecycle Status Transitions', 'Audit Trail Logging', 'Official Brief Export'],
      safeguards: 'Ensures final decisions rest exclusively with human oversight authorities.',
    },
  },
];

export const MethodologyPage = () => {
  const [selectedStage, setSelectedStage] = useState(PIPELINE_STAGES[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              METHOD
            </span>
            <span className="text-xs font-mono text-slate-500">SYSTEM ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Methodology & Pipeline Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Transparent breakdown of NIDHI DRISHTI's 7-stage intelligence pipeline and statistical mechanics.
          </p>
        </div>
      </div>

      {/* 7-STAGE PIPELINE VISUAL FLOW */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
          <Workflow className="w-4 h-4 text-indigo-400" />
          Interactive End-to-End Pipeline Flow (Click any stage to expand)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {PIPELINE_STAGES.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedStage.stage === s.stage;
            return (
              <div
                key={s.stage}
                onClick={() => setSelectedStage(s)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-102'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-400' : 'text-indigo-400'}`}>
                      STAGE {s.stage}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-indigo-400'}`} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 mb-1 leading-tight">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-normal line-clamp-3">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPANDED STAGE EXPLANATION PANEL */}
      <AnimatePresence mode="wait">
        {selectedStage && (
          <motion.div
            key={selectedStage.stage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                  STAGE {selectedStage.stage} SPECIFICATION
                </span>
                <h2 className="text-lg font-bold text-slate-100 font-sans">{selectedStage.title}</h2>
              </div>
              <span className="text-xs font-mono text-slate-500">Pipeline Module Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overview Box */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Stage Purpose & Scope</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{selectedStage.details.overview}</p>
              </div>

              {/* Methods Box */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Core Computational Methods</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedStage.details.methods.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safeguards Box */}
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Institutional Real-Data Safeguard</span>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{selectedStage.details.safeguards}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MethodologyPage;
