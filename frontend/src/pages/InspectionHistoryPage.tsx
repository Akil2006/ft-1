import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, PlusCircle, ArrowRight, Clock, Filter, MoreVertical } from 'lucide-react';
import { inspectionApi } from '../services/inspection';
import { PaginatedInspections } from '../types/inspection';

export const InspectionHistoryPage: React.FC = () => {
  const [data, setData] = useState<PaginatedInspections | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await inspectionApi.listInspections({
        search: search || undefined,
        overall_result: resultFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load inspection history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [search, resultFilter, categoryFilter, page]);

  return (
    <div className="space-y-6 py-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#B7E1CD] text-[#14532D] flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-slate-900">Inspection History</h1>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Search and filter screened packaged commodities
            </p>
          </div>
        </div>

        <Link
          to="/inspections/new"
          className="flex items-center space-x-2 bg-[#14532D] hover:bg-forest-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-sand-300 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-sand-50/50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none font-sans"
          >
            <option value="">All Results</option>
            <option value="COMPLIANT">COMPLIANT</option>
            <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
            <option value="MISSING_INFORMATION">MISSING DECLARATIONS</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none font-sans"
          >
            <option value="">All Categories</option>
            <option value="FOOD">FOOD</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="General Package">General Package</option>
          </select>

          <button className="p-2.5 bg-white border border-sand-300 rounded-xl text-slate-600 hover:bg-sand-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-sand-300 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-800"></div>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-[#FAF7EE] font-sans">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">PRODUCT NAME</th>
                    <th className="py-3 px-4">CATEGORY</th>
                    <th className="py-3 px-4">SCREENING DATE ⇅</th>
                    <th className="py-3 px-4">OVERALL RESULT</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 text-xs font-sans">
                  {data.items.map((insp, idx) => (
                    <tr key={insp.id} className="hover:bg-sand-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-600">{(page - 1) * limit + idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-bold">
                            🍪
                          </div>
                          <span>{insp.product_name || 'Unnamed Product'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 uppercase text-[11px]">{insp.category || 'FOOD'}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(insp.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
                            insp.overall_result === 'COMPLIANT'
                              ? 'bg-[#D8F3DC] text-[#14532D]'
                              : insp.overall_result === 'REVIEW_REQUIRED' || (insp.overall_result as string) === 'PENDING'
                              ? 'bg-[#FEF3C7] text-[#B45309]'
                              : 'bg-[#FEE2E2] text-[#DC2626]'
                          }`}
                        >
                          {insp.overall_result === 'MISSING_INFORMATION' ? '⚠️ MISSING_INFORMATION' : insp.overall_result || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/inspections/${insp.id}`}
                            className="px-3 py-1 bg-[#E6F4EA] text-[#14532D] rounded-lg font-bold hover:bg-[#D4EDDA] text-xs flex items-center gap-1"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-sand-200 bg-[#FAF7EE]">
              <span className="text-xs text-slate-600 font-sans">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} results
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg bg-white border border-sand-300 text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${page === 1 ? 'bg-[#14532D] text-white' : 'bg-white text-slate-700 border border-sand-300'}`}
                >
                  1
                </button>
                <button
                  onClick={() => setPage(2)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${page === 2 ? 'bg-[#14532D] text-white' : 'bg-white text-slate-700 border border-sand-300'}`}
                >
                  2
                </button>
                <button
                  onClick={() => setPage(3)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${page === 3 ? 'bg-[#14532D] text-white' : 'bg-white text-slate-700 border border-sand-300'}`}
                >
                  3
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-white border border-sand-300 text-slate-700 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No inspection records match your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
export default InspectionHistoryPage;

