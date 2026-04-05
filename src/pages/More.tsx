import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, Megaphone, FileText, Bot, Settings, ChevronRight, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const More: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <div className="space-y-8 md:hidden pb-8">
      <section className="space-y-4">
        <div className="bg-obsidian-card rounded-xl p-6 flex items-center justify-between border border-obsidian-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-obsidian-primary/20">
              <img src={user?.photoURL || "https://i.pravatar.cc/150?u=admin"} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{user?.displayName || 'Usuario'}</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-obsidian-primary">Admin</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-obsidian-muted" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Link to="/chats" className="bg-obsidian-card p-5 rounded-xl flex flex-col justify-between aspect-square border border-obsidian-border active:scale-95 transition-all">
          <MessageSquare className="w-8 h-8 text-obsidian-primary" />
          <span className="font-medium text-obsidian-muted text-sm">Chats</span>
        </Link>
        <Link to="/leads" className="bg-obsidian-card p-5 rounded-xl flex flex-col justify-between aspect-square border border-obsidian-border active:scale-95 transition-all">
          <Users className="w-8 h-8 text-obsidian-primary" />
          <span className="font-medium text-obsidian-muted text-sm">Leads</span>
        </Link>
        <Link to="/" className="bg-obsidian-card p-5 rounded-xl flex flex-col justify-between aspect-square border border-obsidian-border active:scale-95 transition-all">
          <BarChart3 className="w-8 h-8 text-obsidian-primary" />
          <span className="font-medium text-obsidian-muted text-sm">Reportes</span>
        </Link>
        <Link to="/campaigns" className="bg-obsidian-card p-5 rounded-xl flex flex-col justify-between aspect-square border border-obsidian-border active:scale-95 transition-all">
          <Megaphone className="w-8 h-8 text-obsidian-primary" />
          <span className="font-medium text-obsidian-muted text-sm">Campañas</span>
        </Link>
      </section>

      <section className="space-y-4">
        <div className="bg-obsidian-card rounded-xl overflow-hidden border border-obsidian-border">
          <Link to="/ai-agents" className="flex items-center justify-between p-5 border-b border-obsidian-border active:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <Bot className="w-6 h-6 text-obsidian-primary" />
              <span className="font-medium text-obsidian-muted">Agentes IA</span>
            </div>
            <ChevronRight className="w-5 h-5 text-obsidian-muted" />
          </Link>
          <Link to="/settings" className="flex items-center justify-between p-5 border-b border-obsidian-border active:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6 text-obsidian-primary" />
              <span className="font-medium text-obsidian-muted">Configuración</span>
            </div>
            <ChevronRight className="w-5 h-5 text-obsidian-muted" />
          </Link>
          <button onClick={logout} className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors text-left">
            <div className="flex items-center gap-4">
              <LogOut className="w-6 h-6 text-rose-500" />
              <span className="font-medium text-rose-500">Cerrar sesión</span>
            </div>
          </button>
        </div>
      </section>

      <section>
        <div className="bg-obsidian-card p-6 rounded-xl border border-obsidian-primary/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-obsidian-primary/10 blur-3xl rounded-full"></div>
          <div className="space-y-2 relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-obsidian-primary">RORA Platinum</p>
            <h3 className="text-lg font-medium text-white">Luxury Consultant</h3>
            <p className="text-sm text-obsidian-muted">Premium Member Access Active</p>
          </div>
          <div className="mt-6 flex items-center justify-between relative z-10">
            <span className="text-xs text-obsidian-muted">Renews in 12 days</span>
            <button className="bg-obsidian-primary text-obsidian-bg text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform">
              UPGRADE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
