import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Sparkles,
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
  Legend,
  CartesianGrid,
} from 'recharts';

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700"></div>
      </div>
    );
  }

  const resultPieData = [
    { name: 'Compliant', value: analytics?.compliant_count || 0, color: '#14532D' },
    { name: 'Review Required', value: analytics?.review_required_count || 0, color: '#D97706' },
    { name: 'Missing Declarations', value: analytics?.missing_info_count || 0, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  const flaggedBarData =
    analytics?.frequently_flagged_fields.map((f) => ({
      field: f.field_name.replace('_', ' ').toUpperCase(),
      flags: f.flag_count,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand-300/60 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold mb-2 border border-sage-300">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            <span>Inspection Intelligence & Metrology Insights</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
            Compliance Analytics & Gap Analysis
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Statutory Legal Metrology commodity inspection metrics, rule violations, and trend distribution.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-medium text-slate-500 bg-sand-200/80 px-3 py-1.5 rounded-lg border border-sand-300">
            Ruleset Engine: Legal Metrology (PC) v2026.01
          </span>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Packages Screened</p>
          <p className="text-3xl font-serif font-bold text-slate-900">{analytics?.total_inspections || 0}</p>
          <p className="text-[11px] text-slate-500">System total audit count</p>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-forest-700 uppercase tracking-wider">Compliance Rate</p>
          <p className="text-3xl font-serif font-bold text-forest-700">
            {analytics?.compliance_rate?.toFixed(1) || '0.0'}%
          </p>
          <p className="text-[11px] text-forest-600 font-medium">Fully compliant labels</p>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Review Required</p>
          <p className="text-3xl font-serif font-bold text-amber-600">{analytics?.review_required_count || 0}</p>
          <p className="text-[11px] text-amber-600">Pending inspector review</p>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Missing Information</p>
          <p className="text-3xl font-serif font-bold text-rose-600">{analytics?.missing_info_count || 0}</p>
          <p className="text-[11px] text-rose-600">Mandatory label gap</p>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Result Distribution Pie Chart */}
        <div className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-forest-700" />
              <span>Compliance Outcome Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-sans">Ratio of inspection statuses</span>
          </div>

          <div className="h-72 w-full">
            {resultPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {resultPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#D6CEB8', borderRadius: '8px', color: '#0F172A', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No inspection outcomes recorded in the system yet.
              </div>
            )}
          </div>
        </div>

        {/* Frequently Flagged Fields Bar Chart */}
        <div className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-700" />
              <span>Most Frequently Non-Compliant Declarations</span>
            </h3>
            <span className="text-xs text-slate-500 font-sans">Statutory omission count</span>
          </div>

          <div className="h-72 w-full">
            {flaggedBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flaggedBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2DBC8" />
                  <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="field" stroke="#64748B" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF7EE', borderColor: '#D6CEB8', borderRadius: '8px', color: '#0F172A', fontSize: '12px' }}
                  />
                  <Bar dataKey="flags" fill="#D97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                No non-compliant fields flagged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

