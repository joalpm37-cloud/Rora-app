import React, { useState, useEffect } from 'react';
import { X, Calendar, ExternalLink, Settings, Edit2, FileText, Bell, MapPin, Target } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lead } from '../../types';
import { BantAnalysis } from './BantAnalysis';
import { ActivityTimeline } from './ActivityTimeline';
import { AgentActionCard } from './AgentActionCard';
import { DossierModal } from './DossierModal';
import { sendGhlMessage } from '../../lib/api-client';
import { updateDoc, arrayUnion } from 'firebase/firestore';

interface LeadProfileProps {
  lead: Lead;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadProfile: React.FC<LeadProfileProps> = ({ lead, onClose, onEdit }) => {
  const [salesData, setSalesData] = useState<any>(null);
  const [showDossier, setShowDossier] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!lead?.id) return;
    
    // Listener 1: Conversaciones y Eventos
    const convRef = doc(db, 'sales-conversations', lead.id);
    const unsubConv = onSnapshot(convRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSalesData(data);
        
        const msgEvents = (data.conversacion || []).map((m: any, i: number) => ({
          id: `msg-${i}`,
          type: 'message',
          sender: m.sender || (m.role === 'agente' ? 'agent' : 'lead'),
          agentName: m.agentName,
          text: m.text || m.content,
          data: m.data,
          timestamp: m.timestamp?.toDate ? m.timestamp.toDate() : new Date(),
          status: m.status || (m.sender === 'agent' && m.status === 'pending' ? 'pending' : 'completed')
        }));

        const systemEvents = [];
        if (data.clasificacion === 'calificado') {
          systemEvents.push({
            id: 'alert-qualified',
            type: 'system',
            sender: 'system',
            text: '¡Lira ha calificado a este lead! Oportunidad detectada.',
            timestamp: data.ultimaActualizacion?.toDate ? data.ultimaActualizacion.toDate() : new Date(),
            status: 'alert'
          });
        }

        setEvents([...msgEvents, ...systemEvents].sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    return () => {
      unsubConv();
      unsubLead();
    };
  }, [lead.id]);

