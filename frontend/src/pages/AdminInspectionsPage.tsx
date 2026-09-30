import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Shield, FileCheck2 } from 'lucide-react';
import { adminApi } from '../services/admin';
import { PaginatedInspections } from '../types/inspection';

export const AdminInspectionsPage: React.FC = () => {
  const [data, setData] = useState<PaginatedInspections | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllInspections({
        search: search || undefined,
        overall_result: resultFilter || undefined,
        category: categoryFilter || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load system-wide inspections', err);
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
        return 'bg-sage-100 text-forest-800 border-sage-300';
      case 'REVIEW_REQUIRED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'MISSING_INFORMATION':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-sand-200 text-slate-700 border-sand-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand-300/60 pb-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sand-200 border border-sand-300 text-slate-800 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5 text-forest-700" />
          <span>System-Wide Inspection Audit</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">All System Commodity Inspections</h1>
        <p className="text-sm text-slate-600 mt-1">Audit package commodity screenings, OCR extraction confidence, and compliance decisions across all users.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-sand-300/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-sand-50/60 border border-sand-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-forest-700"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-sand-50/60 border border-sand-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-forest-700 font-sans"
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
            className="px-3.5 py-2 bg-sand-50/60 border border-sand-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-forest-700 font-sans"
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

      {/* Table */}
      <div className="bg-white border border-sand-300/80 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-700"></div>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-[11px] font-semibold uppercase tracking-wider text-slate-600 bg-sand-100/60">
                    <th className="py-3 px-4">Inspection ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Screening Date</th>
                    <th className="py-3 px-4">Overall Result</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 text-sm">
                  {data.items.map((insp) => (
                    <tr key={insp.id} className="hover:bg-sand-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-forest-800 font-bold">
                        {insp.id.substring(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-sans">
                        {insp.product_name || 'Unnamed Product'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-sans">{insp.category || 'General'}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                        {new Date(insp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${getStatusBadge(
                            insp.overall_result
                          )}`}
                        >
                          {insp.overall_result || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="text-xs text-forest-800 hover:text-forest-900 hover:underline font-semibold font-sans"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-sand-200 bg-sand-50/60">
              <span className="text-xs text-slate-600">
                Showing page <strong className="text-slate-900">{data.page}</strong> of{' '}
                <strong className="text-slate-900">{data.pages}</strong> ({data.total} total items)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-white hover:bg-sand-100 disabled:opacity-40 text-slate-700 border border-sand-300 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-white hover:bg-sand-100 disabled:opacity-40 text-slate-700 border border-sand-300 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs italic">No system inspections match your criteria.</div>
        )}
      </div>
    </div>
  );
};

