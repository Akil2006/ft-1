import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'MISSING_INFORMATION':
        return 'bg-rose-900/60 text-rose-300 border-rose-700/50';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inspection History</h1>
          <p className="text-xs text-slate-400">Search and filter screened packaged commodities</p>
        </div>

        <Link
          to="/inspections/new"
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
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
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="FOOD">Food & Beverage</option>
            <option value="COSMETICS">Cosmetics</option>
            <option value="PHARMA">Pharmaceuticals</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Table & Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/40">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Screening Date</th>
                    <th className="py-3 px-4">Overall Result</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {data.items.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{insp.product_name || 'Unnamed Product'}</td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">{insp.category || 'General'}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                        {new Date(insp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${getStatusBadge(
                            insp.overall_result
                          )}`}
                        >
                          {insp.overall_result || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="text-xs text-blue-400 hover:underline font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400">
                Showing page <strong className="text-white">{data.page}</strong> of{' '}
                <strong className="text-white">{data.pages}</strong> ({data.total} total items)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No inspection records match your filters.
          </div>
        )}
      </div>
    </div>
  );
};
