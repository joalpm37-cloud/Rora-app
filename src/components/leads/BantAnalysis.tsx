import React from 'react';
import { Target, Wallet, Clock, UserCheck, Settings } from 'lucide-react';

interface BantAnalysisProps {
  bant: {
    necesidad?: string;
    zona?: string;
    presupuesto?: string;
    tiempo?: string;
    requisitos?: string;
  } | null;
}

export const BantAnalysis: React.FC<BantAnalysisProps> = ({ bant }) => {
  if (!bant) {
    return (
      <div className="bg-obsidian-card border border-obsidian-border rounded-2xl p-6 text-center">
        <Target className="w-10 h-10 text-obsidian-muted mx-auto mb-3 opacity-20" />
        <p className="text-sm text-obsidian-muted">Lira aún no ha recopilado suficientes datos BANT de esta conversación.</p>
      </div>
    );
  }

  const items = [
    { label: 'Necesidad', value: bant.necesidad, icon: Target, color: 'text-blue-400' },
    { label: 'Presupuesto', value: bant.presupuesto, icon: Wallet, color: 'text-emerald-400' },
    { label: 'Tiempo', value: bant.tiempo, icon: Clock, color: 'text-orange-400' },
    { label: 'Zona/Zona', value: bant.zona, icon: Target, color: 'text-purple-400' },
    { label: 'Requisitos Técnicos', value: bant.requisitos, icon: Settings, color: 'text-teal-400', fullWidth: true },
  ];

  return (
    <div className="bg-obsidian-card border border-obsidian-border rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-obsidian-border bg-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-obsidian-primary flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Perfil de Calificación BANT
        </h3>
      </div>
      <div className="p-6 grid grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={idx} className={cn(
            "space-y-1.5",
            item.fullWidth ? "col-span-2 pt-4 border-t border-obsidian-border/50" : ""
          )}>
            <div className="flex items-center gap-2">
              <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              <label className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">{item.label}</label>
            </div>
            <p className={cn(
              "text-sm font-medium",
              item.value ? "text-white" : "text-obsidian-muted italic"
            )}>
              {item.value || 'Pendiente de identificar'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
