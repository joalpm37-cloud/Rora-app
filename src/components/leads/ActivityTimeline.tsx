import React from 'react';
import { MessageCircle, Bot, CheckCircle2, Search, Video, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  type: 'message' | 'system' | 'agent_action';
  sender?: 'lead' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'alert';
  agentName?: string;
}

interface ActivityTimelineProps {
  events: Event[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  return (
    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-obsidian-border">
      {events.map((event) => (
        <div key={event.id} className="relative pl-10">
          {/* Icon Circle */}
          <div className={cn(
            "absolute left-0 top-0 w-8 h-8 rounded-full border border-obsidian-border flex items-center justify-center z-10",
            event.sender === 'lead' ? "bg-obsidian-card text-white" : 
            event.sender === 'agent' ? "bg-obsidian-primary/20 text-obsidian-primary border-obsidian-primary/30" :
            "bg-white/5 text-obsidian-muted"
          )}>
            {getEventIcon(event)}
          </div>

          <div className={cn(
            "p-4 rounded-2xl border transition-all hover:border-obsidian-primary/30",
            event.status === 'alert' ? "bg-red-500/5 border-red-500/20" : 
            event.status === 'pending' ? "bg-orange-500/5 border-orange-500/20" :
            "bg-obsidian-card/50 border-obsidian-border"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">
                {event.sender === 'agent' ? `Lira (Agente)` : event.sender === 'lead' ? 'Prospecto' : 'Sistema'}
              </span>
              <span className="text-[10px] text-obsidian-muted">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <p className="text-sm leading-relaxed text-white/90">
              {event.text}
            </p>

            {event.status === 'pending' && (
              <div className="mt-4 flex items-center gap-3">
                <button className="px-4 py-2 bg-obsidian-primary text-obsidian-bg text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                  Aprobar y Enviar
                </button>
                <button className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  Ignorar
                </button>
              </div>
            )}
            
            {event.status === 'completed' && (
              <div className="mt-2 flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Acción Visualizada</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

function getEventIcon(event: Event) {
  if (event.type === 'message') return <MessageCircle className="w-4 h-4" />;
  if (event.agentName === 'Atlas') return <Search className="w-4 h-4" />;
  if (event.agentName === 'Lumen') return <Video className="w-4 h-4" />;
  if (event.status === 'alert') return <AlertCircle className="w-4 h-4 text-red-500" />;
  return <Bot className="w-4 h-4" />;
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
