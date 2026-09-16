import React, { useEffect, useState } from 'react';
import { apiService } from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { WorkIntelligenceModal } from '../components/works/WorkIntelligenceModal';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Building2, MapPin, Layers, FolderSearch } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const WorksExplorerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [works, setWorks] = useState([]);
  const [workType, setWorkType] = useState(searchParams.get('work_type') || 'RECOMMENDED');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [statesList, setStatesList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorkItem, setSelectedWorkItem] = useState(null);

  useEffect(() => {
    apiService.getStates().then((res) => setStatesList(res || [])).catch(() => {});
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        work_type: workType,
        page,
        limit: 25,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedState) params.state = selectedState;

      const data = await apiService.getWorks(params);
      setWorks(data.data || []);
      setTotalPages(data.total_pages || 1);
      setTotalRecords(data.total_records || 0);
    } catch (err) {
      console.error('Failed to load works:', err);
      setError(err.detail || 'Could not fetch works from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [workType, page, selectedState]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchWorks();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              3. UNDERSTAND • EXPLORE
            </span>
            <span className="text-xs font-mono text-slate-500">PUBLIC WORKS DATABASE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            Works Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal">
            Comprehensive database explorer spanning 275,366 verified public works across MPLADS and Nirikshan datasets.
          </p>
        </div>
      </div>

      {/* WORK TYPE TOGGLE PILLS & SEARCH TOOLBAR */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Work Type 4-way Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full lg:w-auto overflow-x-auto">
            {[
              { id: 'RECOMMENDED', label: 'MPLADS Rec (60,359)' },
              { id: 'COMPLETED', label: 'MPLADS Comp (44,028)' },
              { id: 'NIRIKSHAN_RECOMMENDED', label: 'Nirikshan Rec (127,282)' },
              { id: 'NIRIKSHAN_COMPLETED', label: 'Nirikshan Comp (43,697)' },
            ].map((wt) => (
              <button
                key={wt.id}
                onClick={() => {
                  setWorkType(wt.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  workType === wt.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {wt.label}
              </button>
            ))}
          </div>

          {/* Large Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH PUBLIC WORKS (Title, MP, Category)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-sans"
            />
          </form>
        </div>

        {/* State Dropdown Filter */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800 text-xs">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] font-mono">State / UT Filter:</span>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="">All Administrative States & UTs (36)</option>
            {statesList.map((s) => (
              <option key={s.state_code} value={s.state_name}>
                {s.state_name} ({s.district_count} Districts)
              </option>
            ))}
          </select>

          {selectedState && (
            <button
              onClick={() => setSelectedState('')}
              className="text-xs text-amber-400 underline hover:text-amber-300 ml-auto cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message="Fetching public works data from PostgreSQL database..." />}
      {error && <ErrorAlert message={error} onRetry={fetchWorks} />}

      {/* WORKS DATA EXPLORATION TABLE */}
      {!loading && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-4 px-4">ID</th>
                  <th className="py-4 px-4">Work Title / Description</th>
                  <th className="py-4 px-4">MP / Agency Name</th>
                  <th className="py-4 px-4">State & Constituency</th>
                  <th className="py-4 px-4 text-right">Monetary Amount (₹)</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {works.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedWorkItem(w)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono text-slate-400 group-hover:text-slate-200">{w.id}</td>
                    <td className="py-4 px-4 max-w-md">
                      <div className="font-semibold text-slate-100 leading-snug group-hover:text-amber-400 transition-colors">
                        {w.work_title}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{w.category || 'General Infrastructure'}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300 font-medium">{w.mp_name || w.ida_name || 'Not available'}</td>
                    <td className="py-4 px-4">
                      <div className="text-slate-200 font-medium">{w.state_name}</div>
                      <div className="text-[11px] text-slate-500">{w.constituency_name}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-amber-400">
                      ₹{w.amount ? w.amount.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedWorkItem(w)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-indigo-400 border border-slate-800 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 mx-auto"
                        title="Examine Work Intelligence Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-mono">
            Page <strong className="text-slate-200">{page}</strong> of <strong className="text-slate-200">{totalPages}</strong> (<strong className="text-slate-200">{totalRecords.toLocaleString('en-IN')}</strong> total records)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* WORK INTELLIGENCE DOSSIER MODAL */}
      <WorkIntelligenceModal
        isOpen={!!selectedWorkItem}
        onClose={() => setSelectedWorkItem(null)}
        workId={selectedWorkItem?.id}
        workType={selectedWorkItem?.work_type || workType}
        anomalyItem={selectedWorkItem}
        onInitiateCase={() => navigate('/investigations')}
      />
    </div>
  );
};

export default WorksExplorerPage;
