import React, { useState } from 'react';
import { Search, Shield, Database, Bell, Compass, Menu, X, Home, Map, ShieldAlert, FileCheck, Clock, Building2, FolderSearch, BarChart3, FolderCheck, FileText, Workflow, ShieldCheck } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';

const MOBILE_STAGES = [
  { path: '/command-center', label: 'National Situation', icon: Compass },
  { path: '/geography', label: 'India Intelligence', icon: Map },
  { path: '/risk-intelligence', label: 'Risk & Alerts Feed', icon: ShieldAlert },
  { path: '/compliance', label: 'Compliance Engine', icon: FileCheck },
  { path: '/early-warning', label: 'Predictive Early Warning', icon: Clock },
  { path: '/agency-intelligence', label: 'Agency Intelligence', icon: Building2 },
  { path: '/works', label: 'Works Explorer', icon: FolderSearch },
  { path: '/analytics', label: 'Analytics Lab', icon: BarChart3 },
  { path: '/investigations', label: 'Case Workspace', icon: FolderCheck },
  { path: '/citizen-evidence', label: 'Citizen Evidence', icon: ShieldCheck },
  { path: '/reports', label: 'Official Briefs', icon: FileText },
  { path: '/methodology', label: 'Methodology', icon: Workflow },
];

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/works?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          title="Toggle Mobile Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-44 sm:w-80 md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search works, MPs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </form>
      </div>

      {/* Right System Indicators */}
      <div className="flex items-center gap-3">
        {/* Citizen Evidence CTA */}
        <NavLink
          to="/citizen-evidence"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-all cursor-pointer"
          title="Submit or View Citizen Evidence Reports"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Citizen Evidence</span>
        </NavLink>

        {/* Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px]">Core PostgreSQL</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Intelligence Tagline */}
        <div className="hidden lg:block text-right">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
            TRANSPARENT DEVELOPMENT • STRONGER INDIA
          </span>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-slate-950 border-b border-slate-800 p-4 space-y-2 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono font-bold text-amber-400 uppercase">
            <span>Navigation Menu</span>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Landing
            </NavLink>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {MOBILE_STAGES.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
