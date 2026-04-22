import React from 'react';
import { 
  Users, 
  Eye, 
  CheckCircle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Bot,
  Clock,
  Check
} from 'lucide-react';

const data = [
  { name: 'Lun', value: 400 },
  { name: 'Mar', value: 300 },
  { name: 'Mie', value: 600 },
  { name: 'Jue', value: 800 },
  { name: 'Vie', value: 500 },
  { name: 'Sab', value: 900 },
  { name: 'Dom', value: 1100 },
];

const StatCard = ({ icon: Icon, label, value, change, trend }: any) => (
  <div className="bg-[#0F2A1A] rounded-2xl border border-obsidian-border p-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
    <div>
      <p className="text-obsidian-muted text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-medium mt-1">{value}</h3>
    </div>
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Panel de control</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Bienvenido de nuevo, Administrador.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="flex-1 md:flex-none px-4 py-2 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            Exportar reporte
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
            Nueva propiedad
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Leads" value="1,284" change="+12.5%" trend="up" />
        <StatCard icon={Eye} label="Visitas agendadas" value="48" change="+8.2%" trend="up" />
        <StatCard icon={CheckCircle} label="Cierres exitosos" value="12" change="-2.4%" trend="down" />
        <StatCard icon={DollarSign} label="CPL Promedio" value="$4.20" change="+15.3%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Rendimiento semanal</h3>
            <select className="bg-obsidian-bg border border-obsidian-border text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>Últimos 7 días</option>
              <option>Últimos 30 días</option>
            </select>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center text-obsidian-muted">
            Gráfico desactivado temporalmente
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-6">
          <h3 className="font-bold text-lg">Estado Agentes IA</h3>
          <div className="space-y-4">
            {[
              { name: 'CRM Agent', status: 'Activo', color: 'emerald' },
              { name: 'Performance Agent', status: 'Activo', color: 'emerald' },
              { name: 'Content Agent', status: 'Mantenimiento', color: 'amber' },
              { name: 'Explorer Agent', status: 'Inactivo', color: 'rose' },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    agent.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
                    agent.color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                  agent.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
                  agent.color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            Ver todos los agentes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Aprobaciones pendientes</h3>
            <button className="text-obsidian-primary text-sm font-medium hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Villa Marítima - Marbella', type: 'Nueva Propiedad', time: 'Hace 2h' },
              { title: 'Penthouse Skyline - Madrid', type: 'Cambio de Precio', time: 'Hace 5h' },
              { title: 'Finca El Olivo - Sevilla', type: 'Nueva Propiedad', time: 'Hace 1d' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{item.title}</span>
                  <span className="text-xs text-obsidian-muted">{item.type} • {item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                    <Clock className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Actividad reciente</h3>
            <MoreHorizontal className="w-5 h-5 text-obsidian-muted cursor-pointer" />
          </div>
          <div className="space-y-6">
            {[
              { user: 'Carlos Ruiz', action: 'agendó una visita para', target: 'Villa Marítima', time: 'Hace 15 min' },
              { user: 'AI CRM', action: 'calificó como Hot Lead a', target: 'Elena Gómez', time: 'Hace 45 min' },
              { user: 'Sofía Chen', action: 'subió nuevas fotos de', target: 'Penthouse Skyline', time: 'Hace 2h' },
              { user: 'AI Content', action: 'generó el reporte semanal de', target: 'Instagram Ads', time: 'Hace 3h' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-obsidian-primary shrink-0" />
                <div className="flex flex-col">
                  <p className="text-sm">
                    <span className="font-bold">{item.user}</span> {item.action} <span className="font-bold text-obsidian-primary">{item.target}</span>
                  </p>
                  <span className="text-xs text-obsidian-muted mt-1">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
