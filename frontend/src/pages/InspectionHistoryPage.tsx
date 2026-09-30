import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, PlusCircle, ArrowRight, History, Package } from 'lucide-react';
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

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'MISSING_INFORMATION':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 flex items-center gap-3">
            <History className="w-7 h-7 text-forest-700" />
            <span>Inspection Register</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-1">
            Search, filter, and audit preliminary Legal Metrology inspection records.
          </p>
        </div>

        <Link
          to="/inspections/new"
          className="flex items-center justify-center space-x-2 bg-forest-700 hover:bg-forest-600 text-white text-xs font-bold px-5 py-3 rounded-full shadow-md shadow-forest-900/20 transition-all hover:scale-[1.02] self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-sand-300 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, or inspection ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600 font-sans"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none font-sans"
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
            className="px-3.5 py-2.5 bg-ivory-50 border border-sand-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none font-sans"
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

      {/* Register Table Container */}
      <div className="bg-white border border-sand-300 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700"></div>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-ivory-50 font-sans">
                    <th className="py-3.5 px-4">Inspection ID</th>
                    <th className="py-3.5 px-4">Commodity Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 text-xs font-sans">
                  {data.items.map((insp) => (
                    <tr key={insp.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-forest-800 text-[11px]">
                        {insp.id.substring(0, 13)}...
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <span>{insp.product_name || 'Unnamed Commodity'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{insp.category || 'General'}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(insp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] border ${getStatusBadgeClass(insp.overall_result)}`}>
                          {insp.overall_result || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="inline-flex items-center space-x-1 text-forest-700 hover:text-forest-800 font-bold text-xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-sand-200 bg-ivory-50">
              <span className="text-xs text-slate-600 font-sans">
                Page <strong className="text-slate-900">{data.page}</strong> of{' '}
                <strong className="text-slate-900">{data.pages}</strong> ({data.total} total items)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl bg-white hover:bg-sand-100 disabled:opacity-40 text-slate-700 border border-sand-300 shadow-2xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl bg-white hover:bg-sand-100 disabled:opacity-40 text-slate-700 border border-sand-300 shadow-2xs transition-colors"
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
