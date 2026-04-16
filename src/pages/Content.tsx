import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Type
} from 'lucide-react';

import { NewContentModal } from '../components/content/NewContentModal';
import { AIStrategy } from '../components/content/AIStrategy';
import { AIGeneratorModal } from '../components/content/AIGeneratorModal';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

const initialContentItems = [
  { 
    id: 1, 
    title: 'Villa Marítima - Drone View', 
    platform: 'Instagram', 
    type: 'Video', 
    status: 'Programado', 
    date: '15 Abr', 
    time: '18:00',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 2, 
    title: 'Luxury Real Estate Trends 2026', 
    platform: 'LinkedIn', 
    type: 'Artículo', 
    status: 'Borrador', 
    date: '16 Abr', 
    time: '10:00',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400'
  },
  { 
    id: 3, 
    title: 'Penthouse Skyline - Interior Design', 
    platform: 'Instagram', 
    type: 'Imagen', 
    status: 'Publicado', 
    date: '14 Abr', 
    time: '12:30',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400'
  },
];

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Content: React.FC = () => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIGenModalOpen, setIsAIGenModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'contenido-programado'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setContentItems(initialContentItems);
      } else {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().datos_completos,
          title: doc.data().titulo,
          platform: doc.data().plataforma,
          date: doc.data().fecha,
          status: doc.data().estado
        }));
        setContentItems(items);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddContent = async (newContentData: any) => {
    try {
      await addDoc(collection(db, 'contenido-programado'), {
        titulo: newContentData.title,
        plataforma: newContentData.platform,
        fecha: newContentData.date,
        estado: newContentData.status,
        timestamp: serverTimestamp(),
        datos_completos: newContentData
      });
    } catch (err) {
      console.error("Error al guardar en Firebase:", err);
    }
  };

  const handleApplySuggestion = () => {
    const suggestionContent = {
      title: 'Villa Marítima — Reel Sugerido',
      platform: 'Instagram',
      type: 'Video',
      status: 'Programado',
      date: 'Viernes', // As per prompt text "próximo viernes"
      time: '19:00',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=400'
    };
    handleAddContent(suggestionContent);
  };


  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contenido</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Planifica y gestiona tu presencia en redes sociales.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contenido
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Estrategia Semanal</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Calendar className="w-4 h-4 text-obsidian-muted" />
              </button>
              <select className="bg-obsidian-bg border border-obsidian-border text-xs rounded-lg px-3 py-1.5 outline-none">
                <option>Esta semana</option>
                <option>Próxima semana</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentItems.map((item) => (
              <div key={item.id} className="glass-card group overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                      {item.platform === 'Instagram' ? <Instagram className="w-3 h-3" /> : 
                       item.platform === 'LinkedIn' ? <Linkedin className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.platform}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full backdrop-blur-md border",
                      item.status === 'Publicado' ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : 
                      item.status === 'Programado' ? "bg-blue-500/20 text-blue-500 border-blue-500/30" : 
                      "bg-white/20 text-white border-white/30"
                    )}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-bold text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-obsidian-muted font-bold uppercase tracking-widest">
                        {item.type === 'Video' ? <Video className="w-3 h-3" /> : 
                         item.type === 'Imagen' ? <ImageIcon className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                        {item.type}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-obsidian-muted font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {item.date} • {item.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-obsidian-border">
                    <div className="flex items-center -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-6 h-6 rounded-full border-2 border-obsidian-card" referrerPolicy="no-referrer" />
                      ))}
                    </div>
                    <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-obsidian-muted" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="glass-card border-dashed border-2 border-obsidian-border flex flex-col items-center justify-center gap-3 p-8 hover:bg-white/5 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-obsidian-primary/10 text-obsidian-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-obsidian-muted">Añadir contenido</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <AIStrategy 
            onApplySuggestion={handleApplySuggestion}
            onGenerateAI={() => setIsAIGenModalOpen(true)}
          />
        </div>
      </div>

      <NewContentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddContent={handleAddContent}
      />

      <AIGeneratorModal
        isOpen={isAIGenModalOpen}
        onClose={() => setIsAIGenModalOpen(false)}
        onApprove={handleAddContent}
      />
    </div>
  );
};
