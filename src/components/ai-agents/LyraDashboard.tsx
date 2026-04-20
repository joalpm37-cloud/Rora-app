import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Search,
  ChevronRight,
  Bot,
  ArrowLeft,
  Calendar,
  Zap,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { lyraService, LyraConversation } from '../../services/lyraService';
import { Lead } from '../../types';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LyraDashboardProps {
  onBack: () => void;
}

export const LyraDashboard: React.FC<LyraDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [conversation, setConversation] = useState<LyraConversation | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'visiting' | 'approved'>('pending');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      lyraService.getLeadConversation(selectedLead.id).then(setConversation);
    } else {
      setConversation(null);
    }
  }, [selectedLead]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allLeads = await lyraService.getTopLeads();
      setLeads(allLeads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (activeTab === 'pending') return l.status === 'new' || l.status === 'contacted';
    if (activeTab === 'visiting') return l.status === 'visit_scheduled';
    if (activeTab === 'approved') return l.status === 'closed' || l.status === 'ganado';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full bg-obsidian-bg text-white"
    >
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-obsidian-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors text-obsidian-muted hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Lyra <span className="text-purple-400 font-medium">Sales Agent</span></h1>
              <p className="text-[10px] text-obsidian-muted uppercase tracking-[0.2em] font-bold italic">Lead Scoring • BANT Qualification • Automated Follow-up</p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {[
            { id: 'pending', label: 'Pendientes', icon: Clock },
            { id: 'visiting', label: 'En Visita', icon: Calendar },
            { id: 'approved', label: 'Aprobadas', icon: CheckCircle2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === tab.id ? "bg-purple-500 text-white shadow-lg" : "text-obsidian-muted hover:text-white"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content Grid */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar: Lead List */}
        <div className="w-full lg:w-[400px] border-r border-white/5 flex flex-col bg-black/20">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
              <input 
                placeholder="Filtrar prospectos por nombre..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-obsidian-muted">
                <Zap className="w-6 h-6 animate-pulse mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizando pipeline...</span>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-obsidian-muted text-xs italic">
                No hay prospectos en esta etapa.
              </div>
            ) : (
              filteredLeads.map(lead => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center gap-4 transition-all group",
                    selectedLead?.id === lead.id ? "bg-purple-500/10 border border-purple-500/20" : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg">
                      {lead.name.substring(0, 1)}
                    </div>
                    {lead.score > 80 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-obsidian-bg">
                        🔥
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-sm truncate">{lead.name}</h3>
                      <span className={cn(
                        "text-[10px] font-black",
                        lead.score > 80 ? 'text-purple-400' : 'text-obsidian-muted'
                      )}>
                        {lead.score}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", lead.score > 80 ? 'bg-purple-500' : 'bg-obsidian-muted')}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] uppercase tracking-tighter text-obsidian-muted font-bold flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {lead.type || 'Inversor'}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[9px] uppercase tracking-tighter text-obsidian-muted font-bold">
                        {lead.zone || 'Internacional'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    selectedLead?.id === lead.id ? "text-purple-400 translate-x-1" : "text-white/10 opacity-0 group-hover:opacity-100"
                  )} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content: Lead Intelligence */}
        <div className="flex-1 overflow-y-auto bg-[#060807] p-8 lg:p-12 relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            {!selectedLead ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto"
              >
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                  <Bot className="w-12 h-12 text-obsidian-muted/20" />
                </div>
                <h2 className="text-2xl font-bold mb-3 tracking-tight">Inteligencia de Ventas</h2>
                <p className="text-obsidian-muted text-sm leading-relaxed">
                  Selecciona un prospecto del listado para visualizar el análisis BANT de Lyra y el resumen de sus interacciones comerciales.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedLead.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* Lead Profile Hero */}
                <div className="flex items-center justify-between border-b border-white/5 pb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-3xl font-bold text-purple-400 shadow-2xl">
                      {selectedLead.name.substring(0, 1)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        {selectedLead.name}
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-obsidian-muted uppercase tracking-[0.2em]">
                          {selectedLead.status}
                        </span>
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-obsidian-muted font-medium">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-purple-500" />
                          {selectedLead.phone}
                        </span>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          AI Score: {selectedLead.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-purple-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20">
                      Entrenar Agente
                    </button>
                  </div>
                </div>

                {/* BANT Analysis Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {['budget', 'authority', 'need', 'timeline'].map((key, i) => {
                    const icons = [DollarSign, User, Target, Clock];
                    const label = ['Presupuesto', 'Autoridad', 'Necesidad', 'Cronograma'];
                    const Colors = ['text-emerald-400', 'text-blue-400', 'text-amber-400', 'text-purple-400'];
                    const val = selectedLead.bant?.[key] || 'Pendiente';
                    
                    return (
                      <div key={key} className="bg-white/5 border border-white/10 p-6 rounded-3xl group hover:border-purple-500/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-obsidian-muted">{label[i]}</span>
                          <Clock className="w-4 h-4 text-white/10" />
                        </div>
                        <p className={cn("text-lg font-bold truncate", Colors[i])}>{val}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Agent Narrative / Conversation Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Lyra Report */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-purple-400">
                      <Bot className="w-5 h-5" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Reporte de Conversación</h3>
                    </div>
                    
                    <div className="bg-obsidian-card p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
                      
                      {conversation ? (
                        <div className="space-y-6 relative">
                          <div className="flex items-center justify-between">
                             <span className="text-[9px] font-bold text-obsidian-muted uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/5">
                              Última charla: {format(new Date(conversation.ultimaActualizacion?.seconds * 1000 || Date.now()), 'd MMM, HH:mm', { locale: es })}
                            </span>
                            <span className="text-purple-400 text-xs font-bold uppercase tracking-widest italic">{conversation.clasificacion}</span>
                          </div>
                          
                          <div className="space-y-4">
                            {conversation.conversacion.slice(-3).map((msg, i) => (
                              <div key={i} className={cn(
                                "p-4 rounded-2xl text-xs leading-relaxed",
                                msg.sender === 'agent' ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "bg-white/5 text-white/80"
                              )}>
                                <span className="block text-[8px] uppercase font-bold mb-1 opacity-50">{msg.sender === 'agent' ? 'LYRA' : 'LEAD'}</span>
                                {msg.text}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-obsidian-muted italic text-sm">
                          {loading ? 'Consultando historial...' : 'No hay historial de chat registrado para este lead.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-obsidian-muted">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Actividad de Pipeline</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { date: 'Hoy, 10:30', action: 'Lead calificado como ALTA PRIORIDAD', icon: Zap, color: 'text-purple-500' },
                        { date: 'Ayer, 16:45', action: 'Conversación completada (Criterio Authoridad)', icon: CheckCircle2, color: 'text-emerald-500' },
                        { date: '15 Abr, 09:12', action: 'Lead importado desde GoHighLevel', icon: Clock, color: 'text-blue-500' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className={cn("mt-1", item.color)}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white mb-1">{item.action}</p>
                            <span className="text-[10px] text-obsidian-muted font-medium">{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
};

// Help symbols
const DollarSign = ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const User = ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
