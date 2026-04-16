import React from 'react';
import { CheckCircle2, AlertCircle, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AIStrategyProps {
  onApplySuggestion?: () => void;
  onGenerateAI?: () => void;
}

export const AIStrategy: React.FC<AIStrategyProps> = ({ onApplySuggestion, onGenerateAI }) => {
  const [isApplied, setIsApplied] = React.useState(false);

  const handleApply = () => {
    setIsApplied(true);
    if (onApplySuggestion) onApplySuggestion();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-6">AI Content Strategy</h3>
        <div className="space-y-4">
          <div className="p-4 bg-obsidian-primary/5 border border-obsidian-primary/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-obsidian-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Recomendación AI</span>
            </div>
            <p className="text-sm leading-relaxed">
              "El engagement con videos de drones ha subido un 40%. Te sugiero programar un Reel adicional de Villa Marítima para este viernes a las 19:00."
            </p>
            <button 
              onClick={handleApply}
              disabled={isApplied}
              className={cn(
                "w-full py-2 text-xs font-bold rounded-xl transition-colors",
                isApplied 
                   ? "bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20" 
                   : "bg-obsidian-primary text-obsidian-bg hover:opacity-90"
              )}
            >
              {isApplied ? 'Sugerencia aplicada ✓' : 'Aplicar sugerencia'}
            </button>
          </div>

          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Alerta de Contenido</span>
            </div>
            <p className="text-sm leading-relaxed text-obsidian-muted">
              "Faltan imágenes de alta resolución para el artículo de LinkedIn de mañana. ¿Quieres que las genere con IA?"
            </p>
            <button 
              onClick={onGenerateAI}
              className="w-full py-2 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Generar con IA
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-6">Canales Conectados</h3>
        <div className="space-y-4">
          {[
            { name: 'Instagram Business', icon: Instagram, status: 'Conectado' },
            { name: 'Facebook Page', icon: Facebook, status: 'Conectado' },
            { name: 'LinkedIn Company', icon: Linkedin, status: 'Conectado' },
            { name: 'Twitter / X', icon: Twitter, status: 'Desconectado' },
          ].map((channel) => (
            <div key={channel.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <channel.icon className="w-4 h-4 text-obsidian-muted" />
                <span className="text-sm font-medium">{channel.name}</span>
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                channel.status === 'Conectado' ? "text-emerald-500" : "text-obsidian-muted"
              )}>
                {channel.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
