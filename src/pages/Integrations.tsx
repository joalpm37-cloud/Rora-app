import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, XCircle, ExternalLink, RefreshCw, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../lib/api-client';

export const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(getApiUrl(`/api/auth/google/status/${user.uid}`));
      const data = await res.json();
      setGoogleStatus(data);
    } catch (err) {
      console.error("Error checking Google status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (!user) return;
    try {
      const res = await fetch(getApiUrl(`/api/auth/google/url?userId=${user.uid}`));
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Error getting Google auth URL:", err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          <Zap className="w-10 h-10 text-obsidian-primary" />
          Integraciones
        </h1>
        <p className="text-obsidian-muted max-w-2xl">
          Conecta tus herramientas externas para potenciar el ecosistema de agentes RORA. El agendamiento inteligente requiere conexión a Google Calendar.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Google Workspace Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card group hover:border-obsidian-primary/30 transition-all p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 bg-obsidian-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-obsidian-primary/10 transition-colors" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_Icons-09-Google_Drive.svg" alt="Google" className="w-8 h-8" />
              </div>
              {googleStatus?.connected ? (
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Conectado
                </div>
              ) : (
                <div className="flex items-center gap-2 text-obsidian-muted bg-white/5 px-4 py-2 rounded-full text-xs font-bold border border-white/5">
                  <XCircle className="w-4 h-4" />
                  Desconectado
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Google Workspace</h3>
            <p className="text-obsidian-muted text-sm leading-relaxed mb-6">
              Sincroniza tu **Google Calendar** para que Chronos agende visitas y usa **Gmail** para enviar propuestas automáticas a tus leads.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs text-obsidian-muted">
                <Calendar className="w-4 h-4 text-obsidian-primary" />
                <span>Sincronización de disponibilidad en tiempo real</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-obsidian-muted">
                <Mail className="w-4 h-4 text-obsidian-primary" />
                <span>Envío de confirmaciones vía Gmail</span>
              </div>
            </div>
          </div>

          <div className="relative pt-6 border-t border-white/5 flex items-center justify-between">
            {googleStatus?.connected ? (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-obsidian-muted tracking-widest">Cuenta vinculada</span>
                <span className="text-sm font-medium text-white">{googleStatus.email || 'Cuenta de Google'}</span>
              </div>
            ) : (
              <button 
                onClick={handleConnectGoogle}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/10"
              >
                Conectar ahora
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            {googleStatus?.connected && (
              <button 
                onClick={handleConnectGoogle}
                className="p-3 text-obsidian-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                title="Re-conectar o Cambiar cuenta"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Placeholder for GHL / Meta / others if needed later */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card opacity-50 grayscale p-8 flex flex-col justify-between border-dashed"
        >
          <div>
             <div className="flex items-center justify-between mb-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Zap className="w-8 h-8 text-obsidian-muted" />
              </div>
              <span className="text-[10px] bg-white/5 text-obsidian-muted px-3 py-1 rounded-full uppercase font-bold">Próximamente</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Meta Ads Manager</h3>
            <p className="text-obsidian-muted text-sm">
              Sincroniza tus campañas de Instagram y Facebook directamente con el Agente de Performance.
            </p>
          </div>
          <div className="mt-8">
             <button disabled className="w-full px-6 py-3 bg-white/5 text-obsidian-muted rounded-xl font-bold cursor-not-allowed">
               Configurar
             </button>
          </div>
        </motion.div>
      </div>

      <section className="bg-obsidian-primary/5 border border-obsidian-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
           <h4 className="text-xl font-bold text-white">¿Necesitas seguridad adicional?</h4>
           <p className="text-sm text-obsidian-muted leading-relaxed">
             RORA utiliza cifrado de grado bancario para almacenar tus tokens de acceso. Nunca compartimos tu información con terceros y puedes revocar el acceso en cualquier momento desde tu cuenta de Google.
           </p>
        </div>
        <div className="w-full md:w-auto">
          <a href="https://support.google.com/accounts/answer/3466521" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-xs font-bold text-obsidian-primary hover:underline">
            Gestión de seguridad Google
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    </div>
  );
};
