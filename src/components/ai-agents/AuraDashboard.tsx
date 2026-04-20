import React, { useState } from 'react';
import { 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  Lightbulb, 
  User, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  BarChart3, 
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askAura } from '../../services/auraService';
import { auraPresets } from '../../data/auraPresets';

interface AuraDashboardProps {
  onBack: () => void;
}

export const AuraDashboard: React.FC<AuraDashboardProps> = ({ onBack }) => {
  const [inputStr, setInputStr] = useState(auraPresets[0].json);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResponseData(null);
    
    try {
      // Validate JSON input
      JSON.parse(inputStr);
      
      const res = await askAura(inputStr);
      const data = JSON.parse(res);
      setResponseData(data);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud con Aura");
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
      {/* Header Fijo */}
      <header className="flex items-center justify-between p-6 border-b border-obsidian-border bg-obsidian-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-obsidian-muted hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-obsidian-primary rounded-xl flex items-center justify-center text-obsidian-bg shadow-lg shadow-obsidian-primary/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Aura <span className="text-obsidian-primary font-medium">Performance Agent</span></h1>
              <p className="text-[10px] text-obsidian-muted uppercase tracking-[0.2em] font-bold">Meta Ads API v19+ • Optimized for Real Estate</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex gap-4">
          {responseData?.status && (
            <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-2 ${
              responseData.status === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
              responseData.status === 'pendiente_aprobacion' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                responseData.status === 'error' ? 'bg-rose-500' :
                responseData.status === 'pendiente_aprobacion' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} />
              {responseData.status.replace('_', ' ')}
            </div>
          )}
          <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-[10px] font-bold text-obsidian-muted tracking-wider">
            AD ACCOUNT: <span className="text-obsidian-primary ml-1 font-mono">act_992810</span>
          </div>
        </div>
      </header>

      {/* Contenido Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Panel Lateral: Acciones */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-obsidian-muted">
                <Target className="w-4 h-4 text-obsidian-primary" />
                Operaciones
              </h2>
              
              <div className="space-y-3">
                {auraPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setInputStr(preset.json);
                      setResponseData(null);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                      inputStr === preset.json 
                        ? 'bg-obsidian-primary/5 border-obsidian-primary/30' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${inputStr === preset.json ? 'text-obsidian-primary' : 'text-white'}`}>
                        {preset.name}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${inputStr === preset.json ? 'translate-x-1 text-obsidian-primary' : 'text-obsidian-muted group-hover:translate-x-1'}`} />
                    </div>
                    <p className="text-[11px] text-obsidian-muted leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>

              <button 
                onClick={handleRun}
                disabled={loading}
                className="w-full mt-6 bg-obsidian-primary hover:bg-obsidian-primary/90 text-obsidian-bg py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-obsidian-primary/20 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-obsidian-bg border-t-transparent rounded-full animate-spin" />
                    Analizando Entorno...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Ejecutar Aura
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-[11px] text-rose-500 font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="glass-card p-6 bg-amber-500/5 border-amber-500/10">
              <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.2em] mb-4">Compliance Guard</h3>
              <ul className="space-y-3 text-[11px] text-amber-500/80">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                  Categoría "HOUSING" forzada en todos los anuncios.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5" />
                  Auditando exclusiones de CP para evitar sesgos discriminatorios.
                </li>
              </ul>
            </div>
          </div>

          {/* Panel Principal: Monitoreo */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {!responseData ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="glass-card flex-1 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                    <Activity className="w-10 h-10 text-obsidian-muted/20" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sistema a la espera</h3>
                  <p className="text-sm text-obsidian-muted max-w-xs">Selecciona unpreset de operación para que Aura inicie la auditoría de Meta Ads.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="data"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-6"
                >
                  {/* Mensaje Humanizado de Aura */}
                  {responseData.mensaje_para_realtor && (
                    <div className="glass-card p-6 relative overflow-hidden">
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                        <User className="w-48 h-48 text-obsidian-primary" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-obsidian-primary/20 flex items-center justify-center text-obsidian-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-obsidian-primary">Informe de Aura</span>
                      </div>
                      <p className="text-lg font-medium text-white/90 leading-relaxed italic">
                        "{responseData.mensaje_para_realtor}"
                      </p>
                    </div>
                  )}

                  {/* Diagnóstico y Métricas */}
                  {responseData.reporte && (
                    <div className="glass-card p-8">
                      <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-obsidian-primary" />
                          <h3 className="font-bold uppercase tracking-tighter text-lg">Diagnóstico de Rendimiento</h3>
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-obsidian-muted uppercase tracking-widest">
                          Periodo: {responseData.reporte.periodo}
                        </div>
                      </div>

                      {responseData.reporte.diagnostico && (
                        <div className="mb-10 pl-6 border-l-2 border-obsidian-primary/40 text-obsidian-muted">
                          <p className="text-sm italic leading-relaxed">
                            {responseData.reporte.diagnostico}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider block">Leads</span>
                          <span className="text-3xl font-bold font-mono tracking-tighter">{responseData.reporte.metricas?.leads}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider block">CPL</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold font-mono tracking-tighter text-obsidian-primary">
                              ${responseData.reporte.metricas?.cpl}
                            </span>
                            <span className="text-[10px] text-obsidian-muted">/ avg</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider block">CTR</span>
                          <span className="text-3xl font-bold font-mono tracking-tighter">{responseData.reporte.metricas?.ctr}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-wider block">Spend</span>
                          <span className="text-3xl font-bold font-mono tracking-tighter">${responseData.reporte.metricas?.gasto_total}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Optimización Inteligente */}
                  {responseData.optimizaciones && responseData.optimizaciones.length > 0 && (
                    <div className="glass-card p-6 bg-obsidian-primary/5 border-obsidian-primary/20">
                      <div className="flex items-center gap-3 mb-6">
                        <Lightbulb className="w-5 h-5 text-obsidian-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">IA Optimization Loop</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {responseData.optimizaciones.map((opt: any, i: number) => (
                          <div key={i} className="bg-obsidian-bg/50 p-5 rounded-2xl border border-obsidian-primary/10 hover:border-obsidian-primary/30 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold text-obsidian-primary uppercase tracking-widest px-2 py-0.5 bg-obsidian-primary/10 rounded">Acción Recomendada</span>
                              <span className="text-[9px] font-bold text-white/50 uppercase">{opt.impacto_esperado}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2">{opt.accion}</h4>
                            <p className="text-[11px] text-obsidian-muted leading-relaxed">{opt.justificacion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Acciones Finales */}
                  {responseData.status === 'pendiente_aprobacion' && (
                    <div className="flex gap-4">
                      <button className="flex-1 bg-emerald-500 text-emerald-950 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-400 transition-colors">
                        Aprobar y Ejecutar en Meta
                      </button>
                      <button className="flex-1 bg-white/5 text-obsidian-muted py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors">
                        Rechazar
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
