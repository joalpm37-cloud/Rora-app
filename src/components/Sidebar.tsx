import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare,
  MessageCircle, 
  Users, 
  Calendar, 
  Home, 
  Bot, 
  Megaphone, 
  FileText, 
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Panel de control', path: '/' },
  { icon: MessageSquare, label: 'Mensajes', path: '/chats' },
  { icon: Users, label: 'Contactos', path: '/leads' },
  { icon: Calendar, label: 'Calendario', path: '/calendar' },
  { icon: Home, label: 'Propiedades', path: '/properties' },
  { icon: Bot, label: 'Agentes IA', path: '/ai-agents' },
  { icon: Megaphone, label: 'Campañas', path: '/campaigns' },
  { icon: FileText, label: 'Contenido', path: '/content' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
  { icon: Zap, label: 'Integraciones', path: '/integrations' },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 h-screen bg-obsidian-bg border-r border-obsidian-border flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center gap-3">
        <Logo className="w-10 h-10" />
        <div className="flex flex-col">
          <span className="text-white font-bold text-xl leading-tight tracking-tight">RORA</span>
          <span className="text-obsidian-muted text-[10px] font-medium tracking-widest uppercase">Obsidian Gallery</span>
        </div>
      </div>

      <nav className="flex-1 mt-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "nav-item",
              isActive && "nav-item-active"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-obsidian-border">
        <button onClick={logout} className="nav-item w-full rounded-xl">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
