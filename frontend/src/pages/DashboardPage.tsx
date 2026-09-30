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
  Layers,
  BarChart3,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { analyticsApi } from '../services/analytics';
import { inspectionApi } from '../services/inspection';
import { AnalyticsData } from '../types/analytics';
import { Inspection } from '../types/inspection';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PackageInspectionIllustration, BotanicalLeafAccent } from '../components/BrandingAssets';

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  const getStatusBadgeClass = (result?: string) => {
    switch (result) {
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
    <div className="space-y-8 py-2">
      {/* Top Editorial Welcome Banner */}
      <div className="bg-gradient-to-r from-ivory-100 via-sand-100 to-sage-50 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none transform translate-x-4 -translate-y-4">
          <BotanicalLeafAccent className="w-56 h-56" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
              Welcome back, HARINI
            </h1>
            <p className="text-sm font-semibold text-forest-800">
              Scan. Screen. Stay Compliant. For safer markets and informed consumers.
            </p>
            <p className="font-handwriting text-lg text-forest-700 font-bold">
              "Accurate label screening for fair trade and consumer trust."
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <Link
              to="/inspections/new"
              className="flex items-center space-x-2 bg-forest-700 hover:bg-forest-600 text-white font-bold text-xs px-5 py-3 rounded-full shadow-md shadow-forest-900/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Inspection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Screened */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Total Inspections</span>
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-sans text-slate-900">{analytics?.total_inspections || 0}</span>
            <span className="text-xs font-semibold text-emerald-600">↗ +27%</span>
          </div>
          <p className="text-[11px] text-slate-500">from previous 30 days</p>
        </div>

        {/* Compliant */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-sans">Compliant</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-700">{analytics?.compliant_count || 0}</span>
            <span className="text-xs font-semibold text-slate-500">
              ({analytics?.compliance_rate?.toFixed(0) || '0'}% of total)
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${analytics?.compliance_rate || 0}%` }} />
          </div>
        </div>

        {/* Review Required */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-sans">Review Required</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-700">{analytics?.review_required_count || 0}</span>
            <span className="text-xs font-semibold text-slate-500">needs verification</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }} />
          </div>
        </div>

        {/* Missing Declarations */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-sans">Missing Declarations</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-700">{analytics?.missing_info_count || 0}</span>
            <span className="text-xs font-semibold text-slate-500">missing statutory fields</span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '15%' }} />
          </div>
        </div>
      </div>

      {/* Chart & Top Flagged Declarations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-700" />
                <span>Inspection Trend</span>
              </h3>
              <p className="text-xs text-slate-500">Inspection volume and compliance status over time</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-ivory-100 px-3 py-1 rounded-full border border-sand-300">Daily</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics?.inspection_trend && analytics.inspection_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.inspection_trend}>
                  <defs>
                    <linearGradient id="forestTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#15803D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#D9E2DC', borderRadius: '12px', color: '#0F172A' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#15803D" strokeWidth={2.5} fillOpacity={1} fill="url(#forestTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                No inspection trend volume recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Top Non-Compliant Declarations */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Top Non-Compliant Declarations</span>
            </h3>
            <Link to="/analytics" className="text-xs text-forest-700 font-bold hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {analytics?.frequently_flagged_fields && analytics.frequently_flagged_fields.length > 0 ? (
              analytics.frequently_flagged_fields.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-ivory-50 border border-sand-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 capitalize font-sans">
                        {flag.field_name.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Rule 6 Statutory Clause</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-md border border-amber-300">
                    {flag.flag_count} cases
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No compliance violations flagged yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inspections Register & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-forest-700" />
              <span>Recent Inspections</span>
            </h3>
            <Link to="/inspections" className="text-xs text-forest-700 font-bold hover:underline flex items-center gap-1">
              <span>View Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentInspections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-sand-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 text-xs font-sans">
                  {recentInspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{insp.product_name || 'Unnamed Commodity'}</td>
                      <td className="py-3 px-3 text-slate-600">{insp.category || 'Food & Beverage'}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadgeClass(insp.overall_result)}`}>
                          {insp.overall_result || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="inline-flex items-center space-x-1 text-forest-700 hover:text-forest-800 font-bold text-xs"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
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

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
            <span>Quick Actions</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/inspections/new"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-forest-50 hover:bg-forest-100 border border-forest-200 text-forest-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center shadow-xs">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">New Inspection</p>
                <p className="text-[10px] text-forest-700/80">Scan or upload package images</p>
              </div>
              <ArrowRight className="w-4 h-4 text-forest-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/inspections/batch"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">Batch Inspection</p>
                <p className="text-[10px] text-amber-700/80">Process multiple packages in bulk</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/analytics"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">View Analytics</p>
                <p className="text-[10px] text-sky-700/80">Inspection trends & intelligence</p>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/regulatory"
              className="flex items-center space-x-3 p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">Regulatory Assistant</p>
                <p className="text-[10px] text-purple-700/80">Get statutory rule explanations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
