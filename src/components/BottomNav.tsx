import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, ShieldAlert, Menu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, where } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/' },
  { icon: Users, label: 'Leads', path: '/leads' },
  { icon: Building2, label: 'Propiedades', path: '/properties' },
  { icon: ShieldAlert, label: 'Command', path: '/command-center' },
  { icon: Menu, label: 'Más', path: '/more' },
];

export const BottomNav: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Listen for pending notifications
    const q = query(
      collections.notifications,
      where('status', '==', 'pending')
      // In a real app, you might also filter by agencyId or targetUserId
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.docs.length);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      } catch (e) {
        // Catch the thrown error so it doesn't crash the whole app, 
        // but it will still be logged by handleFirestoreError
      }
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#0A0A0A]/90 backdrop-blur-xl flex justify-around items-center px-2 pb-6 pt-3 border-t border-obsidian-border md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center gap-1 transition-all duration-200 w-16",
            isActive ? "text-obsidian-primary scale-110" : "text-obsidian-muted hover:text-obsidian-primary"
          )}
        >
          <div className="relative">
            <item.icon className={cn("w-6 h-6", item.label === 'Más' && "fill-current")} />
            {item.path === '/command-center' && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.05em] truncate w-full text-center">
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};
