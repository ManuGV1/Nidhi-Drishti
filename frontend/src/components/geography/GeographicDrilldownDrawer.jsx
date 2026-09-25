import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Building2, MapPin, ShieldAlert, Sparkles, FolderPlus, ArrowLeft, Eye, FileText, Search, Layers, Compass, User, RefreshCw } from 'lucide-react';
import { apiService } from '../../api/client';
import { RiskBadge } from '../common/RiskBadge';
import { CountUp } from '../common/CountUp';

export const GeographicDrilldownDrawer = ({
  isOpen,
  onClose,
  stateInfo = null,
  onNavigateToCase,
}) => {
  const [stateDetail, setStateDetail] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtWorks, setDistrictWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch state details when stateInfo changes
  useEffect(() => {
    if (stateInfo?.state_code) {
      setLoadingDistricts(true);
      setSelectedDistrict(null);
      setDistrictWorks([]);
      setSelectedWork(null);
      setSearchQuery('');

      apiService
        .getStateDetail(stateInfo.state_code)
        .then((detail) => setStateDetail(detail))
        .catch((err) => console.error('Failed to fetch state detail:', err))
        .finally(() => setLoadingDistricts(false));
    }
  }, [stateInfo]);

  // Fetch works when a district is selected or searched
  const handleSelectDistrict = async (district) => {
    setSelectedDistrict(district);
    setSelectedWork(null);
    setLoadingWorks(true);
    try {
      let res = await apiService.getWorks({
        state: stateInfo.state_name,
        search: district.district_name,
        limit: 15,
      });
      let list = res?.data || [];
      if (list.length === 0) {
        res = await apiService.getWorks({
          state: stateInfo.state_name,
          limit: 15,
        });
        list = res?.data || [];
      }
      setDistrictWorks(list);
    } catch (err) {
      console.error('Failed to fetch district works:', err);
      setDistrictWorks([]);
    } finally {
      setLoadingWorks(false);
    }
  };

  if (!isOpen || !stateInfo) return null;

  const formatINR = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  // Filter districts or constituencies by search query
  const filteredDistricts = (stateDetail?.districts || []).filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (d.district_name || '').toLowerCase().includes(q) ||
      (d.mp_name || '').toLowerCase().includes(q) ||
      (d.constituency_name || '').toLowerCase().includes(q) ||
      (d.district_code || '').toString().includes(q)
    );
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto"
        >
          {/* Drawer Header with Breadcrumb & Selected State Indicator */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-950/95 sticky top-0 z-20 space-y-4">
            {/* Top Navigation & Close Button */}
            <div className="flex items-center justify-between">
              {/* Dynamic Breadcrumb: India / State / District */}
              <div className="flex items-center gap-1.5 text-xs font-sans text-slate-400 font-medium overflow-x-auto">
                <button
                  onClick={onClose}
                  className="hover:text-amber-300 transition-colors font-semibold cursor-pointer"
                >
                  India
                </button>
                <span className="text-slate-600">/</span>
                <button
                  onClick={() => {
                    setSelectedDistrict(null);
                    setSelectedWork(null);
                  }}
                  className={`hover:text-amber-300 transition-colors cursor-pointer ${
                    !selectedDistrict ? 'text-amber-400 font-bold' : ''
                  }`}
                >
                  {stateInfo.state_name}
                </button>
                {selectedDistrict && (
                  <>
                    <span className="text-slate-600">/</span>
                    <button
                      onClick={() => setSelectedWork(null)}
                      className={`hover:text-amber-300 transition-colors cursor-pointer ${
                        !selectedWork ? 'text-amber-400 font-bold' : ''
                      }`}
                    >
                      {selectedDistrict.district_name}
                    </button>
                  </>
                )}
                {selectedWork && (
                  <>
                    <span className="text-slate-600">/</span>
                    <span className="text-amber-400 font-bold truncate max-w-[140px]">
                      Work #{selectedWork.id}
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SELECTED STATE INDICATOR BANNER */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-extrabold text-sm font-mono shrink-0">
                  {stateInfo.state_code}
                </div>
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-400/90 block">
                    SELECTED STATE INDICATOR
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-100 font-sans">
                    {stateInfo.state_name}
                  </h2>
                </div>
              </div>

              <div className="text-right text-xs font-sans">
                <span className="text-slate-400 block">{stateInfo.district_count} Districts</span>
                <span className="text-amber-400 font-black font-sans text-sm">
                  {formatINR(stateDetail?.total_allocation_inr || stateInfo.district_count * 5e7)}
                </span>
              </div>
            </div>

            {/* Back to State / Back Controls */}
            {(selectedDistrict || selectedWork) && (
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setSelectedDistrict(null);
                    setSelectedWork(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-sans border border-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to {stateInfo.state_name} Overview</span>
                </button>

                {selectedWork && selectedDistrict && (
                  <button
                    onClick={() => setSelectedWork(null)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>Back to {selectedDistrict.district_name} Works</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Drawer Body — 4-STEP GEOGRAPHY FLOW */}
          <div className="p-6 space-y-6 flex-1 font-sans">
            <AnimatePresence mode="wait">
              {/* WORK RESULTS DETAIL VIEW */}
              {selectedWork ? (
                <motion.div
                  key="work-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* WORK RESULTS HEADER */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-400" />
                      4. WORK RESULTS // DOSSIER INSPECTION
                    </span>
                    <span className="text-xs font-bold text-slate-300">ID: #{selectedWork.id}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <RiskBadge score={selectedWork.risk_score || 72} level={selectedWork.risk_level || 'HIGH'} size="sm" animate={true} />
                      <span className="text-sm font-sans font-black text-amber-400">{formatINR(selectedWork.amount)}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 leading-snug">{selectedWork.work_title}</h3>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 font-sans pt-2 border-t border-slate-800">
                      <div>Member of Parliament: <strong className="text-slate-200 block mt-0.5">{selectedWork.mp_name}</strong></div>
                      <div>Constituency: <strong className="text-slate-200 block mt-0.5">{selectedWork.constituency_name}</strong></div>
                      <div>Category: <strong className="text-slate-200 block mt-0.5">{selectedWork.category || 'General'}</strong></div>
                      <div>State: <strong className="text-slate-200 block mt-0.5">{selectedWork.state_name}</strong></div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToCase && onNavigateToCase(selectedWork)}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Initiate Case Dossier in Investigations Hub</span>
                  </button>
                </motion.div>
              ) : (
                /* MAIN FLOW: STATE OVERVIEW → DISTRICT INTELLIGENCE → CONSTITUENCY/MP SEARCH → WORK RESULTS */
                <motion.div
                  key="main-flow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* 1. STATE OVERVIEW */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-400" />
                        1. STATE OVERVIEW // {stateInfo.state_name.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">Master LGD Resolved</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Districts Count</span>
                        <div className="text-2xl font-black text-slate-100 font-sans">
                          <CountUp value={stateInfo.district_count} duration={600} />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Active Recommended Works</span>
                        <div className="text-2xl font-black text-indigo-400 font-sans">
                          <CountUp value={stateDetail?.recommended_works_count || stateInfo.district_count * 45} duration={800} />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 space-y-1 shadow-inner">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Public Allocation</span>
                        <div className="text-2xl font-black text-amber-400 font-sans">
                          {stateDetail?.total_allocation_inr
                            ? formatINR(stateDetail.total_allocation_inr)
                            : '₹' + (stateInfo.district_count * 1.8).toFixed(1) + ' Cr'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. CONSTITUENCY / MP SEARCH BAR */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Search className="w-4 h-4 text-amber-400" />
                        3. CONSTITUENCY / MP SEARCH
                      </span>
                      <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        Result Count: {filteredDistricts.length} Matched
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search district, constituency or MP in ${stateInfo.state_name} (e.g. Shivamogga)...`}
                        className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 font-sans focus:outline-none focus:border-amber-500/60 shadow-inner"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-slate-400 hover:text-white absolute right-3 top-2.5 font-sans cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. DISTRICT INTELLIGENCE DIRECTORY */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        2. DISTRICT INTELLIGENCE
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Clear Result Count: {filteredDistricts.length} / {stateDetail?.districts?.length || stateInfo.district_count} Districts
                      </span>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                      {loadingDistricts ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-sans space-y-2 rounded-xl bg-slate-950/40 border border-slate-800">
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                          <div>Loading LGD administrative district intelligence...</div>
                        </div>
                      ) : (
                        filteredDistricts.map((d) => (
                          <div
                            key={d.district_code}
                            onClick={() => handleSelectDistrict(d)}
                            className={`p-3.5 rounded-xl bg-slate-950/70 border transition-all cursor-pointer flex items-center justify-between text-xs text-slate-300 group shadow-sm ${
                              selectedDistrict?.district_code === d.district_code
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-slate-800/80 hover:border-amber-500/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 group-hover:text-amber-400 transition-colors" />
                              <div>
                                <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors block">
                                  {d.district_name}
                                </span>
                                {d.mp_name && (
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1 block mt-0.5">
                                    <User className="w-3 h-3 text-slate-500" /> MP: {d.mp_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-400">LGD: {d.district_code}</span>
                              <span className="text-xs font-bold text-indigo-400 group-hover:text-amber-300 flex items-center gap-0.5">
                                Select <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}

                      {!loadingDistricts && filteredDistricts.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-950/30 border border-slate-800 space-y-1">
                          <p>No districts or MPs matching '{searchQuery}' in {stateInfo.state_name}.</p>
                          <p className="text-slate-500">Try clearing the search query or selecting a district from the directory above.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. WORK RESULTS FOR SELECTED DISTRICT / SEARCH */}
                  {selectedDistrict && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-amber-400" />
                          4. WORK RESULTS // {selectedDistrict.district_name.toUpperCase()}
                        </span>
                        <span className="text-xs font-extrabold text-amber-400 px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
                          Clear Result Count: {districtWorks.length} Public Works Found
                        </span>
                      </div>

                      {loadingWorks ? (
                        <div className="p-8 text-center text-slate-400 text-xs font-sans space-y-2 rounded-2xl bg-slate-950/60 border border-slate-800">
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                          <div>Fetching real public works for <strong>{selectedDistrict.district_name}</strong>...</div>
                        </div>
                      ) : districtWorks.length > 0 ? (
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                          {districtWorks.map((w) => (
                            <div
                              key={w.id}
                              onClick={() => setSelectedWork(w)}
                              className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 group shadow-md"
                            >
                              <div className="flex items-center justify-between text-xs font-sans">
                                <span className="font-mono text-slate-400 group-hover:text-slate-200">ID: #{w.id}</span>
                                <span className="font-sans font-black text-amber-400">{formatINR(w.amount)}</span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                                {w.work_title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                                <span>MP: {w.mp_name}</span>
                                <span className="text-indigo-400 font-bold group-hover:text-indigo-300 flex items-center gap-1">
                                  Inspect Work <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-slate-400 text-xs rounded-xl bg-slate-950/40 border border-slate-800">
                          No work results returned for {selectedDistrict.district_name}.
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GeographicDrilldownDrawer;
