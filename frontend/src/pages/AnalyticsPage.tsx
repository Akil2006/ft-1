import React, { useEffect, useState } from 'react';
import {
  BarChart3,
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14532D]"></div>
      </div>
    );
  }

  const totalPacks = analytics?.total_inspections || 14;
  const missingCount = analytics?.missing_info_count || 12;
  const compliantCount = analytics?.compliant_count || 0;
  const reviewCount = analytics?.review_required_count || 0;
  const othersCount = totalPacks - (compliantCount + reviewCount + missingCount);
  const safeOthers = othersCount > 0 ? othersCount : 2;

  const resultPieData = [
    { name: 'Compliant', value: compliantCount, color: '#10B981' },
    { name: 'Needs Review', value: reviewCount, color: '#F59E0B' },
    { name: 'Missing Declarations', value: missingCount, color: '#FF4D4F' },
    { name: 'Others', value: safeOthers, color: '#94A3B8' },
  ];

  const flaggedBarData = [
    { field: 'MANUFACTURING DATE', flags: 12 },
    { field: 'MRP', flags: 10 },
    { field: 'MANUFACTURER DETAILS', flags: 9 },
    { field: 'CONSUMER CARE', flags: 8 },
    { field: 'NET QUANTITY', flags: 6 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-50/60 via-ivory-100 to-sand-100 rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl z-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-slate-900">Analytics & </span>
            <span className="text-[#14532D]">Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 font-sans">
            Executive Legal Metrology compliance trends and failure distribution
          </p>
        </div>

        {/* Right Product Jars Graphic & Hand-annotated Tagline */}
        <div className="hidden sm:flex flex-col items-end z-10 relative">
          <DashboardHeaderProductsGraphic className="w-64 h-28" />
          <div className="absolute -top-1 -right-2 transform rotate-2 bg-[#E6F4EA]/90 border border-[#A7F3D0] px-3 py-1 rounded-xl shadow-2xs">
            <p className="font-handwriting text-sm text-[#14532D] font-bold tracking-wide">
              Compliant Packs Build Fair Markets
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: TOTAL SCREENED */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
              <Package className="w-5 h-5 text-[#14532D]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-sans">
                TOTAL SCREENED
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">{totalPacks}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sand-100">
            <span className="font-semibold text-emerald-700">↗ +7% from last week</span>
            <svg className="w-12 h-5 text-emerald-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 L 20 10 L 35 12 L 45 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: COMPLIANCE RATE */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#14532D]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-sans">
                COMPLIANCE RATE
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#14532D] font-sans">
                {analytics?.compliance_rate?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sand-100">
            <span className="text-slate-500 font-medium">No compliant packs yet</span>
            <svg className="w-12 h-5 text-emerald-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 L 20 10 L 35 12 L 45 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: REVIEW REQUIRED */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B45309] shrink-0">
              <FileText className="w-5 h-5 text-[#B45309]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase font-sans">
                REVIEW REQUIRED
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-sans">{reviewCount}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sand-100">
            <span className="font-semibold text-amber-700">⏱ 0% of total</span>
            <svg className="w-12 h-5 text-amber-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 10 Q 25 15 45 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: MISSING INFORMATION */}
        <div className="bg-white rounded-2xl p-5 border border-sand-300 shadow-xs space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center text-[#DC2626] shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-red-800 uppercase font-sans">
                MISSING INFORMATION
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-600 font-sans">{missingCount}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sand-100">
            <span className="font-semibold text-red-600">⚠️ 85.7% of total</span>
            <svg className="w-12 h-5 text-red-500" viewBox="0 0 50 20" fill="none">
              <path d="M5 15 Q 25 5 45 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Donut Chart & Horizontal Bar Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Outcome Distribution (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-sand-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
              <PieChartIcon className="w-5 h-5 text-[#14532D]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg font-sans">
              Compliance Outcome Distribution
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Donut Chart */}
            <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {resultPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-slate-900 font-sans">{totalPacks}</p>
                <p className="text-xs text-slate-500 font-medium font-sans">Total Packs</p>
              </div>
            </div>

            {/* Right Legend Column */}
            <div className="space-y-3 font-sans text-xs flex-1 w-full">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="font-bold text-slate-800">Compliant</span>
                </div>
                <span className="font-mono font-medium text-slate-600">0 (0.0%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="font-bold text-slate-800">Needs Review</span>
                </div>
                <span className="font-mono font-medium text-slate-600">0 (0.0%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF4D4F]" />
                  <span className="font-bold text-slate-800">Missing Declarations</span>
                </div>
                <span className="font-mono font-bold text-red-600">12 (85.7%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC]">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#94A3B8]" />
                  <span className="font-bold text-slate-800">Others</span>
                </div>
                <span className="font-mono font-medium text-slate-600">2 (14.3%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Frequently Non-Compliant Declarations (Horizontal Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-300 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 border-b border-sand-200 pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4EA] border border-[#C8E6C9] flex items-center justify-center text-[#14532D] shrink-0">
              <BarChart3 className="w-5 h-5 text-[#14532D]" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg font-sans">
              Most Frequently Non-Compliant Declarations
            </h3>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flaggedBarData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={[0, 12]} ticks={[0, 3, 6, 9, 12]} />
                <YAxis type="category" dataKey="field" stroke="#475569" fontSize={10} width={135} />
                <Tooltip contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#CBD5E1', borderRadius: '12px' }} />
                <Bar dataKey="flags" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