  const handleApproveTimeline = async (eventId: string, textOrData: string) => {
    if (!lead?.id) return;
    try {
      const index = parseInt(eventId.split('-')[1]);
      const event = salesData.conversacion[index];

      // Caso especial: Agendamiento con Lira (Citas)
      if (event.agentName === 'Lira' && event.data) {
        const slot = JSON.parse(textOrData);
        // Llamar al servidor para agendar
        await fetch('/api/agents/scheduler/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: lead.assignedTo,
            leadId: lead.id,
            appointment: slot,
            leadEmail: lead.email || 'joalpm37@gmail.com'
          })
        });
        console.log("✅ Cita agendada via Lira");
      } 
      // Caso especial: Publicación de Lumen (vía Aura)
      else if (event.agentName === 'Lumen' && textOrData === 'LUMEN_APPROVAL') {
        // Simular envío a Meta vía Aura
        await addDoc(collection(db, 'logs-agentes'), {
          agente: "Aura",
          tipo: "completado",
          mensaje: `Publicando anuncio en Meta Ads para ${lead.nombre || 'Lead'}. Contenido aprobado de Lumen.`,
          timestamp: serverTimestamp()
        });
        console.log("🚀 Contenido enviado a Meta Ads vía Aura");
      }
      // Caso especial: Renderizado de Video Remotion
      else if (event.agentName === 'Lumen' && textOrData === 'LUMEN_VIDEO_RENDER') {
        const content = arguments[2]; // Los nuevos datos pasados por ActivityTimeline
        
        // 1. Marcar como renderizando en Firebase
        const convRef = doc(db, 'sales-conversations', lead.id);
        const renderingConv = [...salesData.conversacion];
        renderingConv[index] = { ...renderingConv[index], status: 'rendering' };
        await updateDoc(convRef, { conversacion: renderingConv });

        try {
          // 2. Llamar al servidor para renderizar
          const response = await fetch('/api/video/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              propiedadId: lead.id, // o el ID de la propiedad real si se tiene
              videoConfig: content.videoConfig
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            // 3. Completado con URL
            const finalConv = [...salesData.conversacion];
            finalConv[index] = { 
              ...finalConv[index], 
              status: 'completed',
              data: JSON.stringify({ ...content, videoUrl: result.url })
            };
            await updateDoc(convRef, { conversacion: finalConv });
            return;
          }
        } catch (err) {
          console.error("Error rendering video:", err);
          // Revertir a pending si falla
          const failConv = [...salesData.conversacion];
          failConv[index] = { ...failConv[index], status: 'pending' };
          await updateDoc(convRef, { conversacion: failConv });
          return;
        }
      }
      else {
        // Enviar mensaje normal a GHL
        await sendGhlMessage(lead.id, textOrData);
      }
      
      // Actualizar estado en Firebase a 'completed'
      const convRef = doc(db, 'sales-conversations', lead.id);
      const newConv = [...salesData.conversacion];
      newConv[index] = { ...newConv[index], status: 'completed' };
      await updateDoc(convRef, { conversacion: newConv });
      
    } catch (err) {
      console.error("Error approving event:", err);
    }
  };

  const handleRejectTimeline = async (eventId: string) => {
    if (!lead?.id) return;
    try {
      const convRef = doc(db, 'sales-conversations', lead.id);
      const index = parseInt(eventId.split('-')[1]);
      const newConv = [...salesData.conversacion];
      newConv[index] = { ...newConv[index], status: 'ignored' };
      await updateDoc(convRef, { conversacion: newConv });
    } catch (err) {
      console.error("Error rejecting event:", err);
    }
  };

  const handleApproveAtlas = async (propData: any) => {
    if (!lead?.id) return;
    try {
      const message = `¡Hola! Atlas ha encontrado una propiedad que encaja perfectamente con tus requisitos: ${propData.nombre} en ${propData.ubicacion} por €${propData.precio}. ¿Te gustaría ver más detalles?`;
      
      // 1. Enviar a GHL
      await sendGhlMessage(lead.id, message);
      
      // 2. Registrar en Firebase (Activity Feed)
      const docRef = doc(db, 'sales-conversations', lead.id);
      await updateDoc(docRef, {
        conversacion: arrayUnion({
          sender: 'agent',
          text: `[Atlas Approved] ${message}`,
          timestamp: new Date()
        }),
        ultimaActualizacion: new Date()
      });

      console.log("✅ Propiedad de Atlas aprobada y enviada.");
    } catch (err) {
      console.error("❌ Error aprobando Atlas:", err);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-[600px] bg-obsidian-bg border-l border-obsidian-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header Premium con Alertas de Calificación */}
      <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5 relative overflow-hidden shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-obsidian-primary/40 to-blue-500/40 border border-white/10 flex items-center justify-center text-2xl font-bold uppercase shadow-inner">
              {lead.name.substring(0, 2)}
            </div>
            {lead.status === 'Calificado' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-obsidian-bg animate-pulse shadow-lg shadow-emerald-500/50" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{lead.name}</h2>
              {lead.status === 'Calificado' && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[9px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5" />
                  Calificado
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-obsidian-muted">
              <span className="text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-obsidian-primary" />
                {lead.zone || 'Zona por definir'}
              </span>
              <span className="w-1.5 h-1.5 bg-obsidian-border rounded-full" />
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-500/80">
                Score: {lead.score}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(lead)} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-obsidian-muted hover:text-white border border-white/5">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-obsidian-muted hover:text-white border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
        
        {/* Sección: Análisis BANT (Lira Cognitive Card) */}
        <BantAnalysis bant={salesData?.bant} />

        {/* Sección: Acciones Pendientes de Agentes (Shadow Sync Validation) */}
        {salesData?.bant && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-obsidian-muted flex items-center justify-between">
              Acciones de Agentes Sugeridas
              <span className="text-[10px] bg-obsidian-primary/10 text-obsidian-primary px-2 py-0.5 rounded border border-obsidian-primary/20">Validación Requerida</span>
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <AgentActionCard 
                type="atlas"
                data={{
                  nombre: "Villa Lujo Marbella",
                  ubicacion: "Sierra Blanca, Marbella",
                  precio: "3.500.000",
                  url_imagen: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400"
                }}
                onApprove={() => handleApproveAtlas({
                  nombre: "Villa Lujo Marbella",
                  ubicacion: "Sierra Blanca, Marbella",
                  precio: "3.500.000"
                })}
                onReject={() => console.log("Atlas rejected")}
              />
            </div>
          </div>
        )}

        {/* Sección: Historial de Actividad (Monitor Feed) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-obsidian-muted flex items-center justify-between">
            Historial de Actividad
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-obsidian-muted">Sincronizado GHL</span>
            </div>
          </h4>
          <ActivityTimeline 
            events={events} 
            onApprove={handleApproveTimeline}
            onReject={handleRejectTimeline}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-obsidian-border bg-obsidian-card/80 backdrop-blur-md shrink-0 flex gap-3">
        <button 
          onClick={() => setShowDossier(true)}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generar Dossier
        </button>
        <button 
          onClick={() => window.open(`https://app.gohighlevel.com/contacts/detail/${lead.id}`, '_blank')}
          className="flex-1 py-3 bg-obsidian-primary text-obsidian-bg font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-obsidian-primary/20"
        >
          <ExternalLink className="w-4 h-4" />
          Gestionar GHL
        </button>
      </div>

      {showDossier && <DossierModal lead={lead} onClose={() => setShowDossier(false)} />}
    </div>
  );
};
