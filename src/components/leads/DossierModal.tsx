import React, { useState } from 'react';
import { X, FileText, Download, MessageSquare, Loader2 } from 'lucide-react';
import { Lead } from '../../types';

import { getApiUrl } from '../../lib/api-client';

interface DossierModalProps {
  lead: Lead;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ lead, onClose }) => {
  const [presupuesto, setPresupuesto] = useState(lead.budget || 500000);
  const [zona, setZona] = useState(lead.zone || 'Cualquiera');
  const [habitaciones, setHabitaciones] = useState(3);
  const [caracteristicas, setCaracteristicas] = useState('Terraza, Piscina');

  const [isGenerating, setIsGenerating] = useState(false);
  const [dossierPath, setDossierPath] = useState<string | null>(null);
  const [dossierData, setDossierData] = useState<any>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setDossierPath(null);
    setDossierData(null);
    
    try {
      const perfilProps = {
        nombreCliente: lead.name,
        presupuestoMax: presupuesto,
        zonaPreferida: zona,
        habitacionesMin: habitaciones,
        caracteristicas: caracteristicas.split(',').map(s => s.trim())
      };
      
      const searchRes = await fetch(getApiUrl('/api/agents/explorer/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfilProps)
      });
      const resultado = await searchRes.json();
      setDossierData(resultado);

      // En el servidor genera el link simbólico/real
      const pdfRes = await fetch(getApiUrl('/api/utils/pdf/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultado)
      });
      const pdfData = await pdfRes.json();
      setDossierPath(pdfData.url);

    } catch (error) {
      console.error("Error generando dossier:", error);
      alert("Hubo un error al generar el dossier. Revisa la consola para más detalles.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!dossierPath) return;
    const link = document.createElement('a');
    link.href = dossierPath;
    link.download = `Dossier-${lead.name.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsApp = async () => {
    if (!dossierPath || !dossierData) return;
    setIsSending(true);
    try {
      // Intento enviar el mensaje con el link simbólico o el mensaje personalizado
      const payload = {
        type: "WhatsApp",
        contactId: lead.id,
        message: `${dossierData.mensaje_para_cliente}\n\nHe preparado este dossier personalizado para ti. Puedes descargarlo aquí (enlace temporal): ${lead.name}-dossier.pdf`
      };
      
      await fetch(getApiUrl('/api/ghl/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: "n/a", // The proxy handles the logic
          text: payload.message
        })
      });
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Error enviando WhatsApp");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden translate-y-0 scale-100 transition-all">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-obsidian-border flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-obsidian-primary" />
            <h2 className="text-lg font-bold text-white">Generar dossier para {lead.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="p-6 space-y-6">
          {!dossierPath ? (
            <>
              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase tracking-wider">
                    Presupuesto Máximo (€)
                  </label>
                  <input
                    type="number"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(Number(e.target.value))}
                    className="w-full bg-black/50 border border-obsidian-border rounded-lg px-4 py-2 text-white placeholder-obsidian-muted focus:outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase tracking-wider">
                    Zona Preferida
                  </label>
                  <input
                    type="text"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="w-full bg-black/50 border border-obsidian-border rounded-lg px-4 py-2 text-white placeholder-obsidian-muted focus:outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase tracking-wider">
                      Habitaciones Mínimas
                    </label>
                    <input
                      type="number"
                      value={habitaciones}
                      onChange={(e) => setHabitaciones(Number(e.target.value))}
                      className="w-full bg-black/50 border border-obsidian-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-obsidian-muted mb-1 uppercase tracking-wider">
                      Características Clave
                    </label>
                    <input
                      type="text"
                      value={caracteristicas}
                      onChange={(e) => setCaracteristicas(e.target.value)}
                      placeholder="Separadas por comas"
                      className="w-full bg-black/50 border border-obsidian-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-obsidian-primary text-obsidian-bg font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Explorer Agent buscando propiedades...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generar dossier
                  </>
                )}
              </button>
            </>
          ) : (
            // Pantalla de éxito
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">¡Dossier Generado!</h3>
                <p className="text-obsidian-muted mt-2 text-sm max-w-sm mx-auto">
                  El Explorer Agent ha encontrado opciones compatibles y el PDF está listo para presentarse.
                </p>
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/10"
                >
                  <Download className="w-5 h-5" />
                  Descargar dossier PDF
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  disabled={isSending || sendSuccess}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
                >
                  {isSending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : sendSuccess ? (
                    'Enviado ✓'
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Enviar por WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
