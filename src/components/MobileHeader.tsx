import React from 'react';
import { Bell } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

export const MobileHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-obsidian-border md:hidden">
      <div className="flex items-center gap-3">
        <Logo className="w-8 h-8" />
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg leading-tight tracking-tight">RORA</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-obsidian-primary hover:opacity-80 transition-opacity relative">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-obsidian-border">
          <img src={user?.photoURL || "https://i.pravatar.cc/150?u=admin"} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>
    </header>
  );
};
