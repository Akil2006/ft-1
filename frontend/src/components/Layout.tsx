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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-1">
        {showSidebar && user && <Sidebar userRole={user.role} />}
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <DisclaimerBanner />
          {children}
        </main>
      </div>
    </div>
  );
};
