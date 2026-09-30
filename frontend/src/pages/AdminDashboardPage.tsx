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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forest-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand-300/60 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-800 text-white text-xs font-semibold mb-2 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-sage-300" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">System Administration Overview</h1>
          <p className="text-sm text-slate-600 mt-1">
            System-wide statistics across users, inspections, and Legal Metrology compliance outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="flex items-center space-x-2 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin/inspections"
            className="flex items-center space-x-2 bg-sand-200 hover:bg-sand-300 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-sand-300 transition-colors"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>All System Inspections</span>
          </Link>
        </div>
      </div>

      {/* Admin Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total System Users</span>
            <Users className="w-5 h-5 text-forest-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{data?.total_users || 0}</p>
          <span className="text-[11px] text-slate-500">Registered Accounts</span>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
            <UserCheck className="w-5 h-5 text-forest-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-forest-700">{data?.active_users || 0}</p>
          <span className="text-[11px] text-forest-600 font-medium">Authorized Inspectors</span>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inspections</span>
            <FileCheck2 className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{data?.total_inspections || 0}</p>
          <span className="text-[11px] text-slate-500">
            {data?.completed_inspections || 0} Completed Screenings
          </span>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Fully Compliant</span>
            <CheckCircle2 className="w-5 h-5 text-forest-700" />
          </div>
          <p className="text-3xl font-serif font-bold text-forest-700">{data?.compliant_count || 0}</p>
          <span className="text-[11px] text-forest-600 font-medium">Passed Metrology Screening</span>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-sage-100 border border-sage-300 flex items-center justify-center text-forest-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">User Accounts & Access Control</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
              View user profiles, activate or deactivate inspector accounts, and promote users to Administrator access.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-forest-800 hover:text-forest-900"
          >
            <span>Open User Management</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-sand-300/80 rounded-xl p-6 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-sand-200 border border-sand-300 flex items-center justify-center text-slate-800">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Global Inspection Records</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
              Audit commodity inspections performed across all users, inspect bounding-box evidence, and review statutory compliance decisions.
            </p>
          </div>
          <Link
            to="/admin/inspections"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-800 hover:text-slate-900"
          >
            <span>Open System-Wide Inspections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

