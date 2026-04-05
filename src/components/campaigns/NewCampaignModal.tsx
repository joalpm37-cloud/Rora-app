import React, { useState } from 'react';
import { X, Megaphone, DollarSign, Target } from 'lucide-react';
import { addDoc, Timestamp } from 'firebase/firestore';
import { collections } from '../../lib/collections';
import { useAuth } from '../../contexts/AuthContext';
import { CampaignPlatform, CampaignStatus } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';

interface NewCampaignModalProps {
  onClose: () => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram' as CampaignPlatform,
    status: 'Borrador' as CampaignStatus,
    budget: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.agencyId) return;

    setIsSubmitting(true);
    try {
      await addDoc(collections.campaigns, {
        agencyId: user.agencyId,
        name: formData.name,
        platform: formData.platform,
        status: formData.status,
        budget: Number(formData.budget),
        spent: 0,
        leads: 0,
        cpl: 0,
        ctr: 0,
        trend: 'up',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaigns');
      alert('Error al crear la campaña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nueva Campaña</h2>
              <p className="text-xs text-obsidian-muted">Configura una nueva campaña publicitaria</p>
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
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Nombre de la campaña</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Marbella Luxury 2026" 
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Plataforma</label>
                <select 
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value as CampaignPlatform})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Estado</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as CampaignStatus})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Activa">Activa</option>
                  <option value="Pausada">Pausada</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Presupuesto (€)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                  placeholder="0.00" 
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                />
              </div>
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
              {isSubmitting ? 'Creando...' : 'Crear Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
