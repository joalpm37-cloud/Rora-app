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
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, where, orderBy, updateDoc, doc, limit } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { AIAgent, AILog, AgentStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { NewAIAgentModal } from '../components/agents/NewAIAgentModal';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const iconMap: Record<string, React.FC<any>> = {
  MessageSquare,
  BarChart3,
  PenTool,
  Globe,
  Bot
};

export const AIAgents: React.FC = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.agencyId) return;

    const q = query(
      collections.aiAgents,
      where('agencyId', '==', user.agencyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAgents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIAgent[];
      setAgents(fetchedAgents);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'ai_agents');
      } catch (e) {
        // Handled
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user?.agencyId) return;

    const qLogs = query(
      collections.aiLogs,
      where('agencyId', '==', user.agencyId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AILog[];
      setLogs(fetchedLogs);
    }, (error) => {
      console.error("Error fetching logs", error);
    });

    return () => unsubscribeLogs();
  }, [user]);

  const toggleAgentStatus = async (agentId: string, currentStatus: AgentStatus) => {
    if (!agentId) return;
    const newStatus = currentStatus === 'Activo' ? 'Inactivo' : 'Activo';
    try {
      const agentRef = doc(collections.aiAgents, agentId);
      await updateDoc(agentRef, {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'ai_agents');
    }
  };

  const formatLastActive = (date?: any) => {
    if (!date) return 'Nunca';
    try {
      return 'Hace ' + formatDistanceToNow(date.toDate ? date.toDate() : new Date(date), { locale: es });
    } catch (e) {
      return '';
    }
  };

  const formatTime = (date?: any) => {
    if (!date) return '';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agentes IA</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Configura y supervisa tus agentes inteligentes.</p>
        </div>
        <button 
          onClick={() => setIsNewAgentModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Bot className="w-4 h-4" />
          Nuevo Agente
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.length === 0 ? (
          <div className="col-span-2 glass-card p-12 flex flex-col items-center justify-center text-center">
            <Bot className="w-12 h-12 text-obsidian-muted mb-4 opacity-50" />
            <p className="text-obsidian-muted">No tienes agentes configurados.</p>
            <button 
              onClick={() => setIsNewAgentModalOpen(true)}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors"
            >
              Crear tu primer agente
            </button>
          </div>
        ) : (
          agents.map((agent) => {
            const Icon = iconMap[agent.iconType] || Bot;
            return (
              <div key={agent.id} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group">
                {/* Background Icon */}
                <Icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-obsidian-primary/5 transition-colors duration-500" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border",
                      agent.status === 'Activo' ? "bg-obsidian-primary/10 text-obsidian-primary border-obsidian-primary/20" : 
                      agent.status === 'Mantenimiento' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      <Icon className="w-7 h-7" />
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
                    Última actividad: {formatLastActive(agent.lastActiveAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    {agent.status === 'Activo' ? (
                      <button 
                        onClick={() => toggleAgentStatus(agent.id!, agent.status)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-colors"
                      >
                        <Pause className="w-3 h-3" />
                        Detener
                      </button>
                    ) : (
                      <button 
                        onClick={() => toggleAgentStatus(agent.id!, agent.status)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-obsidian-primary" />
          <h3 className="font-bold text-lg">Logs del sistema</h3>
        </div>
        <div className="space-y-4 font-mono text-[11px] text-obsidian-muted bg-black/40 p-6 rounded-2xl border border-obsidian-border max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center italic opacity-50 py-4">No hay logs recientes.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex gap-4">
                <span className="text-obsidian-primary shrink-0">[{formatTime(log.createdAt)}]</span>
                <span>{log.agentName ? `${log.agentName}: ` : 'System: '}{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {isNewAgentModalOpen && (
        <NewAIAgentModal onClose={() => setIsNewAgentModalOpen(false)} />
      )}
    </div>
  );
};
