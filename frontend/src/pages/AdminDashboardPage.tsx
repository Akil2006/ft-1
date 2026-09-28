import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { adminApi, AdminAnalyticsData } from '../services/admin';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await adminApi.getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Administration Overview</h1>
          <p className="text-xs text-slate-400">
            System-wide statistics across users, inspections, and compliance outcomes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin/inspections"
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>All System Inspections</span>
          </Link>
        </div>
      </div>

      {/* Admin Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total System Users</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{data?.total_users || 0}</p>
          <span className="text-[11px] text-slate-400">Registered Accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{data?.active_users || 0}</p>
          <span className="text-[11px] text-emerald-500/80">Authorized Inspectors</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inspections</span>
            <FileCheck2 className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-400">{data?.total_inspections || 0}</p>
          <span className="text-[11px] text-purple-400/80">
            {data?.completed_inspections || 0} Completed
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fully Compliant</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{data?.compliant_count || 0}</p>
          <span className="text-[11px] text-slate-400">Passing Screening</span>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-blue-900/50 border border-blue-700/40 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">User Accounts & Access Control</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              View user profiles, activate or deactivate inspector accounts, and promote users to Administrator access.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Open User Management</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center text-purple-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Global Inspection Records</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Audit commodity inspections performed across all users, inspect bounding-box evidence, and review statutory compliance decisions.
            </p>
          </div>
          <Link
            to="/admin/inspections"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            <span>Open System-Wide Inspections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
