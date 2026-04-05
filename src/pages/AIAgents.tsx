import React from 'react';
import { 
  Bot, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  BarChart3, 
  MessageSquare, 
  Globe, 
  PenTool,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const agents = [
  { 
    id: 1, 
    name: 'CRM Agent', 
    description: 'Califica leads, agenda visitas y gestiona el seguimiento automático.', 
    status: 'Activo', 
    icon: MessageSquare, 
    performance: 98,
    tasks: 1284,
    lastActive: 'Hace 2 min'
  },
  { 
    id: 2, 
    name: 'Performance Agent', 
    description: 'Optimiza campañas de marketing y analiza el CPL en tiempo real.', 
    status: 'Activo', 
    icon: BarChart3, 
    performance: 94,
    tasks: 45,
    lastActive: 'Hace 15 min'
  },
  { 
    id: 3, 
    name: 'Content Agent', 
    description: 'Genera copys, imágenes y estrategias de contenido para redes sociales.', 
    status: 'Mantenimiento', 
    icon: PenTool, 
    performance: 88,
    tasks: 12,
    lastActive: 'Hace 2h'
  },
  { 
    id: 4, 
    name: 'Explorer Agent', 
    description: 'Busca nuevas oportunidades de mercado y analiza la competencia.', 
    status: 'Inactivo', 
    icon: Globe, 
    performance: 0,
    tasks: 0,
    lastActive: 'Ayer'
  },
];

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AIAgents: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Configura y supervisa tus agentes inteligentes.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
          <Bot className="w-4 h-4" />
          Nuevo Agente
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
            {/* Background Icon */}
            <agent.icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-obsidian-primary/5 transition-colors duration-500" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border",
                  agent.status === 'Activo' ? "bg-obsidian-primary/10 text-obsidian-primary border-obsidian-primary/20" : 
                  agent.status === 'Mantenimiento' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                  "bg-rose-500/10 text-rose-500 border-rose-500/20"
                )}>
                  <agent.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      agent.status === 'Activo' ? "bg-emerald-500" : 
                      agent.status === 'Mantenimiento' ? "bg-amber-500" : "bg-rose-500"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">{agent.status}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Settings className="w-5 h-5 text-obsidian-muted" />
              </button>
            </div>

            <p className="text-sm text-obsidian-muted leading-relaxed relative z-10">
              {agent.description}
            </p>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted block mb-1">Rendimiento</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{agent.performance}%</span>
                  <div className="flex-1 h-1.5 bg-obsidian-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-obsidian-primary rounded-full transition-all duration-1000"
                      style={{ width: `${agent.performance}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted block mb-1">Tareas completadas</span>
                <span className="text-xl font-bold">{agent.tasks.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-obsidian-border relative z-10">
              <span className="text-xs text-obsidian-muted flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Última actividad: {agent.lastActive}
              </span>
              <div className="flex items-center gap-2">
                {agent.status === 'Activo' ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-colors">
                    <Pause className="w-3 h-3" />
                    Detener
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                    <Play className="w-3 h-3" />
                    Iniciar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-obsidian-primary" />
          <h3 className="font-bold text-lg">Logs del sistema</h3>
        </div>
        <div className="space-y-4 font-mono text-[11px] text-obsidian-muted bg-black/40 p-6 rounded-2xl border border-obsidian-border">
          <div className="flex gap-4">
            <span className="text-obsidian-primary">[10:45:22]</span>
            <span>CRM Agent: Elena Gómez calificada como Hot Lead (Score: 98).</span>
          </div>
          <div className="flex gap-4">
            <span className="text-obsidian-primary">[10:48:05]</span>
            <span>CRM Agent: Mensaje de seguimiento enviado a Elena Gómez vía WhatsApp.</span>
          </div>
          <div className="flex gap-4">
            <span className="text-obsidian-primary">[11:02:15]</span>
            <span>Performance Agent: Optimización de puja completada para campaña "Marbella Luxury".</span>
          </div>
          <div className="flex gap-4">
            <span className="text-obsidian-primary">[11:15:40]</span>
            <span>System: Content Agent entrando en modo mantenimiento para actualización de modelo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
