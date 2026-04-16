import React, { useState } from 'react';
import { Zap, Bot, BrainCircuit, SlidersHorizontal, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AISettings: React.FC = () => {
  const [creativity, setCreativity] = useState(0.7);
  const [autoResponse, setAutoResponse] = useState(true);
  const [learningMode, setLearningMode] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-obsidian-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 relative z-10">
          <Zap className="w-5 h-5 text-obsidian-primary" />
          Configuración Global de Inteligencia Artificial
        </h3>
        <p className="text-obsidian-muted text-sm mb-8 relative z-10">
          Ajusta los parámetros globales de los modelos LLM que operan dentro de tu plataforma.
        </p>

        <div className="space-y-8 relative z-10">
          {/* Creativity Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-obsidian-primary" />
                  Nivel de Creatividad (Temperatura)
                </h4>
                <p className="text-xs text-obsidian-muted mt-1">Valores bajos generan respuestas más precisas y directas. Valores altos son mejores para generación de contenido.</p>
              </div>
              <span className="font-mono text-obsidian-primary font-bold">{creativity.toFixed(2)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="2" 
              step="0.1" 
              value={creativity}
              onChange={(e) => setCreativity(parseFloat(e.target.value))}
              className="w-full accent-obsidian-primary h-2 bg-obsidian-bg rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-obsidian-muted font-bold uppercase tracking-widest">
              <span>Analítico (0.0)</span>
              <span>Creativo (2.0)</span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Toggles */}
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-obsidian-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Respuesta Automática de Emergencia</h4>
                  <p className="text-xs text-obsidian-muted mt-1">Permitir a la IA responder leads calientes ("Hot Leads") inmediatamente fuera del horario laboral.</p>
                </div>
              </div>
              <button 
                onClick={() => setAutoResponse(!autoResponse)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  autoResponse ? "bg-obsidian-primary" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                  autoResponse ? "left-[26px]" : "left-[2px]"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-obsidian-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Modo de Aprendizaje Continuo</h4>
                  <p className="text-xs text-obsidian-muted mt-1">Los agentes analizarán las interacciones exitosas del equipo humano para adaptar su tono de voz.</p>
                </div>
              </div>
              <button 
                onClick={() => setLearningMode(!learningMode)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative shrink-0",
                  learningMode ? "bg-obsidian-primary" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                  learningMode ? "left-[26px]" : "left-[2px]"
                )} />
              </button>
            </div>
          </div>

          <div className="pt-6">
            <button className="px-6 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
              Guardar Configuración AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
