import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  History,
  BarChart3,
  BookOpen,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  FileCheck2,
  BookMarked,
} from 'lucide-react';
import { BotanicalLeafAccent } from './BrandingAssets';

interface SidebarProps {
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const inspectorNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inspections/new', label: 'New Inspection', icon: PlusCircle },
    { to: '/inspections/batch', label: 'Batch Inspection', icon: Layers },
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
    <aside className="w-64 bg-ivory-50/90 border-r border-sand-300/80 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between relative overflow-hidden transition-all">
      {/* Decorative Botanical Leaf in Background */}
      <div className="absolute -bottom-6 -left-6 opacity-30 pointer-events-none">
        <BotanicalLeafAccent className="w-40 h-40" />
      </div>

      <div className="p-4 space-y-6 flex-1 relative z-10">
        <div className="px-3 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-forest-700/70 font-sans">
            INSPECTION CONSOLE
          </p>
        </div>

        <nav className="space-y-1.5">
          {inspectorNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-forest-700 text-white shadow-md shadow-forest-900/20 font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-forest-900 hover:bg-forest-50/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Administration Section for ADMIN role */}
        {isAdmin && (
          <div className="pt-4 border-t border-sand-300/60 space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-800/80">
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
                      `flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-900 text-white shadow-sm'
                          : 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-100/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Legal Metrology Rules Card */}
      <div className="p-4 border-t border-sand-300/80 relative z-10">
        <div className="bg-gradient-to-br from-ivory-100 to-sand-100 rounded-xl p-3 border border-sand-300/80 shadow-xs flex items-start space-x-2.5">
          <BookMarked className="w-5 h-5 text-forest-700 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">Legal Metrology Rules</p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">Packaged Commodities 2011</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-forest-100 text-forest-800 text-[10px] font-mono font-semibold rounded-md border border-forest-200">
              SmartPack Rule Set v2026.01
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
