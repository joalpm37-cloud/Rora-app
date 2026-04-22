import React from 'react';
import { X, Phone, Mail, MessageSquare, MapPin, Euro, Calendar, BrainCircuit, Edit2 } from 'lucide-react';
import { Lead } from '../../types';

interface LeadProfileProps {
  lead: Lead;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadProfile: React.FC<LeadProfileProps> = ({ lead, onClose, onEdit }) => {
  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-[480px] bg-obsidian-bg border-l border-obsidian-border shadow-2xl flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5">
        <h2 className="text-xl font-bold">Perfil del Lead</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(lead)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Header Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-obsidian-primary/20 flex items-center justify-center text-obsidian-primary text-2xl font-bold uppercase">
            {lead.name.substring(0, 2)}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{lead.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-obsidian-muted text-sm">
              <span className="capitalize">{lead.type}</span>
              <span>•</span>
              <span className="capitalize">{lead.status.replace('_', ' ')}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium">
                <Phone className="w-4 h-4" /> Llamar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium">
                <MessageSquare className="w-4 h-4" /> Chat
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-card p-5 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-muted">Información de Contacto</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-obsidian-muted" />
              <span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-obsidian-muted" />
                <span>{lead.email}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-obsidian-muted" />
              <span>{lead.zone || 'Zona no especificada'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Euro className="w-4 h-4 text-obsidian-muted" />
              <span>{lead.budget ? `${lead.budget.toLocaleString()} €` : 'Presupuesto no especificado'}</span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="glass-card p-5 space-y-4 border-obsidian-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-obsidian-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-primary flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Análisis de IA
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-obsidian-muted">Score</span>
              <span className="text-lg font-bold text-obsidian-primary">{lead.score}/100</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {lead.aiAnalysis || 'La IA está analizando este lead...'}
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-muted">Notas</h4>
          <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-300 min-h-[100px]">
            {lead.notes || 'No hay notas adicionales.'}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-obsidian-muted pt-4 border-t border-obsidian-border">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Creado: {lead.createdAt instanceof Date ? lead.createdAt.toLocaleDateString() : lead.createdAt?.toDate().toLocaleDateString()}</span>
          </div>
          <span className="capitalize">Origen: {lead.source.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};
