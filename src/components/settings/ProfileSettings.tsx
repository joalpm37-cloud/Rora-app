import React, { useState, useEffect } from 'react';
import { Camera, User, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../Logo';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombreComercial: 'RORA Obsidian Gallery',
    emailContacto: 'contacto@roraobsidian.com',
    telefono: '+34 912 345 678',
    ubicacion: 'Calle Serrano 45, Madrid'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', user.uid);
      await setDoc(docRef, formData, { merge: true });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-obsidian-muted">Cargando configuración...</div>;

  return (
    <div className="glass-card p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
      {showToast && (
        <div className="absolute top-4 right-8 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          Configuración guardada
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-obsidian-card flex items-center justify-center border border-obsidian-border overflow-hidden">
            <Logo className="w-16 h-16" />
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 bg-obsidian-primary text-obsidian-bg rounded-lg shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-bold">{formData.nombreComercial}</h3>
          <p className="text-sm text-obsidian-muted mt-1">Agencia Inmobiliaria de Lujo • {formData.ubicacion}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Plan Enterprise</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 text-white rounded-full border border-white/10">ID: {user?.uid.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Nombre Comercial</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={formData.nombreComercial}
              onChange={(e) => setFormData({...formData, nombreComercial: e.target.value})}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Email de Contacto</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="email" 
              value={formData.emailContacto}
              onChange={(e) => setFormData({...formData, emailContacto: e.target.value})}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={formData.telefono} 
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Ubicación Principal</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={formData.ubicacion}
              onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-obsidian-border flex flex-col md:flex-row justify-end gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
        >
          Descartar cambios
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto px-8 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};
