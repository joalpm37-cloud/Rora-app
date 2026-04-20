import React, { useState } from 'react';
import { 
  Bot, 
  ArrowLeft, 
  Camera, 
  Sparkles, 
  Video, 
  FileText, 
  Layers, 
  Wand2, 
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LumenOutput, generateLumenContent, LumenInput } from '../../services/lumenService';

// Sub-componentes (los crearemos a continuación)
// import { LumenOutputView } from './LumenOutputView';
// import { VeoAnimationPanel } from './VeoAnimationPanel';
// import { RemotionPanel } from './RemotionPanel';

interface LumenDashboardProps {
  onBack: () => void;
}

export const LumenDashboard: React.FC<LumenDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'copy' | 'remotion' | 'veo'>('copy');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<LumenOutput | null>(null);
  
  // Estado para el mini-form interno de Lumen
  const [formData, setFormData] = useState<Partial<LumenInput>>({
    ubicacion: '',
    tipo: 'Casa',
    precio: '',
    m2_totales: '',
    recamaras: '',
    banos: '',
    informacion_extra: '',
    tono: 'Elegante y Profesional',
    solicitud: 'Genera un guión impactante para un Reel de Instagram',
    fotos: []
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, fotos: Array.from(e.target.files!) }));
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateLumenContent(formData as LumenInput);
      setOutput(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-obsidian-bg"
    >
      {/* Header Premium */}
      <header className="flex items-center justify-between p-6 border-b border-obsidian-border bg-obsidian-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-obsidian-muted hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0ba376] rounded-xl flex items-center justify-center text-obsidian-bg shadow-lg shadow-[#0ba376]/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Lumen <span className="text-[#0ba376] font-medium">Scout Agent</span></h1>
              <p className="text-[10px] text-obsidian-muted uppercase tracking-[0.2em] font-bold">AI Art Director • Visual Storytelling</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('copy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'copy' ? 'bg-[#0ba376] text-obsidian-bg shadow-lg shadow-[#0ba376]/20' : 'text-obsidian-muted hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Copy/Redes
          </button>
          <button
            onClick={() => setActiveTab('remotion')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'remotion' ? 'bg-[#0ba376] text-obsidian-bg shadow-lg shadow-[#0ba376]/20' : 'text-obsidian-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Remotion AI
          </button>
          <button
            onClick={() => setActiveTab('veo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === 'veo' ? 'bg-[#0ba376] text-obsidian-bg shadow-lg shadow-[#0ba376]/20' : 'text-obsidian-muted hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Veo Video
          </button>
        </nav>
      </header>

      {/* Área de Trabajo */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Panel Izquierdo: Input de Datos (Solo para Copy/Redes) */}
        {activeTab === 'copy' && (
          <aside className="w-full lg:w-[400px] border-r border-obsidian-border p-6 overflow-y-auto bg-black/20">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-obsidian-muted">
                <Camera className="w-4 h-4" />
                <h2 className="text-[10px] font-bold uppercase tracking-widest">Fuentes de Datos</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-obsidian-muted mb-2">Fotos de Propiedad</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-obsidian-border rounded-2xl hover:border-[#0ba376]/50 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-obsidian-muted group-hover:text-[#0ba376] transition-colors mb-2" />
                      <p className="text-[10px] text-obsidian-muted font-bold uppercase tracking-wider">
                        {formData.fotos?.length ? `${formData.fotos.length} fotos cargadas` : 'Subir fotos para análisis'}
                      </p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <input 
                    placeholder="Ubicación (Ej: Marbella, España)"
                    className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-[#0ba376] outline-none transition-all"
                    value={formData.ubicacion}
                    onChange={e => setFormData({...formData, ubicacion: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      placeholder="Precio"
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-[#0ba376] outline-none transition-all"
                      value={formData.precio}
                      onChange={e => setFormData({...formData, precio: e.target.value})}
                    />
                    <select 
                      className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-[#0ba376] outline-none transition-all"
                      value={formData.tipo}
                      onChange={e => setFormData({...formData, tipo: e.target.value})}
                    >
                      <option value="Casa">Casa</option>
                      <option value="Departamento">Departamento</option>
                      <option value="Villa">Villa</option>
                      <option value="Penthouse">Penthouse</option>
                    </select>
                  </div>
                </div>

                <textarea 
                  placeholder="Instrucciones adicionales para Lumen..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-[#0ba376] outline-none transition-all h-24 resize-none"
                  value={formData.informacion_extra}
                  onChange={e => setFormData({...formData, informacion_extra: e.target.value})}
                />

                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full bg-[#0ba376] text-obsidian-bg py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-[#0ea378] transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isLoading ? 'Analizando Visión...' : 'Generar con Lumen'}
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Panel Derecho: Resultados */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10 bg-obsidian-bg relative">
          <AnimatePresence mode="wait">
            {activeTab === 'copy' && (
              <motion.div 
                key="copy-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                {/* Aquí inyectaremos LumenOutputView */}
                {output ? (
                   <div className="space-y-8">
                      {/* Resumen del Guión */}
                      <div className="glass-card p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Bot className="w-32 h-32" />
                        </div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <Wand2 className="w-6 h-6 text-[#0ba376]" />
                          Guión Cinematográfico Producido
                        </h2>
                        
                        <div className="space-y-6">
                           <div className="border-l-2 border-[#0ba376] pl-6 py-1">
                              <span className="text-[10px] font-bold text-[#0ba376] uppercase tracking-widest block mb-2">[0-5s] Hook Viral</span>
                              <p className="text-xl italic text-white/90">"{output.outputs.guion_video.hook}"</p>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                 <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-widest block mb-3">Descripción Larga (Feed)</span>
                                 <p className="text-sm leading-relaxed text-slate-300">{output.outputs.descripcion_larga}</p>
                              </div>
                              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                 <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-widest block mb-3">Hashtags Estratégicos</span>
                                 <div className="flex flex-wrap gap-2">
                                    {output.outputs.hashtags_feed.map((h, i) => (
                                      <span key={i} className="text-[10px] text-[#0ba376] bg-[#0ba376]/10 px-2 py-1 rounded-md font-bold">{h}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                           <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                              Copiar Guión Completo
                           </button>
                           <button 
                             onClick={() => setActiveTab('remotion')}
                             className="flex-1 bg-[#0ba376] text-obsidian-bg py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                           >
                              <Play className="w-4 h-4 fill-current" />
                              Continuar a Remotion
                           </button>
                        </div>
                      </div>
                   </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Bot className="w-20 h-20 text-obsidian-border mb-6 animate-pulse" />
                    <h3 className="text-xl font-bold text-white mb-2">Lumen está listo para crear</h3>
                    <p className="text-obsidian-muted max-w-sm text-sm">Carga las fotos y detalles de tu propiedad a la izquierda para iniciar el proceso creativo.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'remotion' && (
              <motion.div 
                key="remotion-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                 <Layers className="w-20 h-20 text-[#0ba376] mb-6" />
                 <h2 className="text-2xl font-bold mb-4">Integración Remotion AI</h2>
                 <p className="text-obsidian-muted max-w-md text-sm mb-8">Utiliza el guión generado para crear un vídeo programático con animaciones, música y marca de agua de RORA.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    <div className="glass-card p-6 border-obsidian-primary/30">
                       <h3 className="font-bold mb-2">Preset: Cinematic Drone</h3>
                       <p className="text-[11px] text-obsidian-muted mb-4">Transiciones lentas, tipografía elegante y paleta de colores tierra.</p>
                       <button className="w-full py-2 bg-obsidian-primary text-obsidian-bg rounded-lg text-[10px] font-bold uppercase">Configurar Render</button>
                    </div>
                    <div className="glass-card p-6 border-white/10">
                       <h3 className="font-bold mb-2">Preset: Fast Impact</h3>
                       <p className="text-[11px] text-obsidian-muted mb-4">Ideal para Reels. Cortes rápidos, tipografía bold y colores vibrantes.</p>
                       <button className="w-full py-2 bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">Configurar Render</button>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'veo' && (
              <motion.div 
                key="veo-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                 <Zap className="w-20 h-20 text-amber-500 mb-6" />
                 <h2 className="text-2xl font-bold mb-4">Veo Video Animación</h2>
                 <p className="text-obsidian-muted max-w-md text-sm mb-8">Genera cinemáticas realistas a partir de tus fotos usando el modelo generativo de video de última generación.</p>
                 <div className="bg-white/5 p-8 rounded-3xl border border-white/10 w-full max-w-xl text-left">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 block">Prompt de Animación Sugerido</span>
                    <p className="text-sm font-mono text-slate-300 italic mb-6">"Cinematic drone shot flying through a modern luxury living room, warm sunset light hitting the oak wood floors, hyper-realistic, 4k..."</p>
                    <button className="w-full py-4 bg-amber-500 text-amber-950 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
                       <Sparkles className="w-4 h-4" />
                       Generar en Veo Cloud
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </motion.div>
  );
};
