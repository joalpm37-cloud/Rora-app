import React from 'react';
import { Search, Video, Send, X, Check } from 'lucide-react';

interface AgentActionCardProps {
  type: 'atlas' | 'lumen';
  data: any;
  onApprove: () => void;
  onReject: () => void;
}

export const AgentActionCard: React.FC<AgentActionCardProps> = ({ type, data, onApprove, onReject }) => {
  const isAtlas = type === 'atlas';
  
  return (
    <div className="bg-obsidian-card border border-obsidian-border rounded-2xl overflow-hidden shadow-lg group">
      <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAtlas ? <Search className="w-4 h-4 text-teal-400" /> : <Video className="w-4 h-4 text-blue-400" />}
          <span className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">
            {isAtlas ? 'Atlas — Sugerencia de Propiedad' : 'Lumen — Propuesta de Video'}
          </span>
        </div>
        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[9px] font-bold rounded uppercase">
          Pendiente
        </span>
      </div>
      
      <div className="p-4">
        {isAtlas ? (
          <div className="flex gap-4">
            {data.url_imagen && (
              <img src={data.url_imagen} alt={data.nombre} className="w-20 h-20 object-cover rounded-lg border border-obsidian-border" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{data.nombre}</h4>
              <p className="text-xs text-obsidian-muted mt-1 truncate">{data.ubicacion}</p>
              <p className="text-sm font-bold text-teal-400 mt-2">€{data.precio}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Guion Generado: {data.titulo}</h4>
            <div className="bg-obsidian-bg p-3 rounded-lg border border-obsidian-border">
               <p className="text-[11px] text-obsidian-muted line-clamp-3 italic">"{data.guion_short}"</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={onApprove}
            className="flex-1 py-2.5 bg-emerald-500 text-obsidian-bg text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            Aprobar y Enviar
          </button>
          <button 
            onClick={onReject}
            className="px-3 py-2.5 bg-white/5 text-obsidian-muted rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
