import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-obsidian-bg">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 pb-24 md:pt-8 md:pb-8 overflow-x-hidden">
        <div>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
