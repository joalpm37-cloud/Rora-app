import React, { useState } from 'react';
import { X, Bot, Activity, Layers, MessageSquare, BarChart3, PenTool, Globe } from 'lucide-react';
import { addDoc, Timestamp } from 'firebase/firestore';
import { collections } from '../../lib/collections';
import { useAuth } from '../../contexts/AuthContext';
import { AgentType, AgentStatus } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';

interface NewAIAgentModalProps {
  onClose: () => void;
}

export const NewAIAgentModal: React.FC<NewAIAgentModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'crm' as AgentType,
    iconType: 'MessageSquare',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.agencyId) return;

    setIsSubmitting(true);
    try {
      await addDoc(collections.aiAgents, {
        agencyId: user.agencyId,
        name: formData.name,
        type: formData.type,
        description: formData.description,
        status: 'Inactivo' as AgentStatus,
        performance: 0,
        tasks: 0,
        iconType: formData.iconType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'ai_agents');
      alert('Error al crear el agente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconForType = (type: AgentType) => {
    switch(type) {
      case 'crm': return 'MessageSquare';
      case 'performance': return 'BarChart3';
      case 'content': return 'PenTool';
      case 'scout': return 'Globe';
      default: return 'Bot';
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as AgentType;
    setFormData({
      ...formData,
      type: newType,
      iconType: getIconForType(newType)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nuevo Agente IA</h2>
              <p className="text-xs text-obsidian-muted">Configura un nuevo agente inteligente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Nombre del Agente</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Lead Qualifier Agent" 
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Rol / Tipo</label>
              <select 
                value={formData.type}
                onChange={handleTypeChange}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
              >
                <option value="crm">CRM / Ventas (Seguimiento)</option>
                <option value="performance">Performance / Marketing</option>
                <option value="content">Content Creator</option>
                <option value="scout">Market Scout / Explorer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Descripción</label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe la función principal de este agente..." 
                rows={3}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Agente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
