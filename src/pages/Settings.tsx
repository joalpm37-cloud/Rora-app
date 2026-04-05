import React from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Database, 
  Zap,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  Lock
} from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { Logo } from '../components/Logo';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Administra tu perfil de agencia, integraciones y facturación.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {[
            { icon: User, label: 'Perfil de Agencia', active: true },
            { icon: Shield, label: 'Seguridad y Accesos', active: false },
            { icon: Bell, label: 'Notificaciones', active: false },
            { icon: CreditCard, label: 'Facturación y Planes', active: false },
            { icon: Globe, label: 'Dominio y Branding', active: false },
            { icon: Database, label: 'Integraciones CRM', active: false },
            { icon: Zap, label: 'Configuración AI', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex-none lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                item.active ? "bg-obsidian-primary/10 text-obsidian-primary border border-obsidian-primary/20" : "text-obsidian-muted hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-card p-8 space-y-8">
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
                <h3 className="text-xl font-bold">RORA Obsidian Gallery</h3>
                <p className="text-sm text-obsidian-muted mt-1">Agencia Inmobiliaria de Lujo • Madrid, España</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Plan Enterprise</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 text-white rounded-full border border-white/10">ID: RORA-8291</span>
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
                    defaultValue="RORA Obsidian Gallery" 
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
                    defaultValue="contacto@roraobsidian.com" 
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
                    defaultValue="+34 912 345 678" 
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
                    defaultValue="Calle Serrano 45, Madrid" 
                    className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-obsidian-border flex flex-col md:flex-row justify-end gap-4">
              <button className="w-full md:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
                Descartar cambios
              </button>
              <button className="w-full md:w-auto px-8 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                Guardar cambios
              </button>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6">Seguridad Avanzada</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-obsidian-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Autenticación de dos factores (2FA)</h4>
                    <p className="text-xs text-obsidian-muted mt-0.5">Añade una capa extra de seguridad a tu cuenta.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Activado</span>
                  <ChevronRight className="w-4 h-4 text-obsidian-muted group-hover:text-obsidian-primary transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-obsidian-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Registro de Actividad</h4>
                    <p className="text-xs text-obsidian-muted mt-0.5">Revisa quién y cuándo ha accedido al sistema.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ChevronRight className="w-4 h-4 text-obsidian-muted group-hover:text-obsidian-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
