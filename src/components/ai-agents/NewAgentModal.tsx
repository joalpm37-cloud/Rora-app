import React, { useState } from 'react';
import { X, Bot, CheckCircle2 } from 'lucide-react';
import { MakeIntegration } from '../../services/makeIntegration';

interface NewAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: any) => void;
}

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose, onAddAgent }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('CRM Agent');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const newAgent = {
      name,
      description,
      status: 'Activo',
      icon: role === 'CRM Agent' ? 'MessageSquare' : role === 'Content Agent' ? 'PenTool' : 'Bot',
      performance: 100,
      tasks: 0,
      lastActive: 'Justo ahora',
      role
    };

    onAddAgent(newAgent);
    MakeIntegration.sync('AI_AGENT_AUTOMATION', newAgent);
    
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-obsidian-bg border border-obsidian-border rounded-2xl shadow-2xl p-6 glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-obsidian-primary/10 flex items-center justify-center text-obsidian-primary">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nuevo Agente IA</h2>
              <p className="text-xs text-obsidian-muted">Instancia un nuevo modelo inteligente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Nombre del Agente</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Legal Advisor Bot"
              className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Rol Base</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg appearance-none"
            >
              <option value="CRM Agent">Asistente de Ventas (CRM)</option>
              <option value="Content Agent">Creador de Contenido</option>
              <option value="Explorer Agent">Analista de Mercado</option>
              <option value="Custom Bot">Personalizado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Descripción y Directrices</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las tareas específicas que este agente debe realizar..."
              className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors min-h-[100px] resize-none focus:bg-obsidian-bg"
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-obsidian-muted text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Modelo GPT-4 Turbo asignado</span>
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Crear e Instanciar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
