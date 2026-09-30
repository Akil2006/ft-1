import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  Layers,
  BarChart3,
  BookOpen,
  Camera,
  Package,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';
import { analyticsApi } from '../services/analytics';
import { inspectionApi } from '../services/inspection';
import { AnalyticsData } from '../types/analytics';
import { Inspection } from '../types/inspection';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  SmartPackLogo,
  DashboardHeaderProductsGraphic,
  TotalInspectionsCardIcon,
  CompliantCardIcon,
  ReviewRequiredCardIcon,
  MissingInfoCardIcon,
  BotanicalLeafAccent,
} from '../components/BrandingAssets';

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-800"></div>
      </div>
    );
  }

  const getStatusBadgeClass = (result?: string) => {
    switch (result) {
      case 'COMPLIANT':
        return 'bg-[#D8F3DC] text-[#14532D] border-[#A3B18A] font-bold';
      case 'REVIEW_REQUIRED':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D] font-bold';
      case 'MISSING_INFORMATION':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5] font-bold';
      default:
        return 'bg-sand-200 text-slate-700 border-sand-300';
    }
  };

  const trendData = analytics?.inspection_trend && analytics.inspection_trend.length > 0
    ? analytics.inspection_trend.map(t => ({
        date: t.date,
        total: t.count,
        compliant: Math.round(t.count * 0.65),
        review: Math.round(t.count * 0.25),
        missing: Math.round(t.count * 0.10),
      }))
    : [
        { date: 'Sep 1', total: 4, compliant: 2, review: 1, missing: 1 },
        { date: 'Sep 5', total: 6, compliant: 4, review: 1, missing: 1 },
        { date: 'Sep 10', total: 10, compliant: 7, review: 2, missing: 1 },
        { date: 'Sep 15', total: 12, compliant: 8, review: 3, missing: 1 },
        { date: 'Sep 20', total: 10, compliant: 6, review: 4, missing: 0 },
        { date: 'Sep 25', total: 15, compliant: 10, review: 4, missing: 1 },
        { date: 'Sep 30', total: 14, compliant: 9, review: 3, missing: 2 },
      ];

  const topViolations = [
    { rank: 1, field: 'Manufacturing Date', rule: 'Rule 6', cases: 12, color: 'bg-rose-500' },
    { rank: 2, field: 'MRP (Maximum Retail Price)', rule: 'Rule 6', cases: 11, color: 'bg-amber-500' },
    { rank: 3, field: 'Manufacturer Details', rule: 'Rule 6', cases: 10, color: 'bg-yellow-500' },
    { rank: 4, field: 'Consumer Care Details', rule: 'Rule 6', cases: 9, color: 'bg-emerald-500' },
    { rank: 5, field: 'Net Quantity', rule: 'Rule 6', cases: 7, color: 'bg-forest-600' },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Top Editorial Welcome Header */}
      <div className="bg-[#FAF7EE] rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight">
              Welcome back, HARINI
            </h1>
            <span className="text-2xl">🌿</span>
          </div>
          <p className="text-sm font-semibold text-slate-700 font-sans">
            Scan. Screen. Stay Compliant. For safer markets and informed consumers.
          </p>
          <div className="pt-2 flex items-center space-x-2">
            <p className="font-handwriting text-xl text-slate-800 font-bold">
              "Accurate label screening for fair trade and consumer trust."
            </p>
            <svg className="w-12 h-6 text-slate-600" viewBox="0 0 60 24" fill="none">
              <path d="M5 5 C 25 20, 45 5, 55 18 M 55 18 L 48 14 M 55 18 L 52 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Top Right Header Graphic & Filter Dropdown */}
        <div className="flex flex-col items-end space-y-3">
          <div className="hidden sm:block">
            <DashboardHeaderProductsGraphic className="w-72 h-32" />
          </div>
          <button className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold text-slate-800 shadow-2xs">
            <span>📅 Last 30 Days</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Inspections */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <TotalInspectionsCardIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">Total Inspections</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-serif text-slate-900">{analytics?.total_inspections || 14}</span>
            <span className="text-xs font-bold text-emerald-600">↗ +27%</span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">from previous 30 days</p>
        </div>

        {/* Card 2: Compliant */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <CompliantCardIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 font-sans">Compliant</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-serif text-forest-800">{analytics?.compliant_count || 9}</span>
            <span className="text-xs font-semibold text-slate-600 font-sans">
              64% of total
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#14532D] h-full rounded-full" style={{ width: '64%' }} />
          </div>
        </div>

        {/* Card 3: Review Required */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <ReviewRequiredCardIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">Review Required</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-serif text-amber-800">{analytics?.review_required_count || 3}</span>
            <span className="text-xs font-semibold text-slate-600 font-sans">
              21% of total
            </span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '21%' }} />
          </div>
        </div>

        {/* Card 4: Missing Declarations */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <MissingInfoCardIcon className="w-10 h-10" />
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-sans">Missing Declarations</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold font-serif text-rose-800">{analytics?.missing_info_count || 2}</span>
            <span className="text-xs font-semibold text-slate-600 font-sans">
              14% of total
            </span>
          </div>
          <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }} />
          </div>
        </div>
      </div>

      {/* Chart & Top Flagged Declarations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Inspection Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700"><TrendingUp className="w-4 h-4" /></span>
                <span>Inspection Trend</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans">Inspection volume and compliance status over time</p>
            </div>
            <select className="bg-sand-50 border border-sand-300 rounded-lg text-xs font-semibold text-slate-700 px-3 py-1.5 focus:outline-none">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompliant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#CBD5E1', borderRadius: '12px', color: '#0F172A', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                <Area type="monotone" dataKey="compliant" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompliant)" name="Compliant" />
                <Area type="monotone" dataKey="review" stroke="#F59E0B" strokeWidth={2} fillOpacity={0} name="Review Required" />
                <Area type="monotone" dataKey="missing" stroke="#EF4444" strokeWidth={2} fillOpacity={0} name="Missing" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Non-Compliant Declarations */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">📈</span>
              <span>Top Non-Compliant Declarations</span>
            </h3>
            <Link to="/analytics" className="text-xs text-blue-600 font-bold hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {topViolations.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-2.5 rounded-xl bg-sand-50/60 border border-sand-200 hover:bg-sand-100/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${item.color} text-white font-bold text-xs flex items-center justify-center`}>
                    {item.rank}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-sans">
                      {item.field}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">{item.rule}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-md border border-rose-200">
                    {item.cases} cases
                  </span>
                  <span className="text-slate-400 text-xs font-bold">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspections Register & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-forest-800" />
              <span>Recent Inspections</span>
            </h3>
            <Link to="/inspections" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans bg-sand-50/50">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Missing Declarations</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 text-xs font-sans">
                <tr className="hover:bg-sand-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-600">1</td>
                  <td className="py-3 px-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-lg">🍟</div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Lays Classic Chips</p>
                    <p className="text-[10px] text-slate-500 font-mono">50 g</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">Sep 30, 2026<br />10:24 AM</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#D8F3DC] text-[#14532D] border border-[#A3B18A]">
                      Compliant
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">-</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to="/inspections" className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded-md font-semibold hover:bg-blue-50">View</Link>
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-sand-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-600">2</td>
                  <td className="py-3 px-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-300 flex items-center justify-center text-lg">🥤</div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Coca Cola</p>
                    <p className="text-[10px] text-slate-500 font-mono">500 ml</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">Sep 29, 2026<br />04:18 PM</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]">
                      Review Required
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">MRP, Mfg. Date</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to="/inspections" className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded-md font-semibold hover:bg-blue-50">View</Link>
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-sand-50/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-600">3</td>
                  <td className="py-3 px-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">🍪</div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">Parle-G Biscuits</p>
                    <p className="text-[10px] text-slate-500 font-mono">100 g</p>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">Sep 28, 2026<br />11:05 AM</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]">
                      Missing Information
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">Manufacturer, Address</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to="/inspections" className="px-3 py-1 bg-white border border-blue-300 text-blue-600 rounded-md font-semibold hover:bg-blue-50">View</Link>
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">⚡</span>
              <span>Quick Actions</span>
            </h3>
            <svg className="w-10 h-6 text-slate-400" viewBox="0 0 40 24" fill="none">
              <path d="M5 20 C 20 5, 30 20, 35 8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/inspections/new"
              className="p-3.5 rounded-xl bg-[#E6F4EA] hover:bg-[#D4EDDA] border border-[#B7E1CD] text-slate-900 transition-all flex flex-col justify-between group h-28"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#108548] text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">New Inspection</p>
                <p className="text-[10px] text-slate-600">Scan or upload package images</p>
              </div>
            </Link>

            <Link
              to="/inspections/batch"
              className="p-3.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] border border-[#FCD34D] text-slate-900 transition-all flex flex-col justify-between group h-28"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Batch Inspection</p>
                <p className="text-[10px] text-slate-600">Process multiple packages</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="p-3.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-[#7DD3FC] text-slate-900 transition-all flex flex-col justify-between group h-28"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">View Analytics</p>
                <p className="text-[10px] text-slate-600">Trends and insights</p>
              </div>
            </Link>

            <Link
              to="/regulatory"
              className="p-3.5 rounded-xl bg-[#F3E8FF] hover:bg-[#E9D5FF] border border-[#D8B4FE] text-slate-900 transition-all flex flex-col justify-between group h-28"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#9333EA] text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Regulatory Assistant</p>
                <p className="text-[10px] text-slate-600">Get rule explanations</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

