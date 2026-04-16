import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, ExternalLink, Settings, Edit2, FileText } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Lead } from '../../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DossierModal } from './DossierModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeadProfileProps {
  lead: Lead;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadProfile: React.FC<LeadProfileProps> = ({ lead, onClose, onEdit }) => {
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [propertiesViewed, setPropertiesViewed] = useState<any[]>([]);
  const [showDossier, setShowDossier] = useState(false);

  useEffect(() => {
    if (!lead?.id) return;
    
    // Fetch sales conversations from 'sales-conversations' collection
    const docRef = doc(db, 'sales-conversations', lead.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.conversacion && Array.isArray(data.conversacion)) {
          setSalesHistory(data.conversacion);
        }
      } else {
        setSalesHistory([]);
      }
    });

    return () => unsubscribe();
  }, [lead.id]);

  const scoreColor = lead.score > 70 ? "bg-emerald-500" : lead.score >= 40 ? "bg-amber-500" : "bg-rose-500";
  const scoreTextColor = lead.score > 70 ? "text-emerald-500" : lead.score >= 40 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-[480px] bg-obsidian-bg border-l border-obsidian-border shadow-2xl flex flex-col transform transition-transform duration-300">
      
      {/* Header con X para cerrar (Estilo PropertyDetails) */}
      <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5 shrink-0">
        <h2 className="text-xl font-bold">Detalles del Contacto</h2>
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
        
        {/* Arriba: avatar circular grande con iniciales, nombre, email y teléfono */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-obsidian-border flex items-center justify-center text-3xl font-bold uppercase tracking-widest text-white shadow-xl">
            {lead.name.substring(0, 2)}
          </div>
          <div>
            <h3 className="text-2xl font-bold leading-tight">{lead.name}</h3>
            <div className="text-sm text-obsidian-muted mt-1 space-y-0.5">
              {lead.email && <p>{lead.email}</p>}
              <p>{lead.phone}</p>
            </div>
          </div>
        </div>

        {/* Fila de píldoras con datos clave: Tipo, Zona, Estado */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border capitalize">
            {lead.type}
          </span>
          {lead.zone && (
            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border">
              {lead.zone}
            </span>
          )}
          <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium border border-obsidian-border uppercase">
            Estado: {lead.status.replace('_', ' ')}
          </span>
        </div>

        {/* AI Score: número grande, barra de progreso codificada por color, texto "Calificación IA" */}
        <div className="glass-card p-6 flex flex-col items-center justify-center space-y-4 border border-white/5 bg-white/5">
          <div className="text-center">
            <span className={cn("text-6xl font-extrabold tracking-tighter", scoreTextColor)}>
              {lead.score}
            </span>
          </div>
          <div className="w-full h-2 bg-obsidian-bg rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", scoreColor)} 
              style={{ width: `${lead.score}%` }} 
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">
            Calificación IA
          </p>
        </div>

        {/* Historial de conversación */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-muted">
            Historial de Conversación
          </h4>
          <div className="glass-card p-4 min-h-[160px] max-h-[300px] overflow-y-auto space-y-3 bg-white/5 border border-white/5">
            {salesHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center py-6 text-sm text-obsidian-muted">
                Sin conversaciones aún.
              </div>
            ) : (
              salesHistory.map((msg, idx) => {
                 // Aquí, según las instrucciones directas de HOY: "los mensajes del lead a la derecha, los del agente a la izquierda"
                 const isLead = msg.role === 'lead' || msg.role === 'usuario';
                 return (
                   <div key={idx} className={cn(
                     "flex flex-col gap-1 w-fit max-w-[85%]",
                     isLead ? "ml-auto items-end" : "mr-auto items-start"
                   )}>
                     <div className={cn(
                       "p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                       isLead 
                         ? "bg-obsidian-primary/20 text-white rounded-tr-sm border border-obsidian-primary/30" 
                         : "bg-obsidian-bg text-gray-200 rounded-tl-sm border border-obsidian-border"
                     )}>
                       {msg.content}
                     </div>
                   </div>
                 );
              })
            )}
          </div>
        </div>

        {/* Propiedades vistas */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-obsidian-muted">
            Propiedades Vistas
          </h4>
          <div className="glass-card p-4 text-sm text-obsidian-muted flex items-center justify-center py-6 border border-white/5 bg-white/5">
            {propertiesViewed.length === 0 ? (
              "Sin actividad registrada."
            ) : (
              // En un ambiente real, iteraríamos `propertiesViewed.map(...)`
              <ul className="w-full text-left space-y-2">
                {propertiesViewed.map((prop, i) => (
                  <li key={i}>{prop.title}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Al fondo, botones en fila */}
      <div className="p-6 border-t border-obsidian-border bg-obsidian-card shrink-0 flex gap-2 flex-wrap">
        <button 
          onClick={() => window.location.href = '/calendar'}
          className="flex-1 flex flex-col py-3 px-2 bg-obsidian-primary text-obsidian-bg font-bold rounded-xl hover:opacity-90 transition-opacity items-center justify-center text-[11px] text-center"
        >
          <Calendar className="w-4 h-4 mb-1" />
          Agendar
        </button>
        <button 
          onClick={() => window.location.href = '/chats'}
          className="flex-1 flex flex-col py-3 px-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors items-center justify-center text-[11px] text-center"
        >
          <MessageSquare className="w-4 h-4 mb-1" />
          Mensaje
        </button>
        <button 
          onClick={() => setShowDossier(true)}
          className="flex-1 flex flex-col py-3 px-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors items-center justify-center text-[11px] text-center"
        >
          <FileText className="w-4 h-4 mb-1" />
          Dossier
        </button>
        <button 
          onClick={() => window.open(`https://app.gohighlevel.com/contacts/detail/${lead.id}`, '_blank')}
          className="flex-1 flex flex-col py-3 px-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors items-center justify-center text-[11px] text-center"
        >
          <ExternalLink className="w-4 h-4 mb-1" />
          GHL
        </button>
      </div>

      {showDossier && <DossierModal lead={lead} onClose={() => setShowDossier(false)} />}
    </div>
  );
};
