import React, { useState } from 'react';
import { Globe, Palette, Upload, Image as ImageIcon } from 'lucide-react';

export const DomainSettings: React.FC = () => {
  const [domain, setDomain] = useState('agencia-demo.rora.app');
  const [primaryColor, setPrimaryColor] = useState('#22C55E');
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Domain */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-obsidian-primary" />
          Dominio Personalizado
        </h3>
        <p className="text-obsidian-muted text-sm mb-6">
          Conecta tu propio dominio para personalizar la ruta de tus listados de propiedades y portales de clientes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 bg-obsidian-bg border border-obsidian-border rounded-xl px-4 py-3 text-sm outline-none focus:border-obsidian-primary"
          />
          <button className="px-6 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap">
            Verificar Dominio
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
          <p>Dominio conectado y asegurado con SSL. Tus listados están disponibles bajo esta ruta.</p>
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card p-8 text-white relative">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-obsidian-primary" />
          Branding y Marca Blanca
        </h3>
        <p className="text-obsidian-muted text-sm mb-8">
          Personaliza Rora con los colores y logos de tu agencia. Todos los correos y PDF generados usarán esta identidad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#888888]">Color Principal</h4>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0"
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl px-4 py-2 text-sm outline-none focus:border-obsidian-primary uppercase"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#888888]">Logotipo de la Agencia</h4>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#ffffff10] border border-obsidian-border rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#888888]" />
              </div>
              <div>
                <button className="flex items-center gap-2 px-4 py-2 bg-obsidian-bg border border-obsidian-border rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                  <Upload className="w-4 h-4" />
                  Subir Logo
                </button>
                <p className="text-xs text-[#888888] mt-2">Recomendado: PNG opaco, 500x500px</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-obsidian-border flex justify-end">
          <button className="px-6 py-3 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
            Guardar Apariencia
          </button>
        </div>
      </div>
    </div>
  );
};
