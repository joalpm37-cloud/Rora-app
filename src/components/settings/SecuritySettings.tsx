import React from 'react';
import { Lock, Shield, ChevronRight } from 'lucide-react';

export const SecuritySettings: React.FC = () => {
  return (
    <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-xl font-bold mb-6">Seguridad Avanzada</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-obsidian-primary/30 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Autenticación de dos factores (2FA)</h4>
              <p className="text-xs text-obsidian-muted mt-0.5">Añade una capa extra de seguridad a tu cuenta.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Activado</span>
            <ChevronRight className="w-4 h-4 text-obsidian-muted group-hover:text-obsidian-primary transition-colors" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-obsidian-primary/30 transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Registro de Actividad</h4>
              <p className="text-xs text-obsidian-muted mt-0.5">Revisa quién y cuándo ha accedido al sistema.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ChevronRight className="w-4 h-4 text-obsidian-muted group-hover:text-obsidian-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
