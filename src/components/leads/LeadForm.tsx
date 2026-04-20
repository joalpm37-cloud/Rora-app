import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { collections } from '../../lib/collections';
import { Lead, LeadStatus, LeadType, LeadSource } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';
import { MakeIntegration, sendEventToMake } from '../../services/makeIntegration';
import { getApiUrl } from '../../lib/api-client';

import { CheckCircle2 } from 'lucide-react';

interface LeadFormProps {
  lead?: Lead | null;
  onClose: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ lead, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    type: lead?.type || 'buyer' as LeadType,
    status: lead?.status || 'new' as LeadStatus,
    source: lead?.source || 'organic' as LeadSource,
    zone: lead?.zone || '',
    budget: lead?.budget || 0,
    notes: lead?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      if (lead) {
        // Update
        const leadRef = doc(collections.leads, lead.id);
        await updateDoc(leadRef, {
          ...formData,
          updatedAt: Timestamp.now(),
        });
        // Sync with Make
        MakeIntegration.sync('UPDATE_LEAD', { id: lead.id, ...formData });

        // Evento específico para Make.com solicitado
        await sendEventToMake({
          type: "lead.updated",
          payload: {
            leadId: lead.id,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            status: formData.status,
            type: formData.type,
            notes: formData.notes
          }
        });
      } else {
        // Create
        let ghlId = null;
        try {
          // Paso 1 & 2: Buscar y crear en GHL vía proxy
          const response = await fetch(getApiUrl('/api/ghl/contacts/create'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre: formData.name,
              email: formData.email,
              telefono: formData.phone
            })
          });
          
          const ghlRes = await response.json();
          if (ghlRes && ghlRes.contacto && ghlRes.contacto.id) {
            ghlId = ghlRes.contacto.id;
          }
        } catch (ghlErr) {
          console.error("Error syncing with GHL:", ghlErr);
        }

        const newLead = {
          ...formData,
          ghl_id: ghlId,
          agencyId: user.agencyId || 'default-agency', 
          assignedTo: user.uid,
          score: Math.floor(Math.random() * 100), 
          aiAnalysis: 'Análisis pendiente...',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collections.leads, newLead);
        
        // Sync with n8n
        try {
          await fetch("https://rora.app.n8n.cloud/webhook-test/create-lead", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              leadId: docRef.id,
              ghlId: ghlId,
              ...newLead
            })
          });
        } catch (webhookErr) {
          console.error("Error sending to n8n:", webhookErr);
        }
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, lead ? OperationType.UPDATE : OperationType.CREATE, 'leads');
      alert('Error al guardar el lead. Revisa los permisos de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <h2 className="text-xl font-bold">{lead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Nombre Completo *</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Teléfono *</label>
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Tipo</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as LeadType})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
              >
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
                <option value="renter">Inquilino</option>
                <option value="investor">Inversor</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Estado</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
              >
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="visit_scheduled">Visita Programada</option>
                <option value="closed">Cerrado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Origen</label>
              <select 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value as LeadSource})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary appearance-none"
              >
                <option value="organic">Orgánico</option>
                <option value="meta_ads">Meta Ads</option>
                <option value="referral">Referido</option>
                <option value="portal">Portal Inmobiliario</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Zona de Interés</label>
              <input 
                type="text" 
                value={formData.zone}
                onChange={e => setFormData({...formData, zone: e.target.value})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-obsidian-muted">Presupuesto (€)</label>
              <input 
                type="number" 
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-obsidian-muted">Notas Adicionales</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 outline-none focus:border-obsidian-primary resize-none"
            />
          </div>
        </form>
        
        <div className="p-6 border-t border-obsidian-border flex justify-end gap-3 bg-white/5">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};
