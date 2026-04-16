import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Calendar } from 'lucide-react';

interface NewContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: any) => void;
}

export const NewContentModal: React.FC<NewContentModalProps> = ({ isOpen, onClose, onAddContent }) => {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Imagen');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    onAddContent({
      title,
      platform,
      type,
      status: 'Programado',
      date,
      time,
      image
    });
    
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-obsidian-bg border border-obsidian-border rounded-2xl shadow-2xl p-6 glass-card animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-obsidian-primary/10 flex items-center justify-center text-obsidian-primary">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Programar Contenido</h2>
              <p className="text-xs text-obsidian-muted">Planifica una nueva publicación</p>
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
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Título / Copy corto</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Lanzamiento Villa Marítima"
              className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Plataforma</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg appearance-none"
              >
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Tipo</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg appearance-none"
              >
                <option value="Imagen">Imagen</option>
                <option value="Video">Video</option>
                <option value="Artículo">Artículo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                <input 
                  type="text" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ej. 20 Abr"
                  className="w-full bg-black/40 border border-obsidian-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Hora</label>
              <input 
                type="text" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ej. 18:00"
                className="w-full bg-black/40 border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">URL de Imagen (Demo)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
              <input 
                type="text" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/40 border border-obsidian-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors focus:bg-obsidian-bg"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button 
              type="submit"
              className="px-6 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Programar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
