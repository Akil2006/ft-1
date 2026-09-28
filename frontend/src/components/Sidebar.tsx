import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  BookOpen,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const inspectorNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inspections/new', label: 'New Inspection', icon: PlusCircle },
    { to: '/inspections', label: 'Inspection History', icon: History },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/regulatory', label: 'Regulatory Assistant', icon: BookOpen },
    { to: '/rules', label: 'Compliance Rules', icon: Scale },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/inspections', label: 'All Inspections', icon: FileCheck2 },
  ];

  const isAdmin = userRole === 'ADMIN';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 space-y-6 flex-1">
        <nav className="space-y-1">
          {inspectorNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Administration Section for ADMIN role */}
        {isAdmin && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400">
              ADMINISTRATION
            </p>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-purple-900/80 text-white border border-purple-700/60'
                          : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-purple-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="px-4 py-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-300">Legal Metrology Rules</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Packaged Commodities 2011</p>
          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-900/60 text-blue-300 text-[10px] font-mono rounded border border-blue-700/50">
            SmartPack Regulatory Rule Set v2026.01
          </span>
        </div>
      </div>
    </aside>
  );
};
