import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User as UserIcon, PlusCircle } from 'lucide-react';
import { authApi } from '../services/auth';

interface NavbarProps {
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    onLogout();
    navigate('/login');
  };

  const formatRoleLabel = (role?: string) => {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'INSPECTOR') return 'Inspector';
    return 'Inspector';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SmartPack
                </span>
                <span className="block text-[10px] text-blue-400 font-semibold uppercase tracking-wider -mt-1">
                  Legal Metrology Screening
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/inspections/new"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Inspection</span>
                </Link>

                <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                      {user.role === 'ADMIN' ? 'A' : 'I'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-medium text-slate-200 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-blue-400 font-medium">
                        {formatRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm text-slate-300 hover:text-white font-medium px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
