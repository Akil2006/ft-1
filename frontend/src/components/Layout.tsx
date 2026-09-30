import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DisclaimerBanner } from './DisclaimerBanner';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string; role?: string } | null;
  onLogout: () => void;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onLogout,
  showSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF7EE] text-slate-900 flex flex-col font-sans selection:bg-forest-200 selection:text-forest-900">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-1 relative">
        {showSidebar && user && <Sidebar userRole={user.role} />}
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {user && <DisclaimerBanner />}
          {children}
        </main>
      </div>
    </div>
  );
};
