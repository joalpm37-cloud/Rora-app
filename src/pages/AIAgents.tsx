import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit, getDocs, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { NewAgentModal } from '../components/ai-agents/NewAgentModal';
import { LogsFullModal } from '../components/ai-agents/LogsFullModal';


const initialAgents = [
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
  const [agents, setAgents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  const iconMap: any = {
    'CRM Agent': MessageSquare,
    'Performance Agent': BarChart3,
    'Content Agent': PenTool,
    'Explorer Agent': Globe
  };

  // Efecto para inicializar (seed) si está vacío, y suscribir en tiempo real
  useEffect(() => {
    const seedDataIfEmpty = async () => {
      try {
        // 1. Seed Agentes
        const agentsSnap = await getDocs(query(collection(db, 'agentes-config'), limit(1)));
        if (agentsSnap.empty) {
          const initialAgentsData = [
            { id: "rora-central", name: "Rora Central", description: "El orquestador. Coordina a todos los agentes y se comunica directamente con el usuario.", status: "Activo", performance: 100, tasks: 520, lastActive: "Ahora mismo" },
            { id: "lira-sales", name: "Lira", description: "Ventas y Atención. Califica leads con BANT y entrega huecos de agenda del asesor.", status: "Activo", performance: 98, tasks: 1284, lastActive: "Hace 2 min" },
            { id: "lumen-content", name: "Lumen", description: "Gestión de Contenido. Transforma fotos de propiedades en guiones y piezas creativas.", status: "Activo", performance: 92, tasks: 215, lastActive: "Hace 15 min" },
            { id: "aura-ads", name: "Aura", description: "Estratega de Meta. Recibe el contenido de Lumen y lo publica/optimiza en Meta Ads.", status: "Inactivo", performance: 0, tasks: 0, lastActive: "Esperando contenido" },
            { id: "atlas-explorer", name: "Atlas", description: "Buscador de Alternativas. Filtra el inventario interno cuando Lira no cierra la cita.", status: "Activo", performance: 85, tasks: 142, lastActive: "Ayer" }
          ];
          for (let a of initialAgentsData) {
            await addDoc(collection(db, 'agentes-config'), {
              ...a,
              timestamp: serverTimestamp()
            });
          }
        }

        // 2. Seed Logs
        const logsSnap = await getDocs(query(collection(db, 'logs-agentes'), limit(1)));
        if (logsSnap.empty) {
          const dummyLogs = [
            { tipo: "completado", agente: "CRM Agent", mensaje: "Elena Gómez calificada como Hot Lead (Score: 98)", timestamp: new Date(Date.now() - 15 * 60000) },
            { tipo: "completado", agente: "CRM Agent", mensaje: "Mensaje de seguimiento enviado a Elena Gómez via WhatsApp", timestamp: new Date(Date.now() - 12 * 60000) },
            { tipo: "proceso", agente: "Content Agent", mensaje: "Generando guión para Villa Marítima — Drone View", timestamp: new Date(Date.now() - 8 * 60000) },
            { tipo: "info", agente: "Performance Agent", mensaje: "Campaña Villa Marítima optimizada. CPL bajó de €5.20 a €3.80", timestamp: new Date(Date.now() - 5 * 60000) },
            { tipo: "error", agente: "Explorer Agent", mensaje: "Conexión con fuente de datos externa fallida. Reintentando en 60s", timestamp: new Date(Date.now() - 2 * 60000) }
          ];
          for (let l of dummyLogs) {
            await addDoc(collection(db, 'logs-agentes'), l);
          }
        }
      } catch (err) {
        console.error("Error seeding data:", err);
      }
    };
    seedDataIfEmpty();

    // Suscripción Agentes
    const unsubAgents = onSnapshot(collection(db, 'agentes-config'), (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        icon: iconMap[doc.data().name] || Bot
      })));
    });

    // Suscripción Logs
    const qLogs = query(collection(db, 'logs-agentes'), orderBy('timestamp', 'desc'), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAgents();
      unsubLogs();
    };
  }, []);

  const toggleAgentStatus = async (id: string, currentStatus: string) => {
    // In a real app we would update Firebase here
    console.log("Toggle agent", id, currentStatus);
  };

  const handleAddAgent = async (newAgentData: any) => {
    // Adding new agent to Firestore would go here
  };

  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Configura y supervisa tus agentes inteligentes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Bot className="w-4 h-4" />
          Nuevo Agente
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
            {/* Background Icon */}
            {agent.icon && <agent.icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-obsidian-primary/5 transition-colors duration-500" />}
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border",
                  agent.status === 'Activo' ? "bg-obsidian-primary/10 text-obsidian-primary border-obsidian-primary/20" : 
                  agent.status === 'Mantenimiento' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                  "bg-rose-500/10 text-rose-500 border-rose-500/20"
                )}>
                  {agent.icon && <agent.icon className="w-7 h-7" />}
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
                <span className="text-xl font-bold">{(agent.tasks || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-obsidian-border relative z-10">
              <span className="text-xs text-obsidian-muted flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Última actividad: {agent.lastActive}
              </span>
              <div className="flex items-center gap-2">
                {agent.status === 'Activo' ? (
                  <button 
                    onClick={() => toggleAgentStatus(agent.id, agent.status)}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-colors"
                  >
                    <Pause className="w-3 h-3" />
                    Detener
                  </button>
                ) : (
                  <button 
                    onClick={() => toggleAgentStatus(agent.id, agent.status)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                  >
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-obsidian-primary" />
            <h3 className="font-bold text-lg">Logs del sistema</h3>
          </div>
          <button 
            onClick={() => setIsLogsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-colors border border-white/5"
          >
            <Maximize2 className="w-3 h-3" />
            Ver log completo
          </button>
        </div>
        <div className="space-y-4 font-mono text-[11px] bg-black/40 p-6 rounded-2xl border border-obsidian-border overflow-hidden">
          <style>{`
            @keyframes slideDownLog {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-log { animation: slideDownLog 0.4s ease-out forwards; }
          `}</style>
          {logs.length === 0 ? (
            <div className="text-obsidian-muted text-center py-4 font-sans">Cargando logs del sistema...</div>
          ) : (
            logs.map((log) => {
              const d = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
              const timeStr = d.toTimeString().split(' ')[0];
              
              let dotColor = 'bg-gray-500';
              let textColor = 'text-gray-400';
              if (log.tipo === 'completado') { dotColor = 'bg-emerald-500'; textColor = 'text-white'; }
              else if (log.tipo === 'proceso') { dotColor = 'bg-amber-500'; textColor = 'text-amber-200'; }
              else if (log.tipo === 'error') { dotColor = 'bg-rose-500'; textColor = 'text-rose-300'; }

              return (
                <div key={log.id} className="flex items-start gap-4 animate-log">
                  <div className="flex items-center gap-2 mt-1 shrink-0">
                    <div className={cn("w-2 h-2 rounded-full", dotColor)} />
                    <span className="text-obsidian-primary">[{timeStr}]</span>
                  </div>
                  <span className={cn("leading-relaxed", textColor)}>
                    <strong className="text-gray-300 font-bold">{log.agente}:</strong> {log.mensaje}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <NewAgentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddAgent={handleAddAgent}
      />
      <LogsFullModal 
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </div>
  );
};
