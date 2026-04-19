import React, { useState } from 'react';
import { X, Megaphone, Target } from 'lucide-react';
import { addDoc, Timestamp } from 'firebase/firestore';
import { collections } from '../../lib/collections';
import { useAuth } from '../../contexts/AuthContext';
import { CampaignPlatform, CampaignStatus } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';
import { sendEventToMake } from '../../services/makeIntegration';

interface NewCampaignModalProps {
  onClose: () => void;
}

const getApiUrl = (path: string) => {
  const base = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://rora-app.onrender.com';
  return `${base}${path}`;
};

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram' as CampaignPlatform,
    status: 'Borrador' as CampaignStatus,
    budget: 0,
    duration: 30,
    property: ''
  });
  
  const generateStrategy = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/agents/performance/campaign/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombrePropiedad: formData.property || formData.name,
          presupuestoDiario: formData.budget,
          duracionDias: formData.duration,
          objetivo: 'leads'
        })
      });

      if (!response.ok) throw new Error('Error al generar estrategia');
      const result = await response.json();
      setStrategy(result);
      setStep(4);
    } catch (error) {
      console.error("Error generating strategy:", error);
      alert("Error al generar la estrategia. Intentando de nuevo...");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.agencyId) return;

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collections.campaigns, {
        agencyId: user.agencyId,
        name: formData.name,
        property: formData.property,
        platform: formData.platform,
        status: 'Lista para lanzar' as CampaignStatus,
        budget: Number(formData.budget),
        duration: formData.duration,
        strategy: strategy,
        spent: 0,
        leads: 0,
        cpl: 0,
        ctr: 0,
        trend: 'up',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      await sendEventToMake({
        type: "campaign.created",
        payload: {
          campaignId: docRef.id,
          agencyId: user.agencyId,
          name: formData.name,
          platform: formData.platform,
          strategy: strategy,
          createdAt: new Date().toISOString()
        }
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
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nueva Campaña</h2>
              <p className="text-xs text-obsidian-muted">Paso {step} de 4: {step === 4 ? 'Estrategia de IA' : 'Configuración'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Propiedad</label>
                <input 
                  type="text" 
                  value={formData.property}
                  onChange={(e) => setFormData({...formData, property: e.target.value})}
                  placeholder="Ej. Villa Marítima Marbella" 
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Nombre de la campaña</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej. Lanzamiento Exclusivo Marzo" 
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                />
              </div>
              <button 
                onClick={() => setStep(2)} 
                disabled={!formData.name}
                className="w-full py-3 bg-obsidian-primary text-obsidian-bg rounded-xl font-bold disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold">Atrás</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl font-bold">Siguiente</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Presupuesto Diario (€)</label>
                  <input 
                    type="number" 
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                    className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Duración (Días)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold">Atrás</button>
                <button 
                  onClick={generateStrategy} 
                  disabled={isSubmitting || formData.budget <= 0}
                  className="flex-[2] py-4 bg-obsidian-primary text-obsidian-bg rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Consultando al Performance Agent...' : 'Generar Estrategia con IA'}
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && strategy && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Estrategia RORA Performance</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full font-bold uppercase">IA Validada</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {strategy.ad_sets?.map((adset: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <p className="text-[10px] text-obsidian-muted font-bold uppercase">{adset.tipo_audiencia}</p>
                    <p className="text-xs font-bold truncate">{adset.nombre}</p>
                    <p className="text-lg font-bold mt-1 text-obsidian-primary">{adset.presupuesto_porcentaje}%</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                  <p className="text-[10px] text-obsidian-muted font-bold uppercase mb-1">CPL Máximo Objetivo</p>
                  <p className="text-xl font-bold text-emerald-500">€{strategy.kpis_objetivo?.cpl_maximo}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                  <p className="text-[10px] text-obsidian-muted font-bold uppercase mb-1">Leads Estimados</p>
                  <p className="text-xl font-bold text-emerald-500">{strategy.kpis_objetivo?.leads_estimados}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-obsidian-muted font-bold uppercase">Reglas de Optimización</p>
                <div className="space-y-1">
                  {strategy.reglas_optimizacion?.map((regla: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-obsidian-muted">
                      <div className="w-1 h-1 bg-obsidian-primary rounded-full" />
                      {regla}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setStep(3)} 
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold"
                >
                  Ajustar
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-emerald-500 text-obsidian-bg rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Guardando...' : 'Aprobar Estrategia y Lanzar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
