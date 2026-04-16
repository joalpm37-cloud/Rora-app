import React, { useState } from 'react';
import { Database, Link2, Search, Check, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const integrations = [
  { id: 'meta', name: 'Meta Ads', description: 'Sincroniza tus campañas y leads de Facebook e Instagram.', status: 'connected', icon: 'M' },
  { id: 'google', name: 'Google Ads', description: 'Importa métricas de rendimiento y conversiones en tiempo real.', status: 'connected', icon: 'G' },
  { id: 'whatsapp', name: 'WhatsApp Business', description: 'API oficial para que los agentes IA respondan mensajes.', status: 'disconnected', icon: 'W' },
  { id: 'zapier', name: 'Zapier', description: 'Conecta Rora con más de 5000+ aplicaciones web.', status: 'disconnected', icon: 'Z' },
  { id: 'idealista', name: 'Idealista (Export)', description: 'Exporta tus propiedades directamente al portal.', status: 'connected', icon: 'I' },
  { id: 'hubspot', name: 'HubSpot', description: 'Sincronización bidireccional de contactos y etapas de negocio.', status: 'disconnected', icon: 'H' },
];

export const IntegrationSettings: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = integrations.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-obsidian-primary" />
              Integraciones y Conexiones
            </h3>
            <p className="text-obsidian-muted text-sm">
              Conecta tus herramientas favoritas para centralizar tus flujos de trabajo.
            </p>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar integraciones..." 
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((integration) => (
            <div key={integration.id} className="flex flex-col sm:flex-row gap-4 p-5 border border-white/10 bg-white/5 rounded-2xl hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-obsidian-card border border-white/5 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">{integration.icon}</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base mb-1">{integration.name}</h4>
                  <p className="text-xs text-obsidian-muted mb-4">{integration.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  {integration.status === 'connected' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                      <Check className="w-3 h-3" />
                      Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-obsidian-muted bg-white/5 px-2 py-1 rounded-md">
                      Desconectado
                    </span>
                  )}
                  
                  {integration.status === 'connected' ? (
                    <button className="text-xs text-obsidian-muted hover:text-white transition-colors flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Sincronizar
                    </button>
                  ) : (
                    <button className="text-xs font-bold text-obsidian-bg bg-obsidian-primary hover:opacity-90 transition-opacity px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Webhooks Config */}
      <div className="glass-card p-8">
         <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-obsidian-primary" />
            Configuración de Webhooks (Avanzado)
         </h3>
         <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-obsidian-bg border border-obsidian-border rounded-xl">
               <div className="flex-1 font-mono text-xs text-obsidian-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  https://api.rora.app/v1/webhooks/recv_9a8b7c6d5e4f3g2h1
               </div>
               <button className="ml-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">
                  Copiar URL
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
