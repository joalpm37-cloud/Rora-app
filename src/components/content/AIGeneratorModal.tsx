import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Plus, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
const getApiUrl = (path: string) => {
  const base = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://rora-app.onrender.com';
  return `${base}${path}`;
};

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: any) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose, onApprove }) => {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");

  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cargarPropiedades = async () => {
        try {
          const snap = await getDocs(collection(db, 'propiedades'));
          const props = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPropiedades(props);
          if (props.length > 0) setSelectedPropertyId(props[0].id);
        } catch (error) {
          console.error("Error al cargar propiedades:", error);
        }
      };
      cargarPropiedades();
      // Reset state mapping if reopening
      setCaption("");
      setHashtags([]);
      setDateStr("");
      setTimeStr("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!selectedPropertyId) return;
    setIsGenerating(true);
    
    try {
      const prop = propiedades.find(p => p.id === selectedPropertyId);
      if (!prop) return;
      
      const payloadPropiedad = {
        nombre: prop.titulo || prop.title,
        ubicacion: prop.zona || prop.location,
        precio: prop.precio || prop.price,
        habitaciones: prop.habitaciones || prop.rooms,
        banos: prop.banos || prop.bathrooms,
        metros: prop.metros || prop.meters,
        caracteristicas: prop.caracteristicas?.join(", ") || "",
        tipoContenido: "instagram_reel" // Default for generation
      };
      
      const response = await fetch(getApiUrl('/api/agents/content/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPropiedad)
      });
      
      const resultadoJSON = await response.json();
      
      if (resultadoJSON) {
        setCaption(resultadoJSON.caption_instagram || resultadoJSON.caption_facebook || "");
        if (resultadoJSON.hashtags && Array.isArray(resultadoJSON.hashtags)) {
          setHashtags(resultadoJSON.hashtags.map((t: string) => t.replace('#', '')));
        }
        
        // Parse "Viernes a las 19:00" to some simple date just mapping
        // We'll calculate next Friday or just set a generic date 
        // For now let's just default to Tomorrow since user can edit
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        setDateStr(nextDay.toISOString().split('T')[0]);
        setTimeStr("19:00");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim().replace('#', ''))) {
      setHashtags([...hashtags, newHashtag.trim().replace('#', '')]);
      setNewHashtag("");
    }
  };

  const handleApprove = () => {
    onApprove({
      title: 'Villa Marítima - Post (IA)',
      platform: 'Instagram',
      type: 'Video',
      status: 'Programado',
      date: dateStr,
      time: timeStr,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400',
      caption,
      hashtags
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-obsidian-card border border-obsidian-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Contenido generado por IA</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">
              Propiedad Objetivo
            </label>
            <div className="flex gap-2">
              <select 
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="flex-1 bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 appearance-none"
              >
                <option value="">Selecciona una propiedad...</option>
                {propiedades.map(p => (
                  <option key={p.id} value={p.id}>{p.titulo || p.title || 'Propiedad Innombrable'}</option>
                ))}
              </select>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !selectedPropertyId}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generar con IA
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">
              Caption
            </label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full h-32 bg-obsidian-bg border border-obsidian-border rounded-xl p-3 text-sm resize-none outline-none focus:border-obsidian-primary transition-colors text-gray-200"
              placeholder={isGenerating ? "Generando caption..." : "Genera con IA para rellenar automáticamente..."}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">
              Hashtags
            </label>
            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-obsidian-bg border border-obsidian-border rounded-xl min-h-[60px]">
              {hashtags.map(t => (
                <span key={t} className="flex items-center gap-1.5 px-3 py-1 bg-obsidian-card text-obsidian-primary rounded-full text-xs font-bold">
                  #{t}
                  <button onClick={() => handleRemoveHashtag(t)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddHashtag} className="flex gap-2">
              <input 
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Añadir hashtag..."
                className="flex-1 bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200"
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">
              Programar
            </label>
            <div className="flex gap-4">
              <input 
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="flex-1 bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 [color-scheme:dark]"
              />
              <input 
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="flex-1 bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-obsidian-border bg-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleApprove}
            className="flex-[2] flex items-center justify-center gap-2 py-3 bg-obsidian-primary text-obsidian-bg font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Aprobar y programar
          </button>
        </div>
      </div>
    </div>
  );
};
