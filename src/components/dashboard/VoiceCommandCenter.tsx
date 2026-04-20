import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  PhoneOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveAPI, TaskData } from '../../lib/voice/useLiveAPI';
import { cn } from '../../lib/utils';

export const VoiceCommandCenter: React.FC = () => {
  const [task, setTask] = useState<TaskData | null>(null);
  const { connect, disconnect, isConnected, isSpeaking } = useLiveAPI((data) => {
    setTask(data);
  });

  // Escuchar eventos globales de tareas gestionadas (por si acaso)
  useEffect(() => {
    const handleTask = (e: any) => {
      setTask(e.detail);
    };
    window.addEventListener('tarea_managed', handleTask);
    return () => window.removeEventListener('tarea_managed', handleTask);
  }, []);

  return (
    <>
      {/* Voice Orb Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        
        {/* Connection Tooltip */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-white/20 mb-2 pointer-events-none"
            >
              <span className="text-slate-900 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                ¿Necesitas algo? Habla con RORA
              </span>
              <div className="absolute -bottom-1 right-8 w-3 h-3 bg-white rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {/* Pulsing Aura when connected */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: isSpeaking ? [1, 1.4, 1] : [1, 1.1, 1],
                  opacity: isSpeaking ? [0.6, 0.2, 0.6] : [0.3, 0.1, 0.3]
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: isSpeaking ? 1 : 2, repeat: Infinity }}
                className="absolute inset-0 bg-rora-green rounded-full blur-xl"
              />
            )}
          </AnimatePresence>

          <button
            onClick={isConnected ? disconnect : connect}
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 group",
              isConnected 
                ? "bg-rora-green text-white shadow-rora-green/40 ring-4 ring-rora-green/20" 
                : "bg-obsidian-surface border border-white/10 text-obsidian-muted hover:text-white hover:border-rora-green/50"
            )}
          >
            {isConnected ? (
              <PhoneOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
            
            {/* Listening Indicator */}
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-obsidian-bg rounded-full animate-bounce" />
            )}
          </button>
        </div>
      </div>

      {/* Task Notification Overlay */}
      <AnimatePresence>
        {task && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-full max-w-sm bg-obsidian-surface/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl z-[110] overflow-hidden"
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 pointer-events-none",
              task.estado === 'Aprobada' ? 'bg-rora-green' : 'bg-red-500'
            )} />

            <div className="flex items-start gap-4 mb-5 relative">
              <div className={cn(
                "p-3 rounded-2xl shrink-0 shadow-lg",
                task.estado === 'Aprobada' ? "bg-rora-green/20 text-rora-green" :
                task.estado === 'Denegada' ? "bg-red-500/20 text-red-400" :
                "bg-amber-500/20 text-amber-400"
              )}>
                {task.estado === 'Aprobada' && <CheckCircle className="w-6 h-6" />}
                {task.estado === 'Denegada' && <XCircle className="w-6 h-6" />}
                {task.estado !== 'Aprobada' && task.estado !== 'Denegada' && <AlertCircle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">Tarea {task.estado}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-obsidian-muted uppercase tracking-widest font-bold">
                    Agente: {task.agente}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setTask(null)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 relative">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="block text-[9px] uppercase tracking-widest text-obsidian-muted mb-2 font-bold">Misión Ejecutada</span>
                <p className="text-sm text-white/90 leading-relaxed italic">"{task.tarea}"</p>
              </div>

              {task.comentarios && (
                <div className="bg-rora-green/5 border border-rora-green/10 rounded-2xl p-4 flex gap-3">
                  <FileText className="w-4 h-4 text-rora-green shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[9px] uppercase tracking-widest text-rora-green/70 mb-1 font-bold">Instrucciones Adicionales</span>
                    <p className="text-xs text-rora-green/90 leading-tight">{task.comentarios}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
