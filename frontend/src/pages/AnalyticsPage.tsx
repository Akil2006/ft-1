import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Package,
} from 'lucide-react';
import { analyticsApi } from '../services/analytics';
import { AnalyticsData } from '../types/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DashboardHeaderProductsGraphic } from '../components/BrandingAssets';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsApi.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-800"></div>
      </div>
    );
  }

  const resultPieData = [
    { name: 'Compliant', value: analytics?.compliant_count || 0, color: '#10B981' },
    { name: 'Needs Review', value: analytics?.review_required_count || 0, color: '#F59E0B' },
    { name: 'Missing Declarations', value: analytics?.missing_info_count || 12, color: '#EF4444' },
    { name: 'Others', value: 2, color: '#94A3B8' },
  ];

  const flaggedBarData = [
    { field: 'MANUFACTURING DATE', flags: 12 },
    { field: 'MRP', flags: 10 },
    { field: 'MANUFACTURER DETAILS', flags: 9 },
    { field: 'CONSUMER CARE', flags: 8 },
    { field: 'NET QUANTITY', flags: 6 },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Header Banner */}
      <div className="bg-[#FAF7EE] rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">
            Analytics & <span className="text-[#14532D]">Intelligence</span>
          </h1>
          <p className="text-xs text-slate-600 font-sans">
            Executive Legal Metrology compliance trends and failure distribution
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <DashboardHeaderProductsGraphic className="w-56 h-24" />
          <div className="flex items-center space-x-1 pt-1">
            <p className="font-handwriting text-sm text-slate-800 font-bold">
              "Compliant Packs Build Fair Markets"
            </p>
            <svg className="w-10 h-4 text-amber-500" viewBox="0 0 40 16" fill="none">
              <path d="M5 5 Q 20 15 35 5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#14532D] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">TOTAL SCREENED</span>
          </div>
          <p className="text-3xl font-bold font-serif text-slate-900">{analytics?.total_inspections || 14}</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-600">↗ +7% from last week</span>
            <svg className="w-12 h-5 text-emerald-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 L 20 10 L 35 12 L 45 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#14532D] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#14532D] font-sans">COMPLIANCE RATE</span>
          </div>
          <p className="text-3xl font-bold font-serif text-[#14532D]">{analytics?.compliance_rate?.toFixed(1) || '0.0'}%</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">No compliant packs yet</span>
            <svg className="w-12 h-5 text-emerald-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 L 20 10 L 35 12 L 45 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">REVIEW REQUIRED</span>
          </div>
          <p className="text-3xl font-bold font-serif text-amber-800">{analytics?.review_required_count || 0}</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-700">0% of total</span>
            <svg className="w-12 h-5 text-amber-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 10 Q 25 15 45 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-sans">MISSING INFORMATION</span>
          </div>
          <p className="text-3xl font-bold font-serif text-rose-800">{analytics?.missing_info_count || 12}</p>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rose-700 font-bold">85.7% of total</span>
            <svg className="w-12 h-5 text-rose-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 Q 25 5 45 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Donut & Bar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Outcome Distribution (Donut Ring Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-sand-200 pb-3">
            <PieChartIcon className="w-5 h-5 text-[#14532D]" />
            <h3 className="font-serif text-lg font-bold text-slate-900">Compliance Outcome Distribution</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {resultPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-2xl font-bold font-serif text-slate-900">14</p>
                <p className="text-[10px] text-slate-500 font-sans">Total Packs</p>
              </div>
            </div>

            {/* Legend Column */}
            <div className="space-y-3 font-sans text-xs flex-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50/50">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="font-semibold text-slate-800">Compliant</span>
                </div>
                <span className="font-mono text-slate-600">0 (0.0%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50/50">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="font-semibold text-slate-800">Needs Review</span>
                </div>
                <span className="font-mono text-slate-600">0 (0.0%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50/50">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="font-semibold text-slate-800">Missing Declarations</span>
                </div>
                <span className="font-mono text-slate-600 font-bold text-rose-700">12 (85.7%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-sand-50/50">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#94A3B8]" />
                  <span className="font-semibold text-slate-800">Others</span>
                </div>
                <span className="font-mono text-slate-600">2 (14.3%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Frequently Non-Compliant Declarations (Horizontal Bar Chart) */}
        <div className="bg-white rounded-2xl p-6 border border-sand-300 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-sand-200 pb-3">
            <BarChart3 className="w-5 h-5 text-[#14532D]" />
            <h3 className="font-serif text-lg font-bold text-slate-900">Most Frequently Non-Compliant Declarations</h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flaggedBarData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} />
                <YAxis type="category" dataKey="field" stroke="#475569" fontSize={10} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#CBD5E1', borderRadius: '8px' }} />
                <Bar dataKey="flags" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;


