import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  ShieldAlert,
  FolderSearch,
  Map,
  FolderCheck,
  BarChart3,
  FileText,
  Workflow,
  FileCheck,
  Clock,
  Building2,
  Home,
  ShieldCheck
} from 'lucide-react';

const NAV_STAGES = [
  {
    stageLabel: '1. OBSERVE',
    items: [
      {
        path: '/command-center',
        label: 'National Situation',
        badgeLabel: 'SITUATION',
        icon: Compass,
      },
      {
        path: '/geography',
        label: 'India Intelligence',
        badgeLabel: 'LGD MAP',
        icon: Map,
      },
    ],
  },
  {
    stageLabel: '2. DETECT',
    items: [
      {
        path: '/risk-intelligence',
        label: 'Risk & Alerts Feed',
        badgeLabel: 'RISK HUB',
        icon: ShieldAlert,
      },
      {
        path: '/compliance',
        label: 'Compliance Engine',
        badgeLabel: '6 RULES',
        icon: FileCheck,
      },
      {
        path: '/early-warning',
        label: 'Predictive Early Warning',
        badgeLabel: 'EARLY',
        icon: Clock,
      },
    ],
  },
  {
    stageLabel: '3. UNDERSTAND',
    items: [
      {
        path: '/agency-intelligence',
        label: 'Agency Intelligence',
        badgeLabel: 'IDA HUB',
        icon: Building2,
      },
      {
        path: '/works',
        label: 'Works Explorer',
        badgeLabel: '275K WORKS',
        icon: FolderSearch,
      },
      {
        path: '/analytics',
        label: 'Analytics Lab',
        badgeLabel: 'ANALYZE',
        icon: BarChart3,
      },
    ],
  },
  {
    stageLabel: '4. INVESTIGATE',
    items: [
      {
        path: '/investigations',
        label: 'Case Workspace',
        badgeLabel: 'DOSSIER',
        icon: FolderCheck,
      },
      {
        path: '/citizen-evidence',
        label: 'Citizen Evidence',
        badgeLabel: 'PUBLIC',
        icon: ShieldCheck,
      },
      {
        path: '/reports',
        label: 'Official Briefs',
        badgeLabel: 'REPORT',
        icon: FileText,
      },
    ],
  },
  {
    stageLabel: '5. DECIDE',
    items: [
      {
        path: '/methodology',
        label: 'Methodology',
        badgeLabel: 'PIPELINE',
        icon: Workflow,
      },
    ],
  },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex w-64 bg-slate-950/90 border-r border-slate-800/80 flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-md z-30">
      {/* Top Branding Section */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/branding/nidhi-drishti-logo.png"
              alt="NIDHI DRISHTI Logo"
              className="h-9 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-xs font-extrabold tracking-wider text-slate-100 font-sans leading-none">
                NIDHI DRISHTI
              </h1>
              <h2 className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
                PUBLIC FUND INTELLIGENCE
              </h2>
            </div>
          </div>
          <NavLink
            to="/"
            title="Return to Product Landing Page"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
          </NavLink>
        </div>

        {/* Product Story Navigation Stages */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_STAGES.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase px-3 block mb-1">
                {sec.stageLabel}
              </span>

              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-slate-100 font-semibold border-l-2 border-amber-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500 group-hover:text-slate-300 shrink-0">
                      {item.badgeLabel}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PostgreSQL Active</span>
        </div>
        <span className="text-amber-400 font-bold">275.3k Works</span>
      </div>
    </aside>
  );
};

export default Sidebar;
