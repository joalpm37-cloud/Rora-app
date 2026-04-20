import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  MapPin, 
  Target, 
  ChevronRight, 
  ArrowLeft, 
  Loader2, 
  Send,
  Building2,
  DollarSign,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAtlasDossier, AtlasProspect } from '../../services/atlasService';

interface AtlasDashboardProps {
  onBack: () => void;
}

export const AtlasDashboard: React.FC<AtlasDashboardProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState('');
  
  const [prospect, setProspect] = useState<AtlasProspect>({
    nombre: 'Carlos Mendoza',
    presupuesto_min: 250000,
    presupuesto_max: 380000,
    tipo_propiedad: ['Apartamento'],
    ubicaciones: ['Las Mercedes', 'Altamira'],
    recamaras_min: 3,
    banos_min: 2,
    must_haves: ['Seguridad 24/7', 'Planta Eléctrica'],
    nice_to_haves: ['Pozo de Agua', 'Vista al Avila'],
    mercado: 'local'
  });

  const handleStartMission = async () => {
    setLoading(true);
    setDossier('');
    try {
      await generateAtlasDossier(prospect, (chunk) => {
        setDossier(prev => prev + chunk);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-obsidian-bg"
    >
      {/* Header Analítico */}
      <header className="flex items-center justify-between p-6 border-b border-obsidian-border bg-obsidian-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors text-obsidian-muted hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rora-green rounded-xl flex items-center justify-center text-white shadow-lg shadow-rora-green/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Atlas <span className="text-rora-green font-medium">Scout Agent</span></h1>
              <p className="text-[10px] text-obsidian-muted uppercase tracking-[0.2em] font-bold">Hybrid Search Engine • Real-time Market Data</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-bold text-obsidian-muted tracking-wider">
            SEARCH STATUS: <span className={loading ? "text-rora-green animate-pulse" : "text-white"}>{loading ? 'ACTIVE SCOUTING' : 'IDLE'}</span>
          </div>
        </div>
      </header>

      {/* Grid de Exploración */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Formulario de Misión (Izquierda) */}
        <aside className="w-full lg:w-[450px] border-r border-obsidian-border p-6 overflow-y-auto bg-black/10">
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-rora-green">
              <Target className="w-4 h-4" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Configuración de Misión</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-obsidian-muted uppercase tracking-widest border-b border-white/5 pb-2">Información del Prospecto</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Cliente</label>
                    <input 
                      value={prospect.nombre}
                      onChange={e => setProspect({...prospect, nombre: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Ppto Mín (USD)</label>
                      <input 
                        type="number"
                        value={prospect.presupuesto_min}
                        onChange={e => setProspect({...prospect, presupuesto_min: parseInt(e.target.value)})}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Ppto Máx (USD)</label>
                      <input 
                        type="number"
                        value={prospect.presupuesto_max}
                        onChange={e => setProspect({...prospect, presupuesto_max: parseInt(e.target.value)})}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-obsidian-muted uppercase tracking-widest border-b border-white/5 pb-2">Preferencias Técnicas</h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Zonas de Interés</label>
                    <input 
                      value={prospect.ubicaciones.join(', ')}
                      onChange={e => setProspect({...prospect, ubicaciones: e.target.value.split(',').map(s => s.trim())})}
                      placeholder="Ej: Las Mercedes, Altamira"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Recámaras</label>
                      <input 
                        type="number"
                        value={prospect.recamaras_min}
                        onChange={e => setProspect({...prospect, recamaras_min: parseInt(e.target.value)})}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider ml-1">Baños</label>
                      <input 
                        type="number"
                        value={prospect.banos_min}
                        onChange={e => setProspect({...prospect, banos_min: parseInt(e.target.value)})}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-rora-green outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold text-obsidian-muted uppercase tracking-widest border-b border-white/5 pb-2">Mercado Scout</h3>
                <div className="flex bg-white/5 p-1 border border-white/10 rounded-xl">
                  <button 
                    onClick={() => setProspect({...prospect, mercado: 'local'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${prospect.mercado === 'local' ? 'bg-rora-green text-white shadow-lg' : 'text-obsidian-muted hover:text-white'}`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Interno
                  </button>
                  <button 
                    onClick={() => setProspect({...prospect, mercado: 'internacional'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${prospect.mercado === 'internacional' ? 'bg-rora-green text-white shadow-lg' : 'text-obsidian-muted hover:text-white'}`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Global
                  </button>
                </div>
              </div>

              <button 
                onClick={handleStartMission}
                disabled={loading}
                className="w-full bg-rora-green text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-rora-green/90 transition-all shadow-lg shadow-rora-green/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'MODO SCOUT ACTIVO...' : 'INICIAR MISIÖN SCOUT'}
              </button>
            </div>
          </div>
        </aside>

        {/* Dossier de Resultados (Derecha) */}
        <section className="flex-1 overflow-hidden flex flex-col p-8 lg:p-12 relative bg-[#060807]">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dossier de Exploración</h2>
              <p className="text-obsidian-muted text-sm mt-1">Análisis algorítmico y búsqueda web en tiempo real.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="px-3 py-1.5 bg-rora-green/10 border border-rora-green/20 rounded-full text-[9px] font-bold text-rora-green uppercase tracking-widest flex items-center gap-2">
                 <Info className="w-3 h-3" />
                 Atlas Intelligence v2.4
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {!dossier && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                  <Target className="w-10 h-10 text-obsidian-muted/20" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Misión en Espera</h3>
                <p className="text-obsidian-muted max-w-xs text-sm">Define los parámetros del prospecto a la izquierda para que Atlas inicie el escaneo del mercado local y global.</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-4">
                {/* Visualizador de Dossier con Typography */}
                <article className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-p:text-slate-400 prose-li:text-slate-400 prose-blockquote:border-rora-green">
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {dossier}
                  </div>
                </article>
                
                {loading && (
                  <div className="mt-8 flex items-center gap-3 text-rora-green">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Recibiendo datos del mercado...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
};
