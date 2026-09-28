import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  FileCheck2,
  Clock,
} from 'lucide-react';
import { analyticsApi } from '../services/analytics';
import { inspectionApi } from '../services/inspection';
import { AnalyticsData } from '../types/analytics';
import { Inspection } from '../types/inspection';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, inspectionsRes] = await Promise.all([
          analyticsApi.getAnalytics(),
          inspectionApi.listInspections({ limit: 5 }),
        ]);
        setAnalytics(data);
        setRecentInspections(inspectionsRes.items);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inspection Overview</h1>
          <p className="text-xs text-slate-400">
            Real-time Legal Metrology (Packaged Commodities) compliance analytics
          </p>
        </div>

        <Link
          to="/inspections/new"
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Screened</span>
            <FileCheck2 className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{analytics?.total_inspections || 0}</p>
          <span className="text-[11px] text-slate-400">Packaged Commodity Items</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">
            {analytics?.compliance_rate?.toFixed(1) || '0.0'}%
          </p>
          <span className="text-[11px] text-emerald-500/80">
            {analytics?.compliant_count || 0} Fully Compliant
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Review Required</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">
            {analytics?.review_required_count || 0}
          </p>
          <span className="text-[11px] text-amber-500/80">Formatting or low confidence</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Missing Declarations</span>
            <HelpCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-rose-400">
            {analytics?.missing_info_count || 0}
          </p>
          <span className="text-[11px] text-rose-500/80">Mandatory rule violation</span>
        </div>
      </div>

      {/* Chart & Flagged Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Inspection Volume (Last 30 Days)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Daily Inspections</span>
          </div>

          <div className="h-64 w-full">
            {analytics?.inspection_trend && analytics.inspection_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.inspection_trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                No inspection volume recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Frequently Flagged Declarations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Top Non-Compliant Declarations</span>
          </h3>

          <div className="space-y-3">
            {analytics?.frequently_flagged_fields && analytics.frequently_flagged_fields.length > 0 ? (
              analytics.frequently_flagged_fields.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-200 capitalize">
                      {flag.field_name.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-400">Rule 6 Violation</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-900/40 text-amber-300 text-xs font-mono font-semibold rounded border border-amber-700/50">
                    {flag.flag_count} flags
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No compliance violations flagged yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Recent Inspections</span>
          </h3>
          <Link
            to="/inspections"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInspections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Overall Result</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {recentInspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{insp.product_name || 'Unnamed Product'}</td>
                    <td className="py-3 px-4 text-slate-300 text-xs">{insp.category || 'General'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-mono border ${getStatusBadge(
                          insp.overall_result
                        )}`}
                      >
                        {insp.overall_result || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/inspections/${insp.id}`}
                        className="text-xs text-blue-400 hover:underline font-medium"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No inspections performed yet. Click "New Inspection" to start!
          </div>
        )}
      </div>
    </div>
  );
};
