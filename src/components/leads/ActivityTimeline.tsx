import React from 'react';
import { MessageCircle, Bot, CheckCircle2, Search, Video, AlertCircle, Palette, Play, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  type: 'message' | 'system' | 'agent_action';
  sender?: 'lead' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  status?: 'pending' | 'completed' | 'alert' | 'ignored' | 'rendering';
  agentName?: string;
  data?: any;
}

interface ActivityTimelineProps {
  events: Event[];
  onApprove?: (eventId: string, actionType: string, data?: any) => void;
  onReject?: (eventId: string) => void;
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function getEventIcon(event: Event) {
  if (event.type === 'message' && !event.agentName) return <MessageCircle className="w-4 h-4" />;
  if (event.agentName === 'Atlas') return <Search className="w-4 h-4" />;
  if (event.agentName === 'Lumen') return <Video className="w-4 h-4" />;
  if (event.agentName === 'Lira' && event.data) return <Bot className="w-4 h-4 text-obsidian-primary" />;
  if (event.status === 'alert') return <AlertCircle className="w-4 h-4 text-red-500" />;
  return <Bot className="w-4 h-4" />;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, onApprove, onReject }) => {
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
            event.status === 'pending' ? "bg-orange-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5" :
            event.status === 'rendering' ? "bg-obsidian-primary/5 border-obsidian-primary/20" :
            "bg-obsidian-card/50 border-obsidian-border"
          )}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">
                {event.agentName ? `${event.agentName} (Agente)` : event.sender === 'lead' ? 'Prospecto' : 'Sistema'}
              </span>
              <span className="text-[10px] text-obsidian-muted">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-white/90">
                {event.text}
              </p>

              {/* Lira: Sugerencias de Citas */}
              {event.agentName === 'Lira' && event.data && (
                <div className="grid grid-cols-1 gap-2 py-2">
                  {(() => {
                    try {
                      const proposals = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                      return proposals.map((slot: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{slot.label}</span>
                            <span className="text-[10px] text-obsidian-muted">Duración: 30 min</span>
                          </div>
                          {event.status === 'pending' && (
                            <button 
                              onClick={() => onApprove?.(event.id, 'SELECT_SLOT', slot)}
                              className="px-3 py-1.5 bg-obsidian-primary text-obsidian-bg text-[10px] font-bold rounded-lg hover:opacity-90 transition-all"
                            >
                              Seleccionar
                            </button>
                          )}
                        </div>
                      ));
                    } catch (e) { return null; }
                  })()}
                </div>
              )}

              {/* Atlas: Sugerencias de Propiedades */}
              {event.agentName === 'Atlas' && event.data && (
                <div className="grid grid-cols-1 gap-4 py-2">
                  {(() => {
                    try {
                      const alternatives = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                      const props = alternatives.propiedades || [];
                      return props.map((prop: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-obsidian-primary/20 transition-all">
                          <div className="w-20 h-14 bg-obsidian-card rounded-lg overflow-hidden shrink-0">
                            <img src={prop.image || 'https://via.placeholder.com/150'} alt={prop.titulo} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white truncate">{prop.titulo}</h4>
                              <span className="text-[10px] font-bold text-obsidian-primary">{prop.match}% Match</span>
                            </div>
                            <p className="text-[10px] text-obsidian-muted truncate">{prop.zona} • {prop.habitaciones} Hab</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-emerald-500">€{Number(prop.precio).toLocaleString()}</span>
                              <button 
                                onClick={() => window.location.hash = `/properties/${prop.id}`}
                                className="text-[10px] font-bold text-obsidian-primary hover:underline"
                              >
                                Ver Detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    } catch (e) { return null; }
                  })()}
                </div>
              )}

              {/* Lumen: Director de Arte & Video */}
              {event.agentName === 'Lumen' && event.data && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                  {(() => {
                    try {
                      const content = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                      const config = content.videoConfig || {};
                      
                      return (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-primary block mb-1">Guión Creativo</span>
                              <p className="text-xs text-white/70 italic leading-relaxed">"{content.guion}"</p>
                            </div>
                            <div className="ml-4 flex gap-1">
                              {config.colorPalette && Object.values(config.colorPalette).map((color: any, i) => (
                                <div key={i} title={color} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-black/30 rounded-lg border border-white/5">
                              <span className="text-[8px] text-obsidian-muted uppercase block">Tipografía</span>
                              <span className="text-[10px] text-white font-medium">{config.fontFamily || 'Outfit'}</span>
                            </div>
                            <div className="p-2 bg-black/30 rounded-lg border border-white/5">
                              <span className="text-[8px] text-obsidian-muted uppercase block">Estilo</span>
                              <span className="text-[10px] text-white font-medium capitalize">{config.animationStyle || 'cinematic'}</span>
                            </div>
                          </div>

                          {event.status === 'pending' && (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => onApprove?.(event.id, "LUMEN_VIDEO_RENDER", content)}
                                className="flex-1 py-2 bg-obsidian-primary text-obsidian-bg text-xs font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                              >
                                <Play className="w-3 h-3" />
                                Renderizar Video IA
                              </button>
                              <button 
                                onClick={() => onReject?.(event.id)}
                                className="px-3 py-2 bg-white/5 text-white text-xs font-bold rounded-lg border border-white/10"
                              >
                                Ignorar
                              </button>
                            </div>
                          )}

                          {event.status === 'rendering' && (
                            <div className="space-y-2 py-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-obsidian-primary font-bold animate-pulse uppercase">Renderizando Motor Remotion...</span>
                                <Loader2 className="w-3 h-3 text-obsidian-primary animate-spin" />
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-obsidian-primary h-full animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }} />
                              </div>
                            </div>
                          )}

                          {event.status === 'completed' && content.videoUrl && (
                             <a 
                               href={content.videoUrl} 
                               target="_blank" 
                               rel="noreferrer"
                               className="w-full py-2 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold rounded-lg block text-center hover:bg-emerald-500/30 transition-all font-bold"
                             >
                               Descargar Video MP4
                             </a>
                          )}
                        </>
                      );
                    } catch (e) { return null; }
                  })()}
                </div>
              )}
            </div>

            {event.status === 'pending' && !['Lira', 'Atlas', 'Lumen'].includes(event.agentName || '') && (
              <div className="mt-4 flex items-center gap-3">
                <button 
                   onClick={() => onApprove?.(event.id, 'GENERIC_APPROVE', event.text)}
                   className="px-4 py-2 bg-obsidian-primary text-obsidian-bg text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Aprobar y Enviar
                </button>
                <button 
                   onClick={() => onReject?.(event.id)}
                   className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Ignorar
                </button>
              </div>
            )}
            
            {(event.status === 'completed' || event.status === 'ignored') && (
              <div className={cn(
                "mt-3 pt-3 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                event.status === 'completed' ? "text-emerald-500" : "text-obsidian-muted"
              )}>
                {event.status === 'completed' ? (
                  <><CheckCircle2 className="w-3 h-3" /> Acción Ejecutada</>
                ) : (
                  "Sugerencia Descartada"
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
