import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { analyticsApi } from '../services/analytics';
import { AnalyticsData } from '../types/analytics';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const resultPieData = [
    { name: 'Compliant', value: analytics?.compliant_count || 0, color: '#10b981' },
    { name: 'Review Required', value: analytics?.review_required_count || 0, color: '#f59e0b' },
    { name: 'Missing Declarations', value: analytics?.missing_info_count || 0, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const flaggedBarData =
    analytics?.frequently_flagged_fields.map((f) => ({
      field: f.field_name.replace('_', ' ').toUpperCase(),
      flags: f.flag_count,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Intelligence</h1>
        <p className="text-xs text-slate-400">
          Executive Legal Metrology compliance trends and failure distribution
        </p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Screened</p>
          <p className="text-3xl font-extrabold text-white">{analytics?.total_inspections || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Compliance Rate</p>
          <p className="text-3xl font-extrabold text-emerald-400">
            {analytics?.compliance_rate?.toFixed(1) || '0.0'}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Review Required</p>
          <p className="text-3xl font-extrabold text-amber-400">{analytics?.review_required_count || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Missing Information</p>
          <p className="text-3xl font-extrabold text-rose-400">{analytics?.missing_info_count || 0}</p>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Result Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-400" />
            <span>Compliance Outcome Distribution</span>
          </h3>

          <div className="h-64 w-full">
            {resultPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resultPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {resultPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                No inspection outcomes to display yet
              </div>
            )}
          </div>
        </div>

        {/* Frequently Flagged Fields Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>Most Frequently Non-Compliant Declarations</span>
          </h3>

          <div className="h-64 w-full">
            {flaggedBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flaggedBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis type="category" dataKey="field" stroke="#94a3b8" fontSize={11} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="flags" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                No non-compliant fields flagged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
