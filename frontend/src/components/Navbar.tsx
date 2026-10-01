import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, Search, Bell } from 'lucide-react';
import { authApi } from '../services/auth';
import { SmartPackLogo } from './BrandingAssets';

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
    return 'Inspector';
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-sand-300/60 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <SmartPackLogo />
            </Link>
          </div>


          {/* Right Header Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/inspections/new"
                  className="flex items-center space-x-2 bg-forest-700 hover:bg-forest-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm shadow-forest-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Inspection</span>
                </Link>

                {/* Notifications Bell */}
                <button
                  onClick={() => navigate('/inspections')}
                  className="relative p-2 text-slate-500 hover:text-forest-700 hover:bg-ivory-200/80 rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>

                {/* User Profile Dropdown / Badge */}
                <div className="flex items-center space-x-3 border-l border-sand-300/80 pl-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-forest-700 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-forest-600/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-forest-600 font-medium">
                        {formatRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="text-xs text-slate-700 hover:text-forest-800 font-semibold px-3 py-2 transition-colors"
                >
                  Inspector Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-forest-700 hover:bg-forest-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
