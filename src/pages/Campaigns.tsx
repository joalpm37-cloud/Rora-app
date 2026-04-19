import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Instagram, 
  Facebook, 
  Globe,
  DollarSign,
  Users,
  MousePointer2,
  X,
  Target
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { Campaign } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { NewCampaignModal } from '../components/campaigns/NewCampaignModal';

const getApiUrl = (path: string) => {
  const base = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://rora-app.onrender.com';
  return `${base}${path}`;
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  useEffect(() => {
    if (!user?.agencyId) return;

    const q = query(
      collections.campaigns,
      where('agencyId', '==', user.agencyId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCampaigns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(fetchedCampaigns);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'campaigns');
      } catch (e) {
        // Handled
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalizar = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsAnalysing(true);
    try {
      const response = await fetch(getApiUrl('/api/agents/performance/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpl: campaign.cpl || 0,
          ctr: campaign.ctr || 0,
          leads: campaign.leads || 0,
          gasto: campaign.spent || 0
        })
      });

      if (!response.ok) throw new Error('Error al analizar con IA');
      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error("Error analysing campaign:", error);
    } finally {
      setIsAnalysing(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (campaign.platform && campaign.platform.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
  const avgCpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

  return (
    <div className="relative min-h-screen pb-20">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Campañas</h1>
            <p className="text-obsidian-muted mt-1 text-sm md:text-base">Gestiona y optimiza tus campañas de marketing digital.</p>
          </div>
          <button 
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nueva Campaña
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-obsidian-muted">Gasto total</span>
            </div>
            <h3 className="text-2xl font-bold">€{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5% vs mes anterior</span>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-obsidian-muted">Total Leads</span>
            </div>
            <h3 className="text-2xl font-bold">{totalLeads.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-xs text-emerald-500 mt-2">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2% vs mes anterior</span>
            </div>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                <MousePointer2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-obsidian-muted">CPL Promedio</span>
            </div>
            <h3 className="text-2xl font-bold">€{avgCpl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 text-xs text-rose-500 mt-2">
              <TrendingDown className="w-3 h-3" />
              <span>-4.3% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar campañas..." 
              className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-obsidian-border bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Campaña / Plataforma</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Estado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Presupuesto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Leads</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">CPL</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-border">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-obsidian-muted text-sm">
                    No hay campañas que mostrar.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          {campaign.platform === 'Instagram' ? <Instagram className="w-4 h-4" /> : 
                          campaign.platform === 'Facebook' ? <Facebook className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{campaign.name}</span>
                          <span className="text-xs text-obsidian-muted">{campaign.platform}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                        campaign.status === 'Activa' ? "bg-emerald-500/10 text-emerald-500" : 
                        campaign.status === 'Lista para lanzar' ? "bg-obsidian-primary/10 text-obsidian-primary" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">€{(campaign.budget || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-obsidian-muted">Gastado: €{(campaign.spent || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold">{campaign.leads || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">€{(campaign.cpl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {campaign.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAnalizar(campaign)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-obsidian-primary/10 text-obsidian-primary border border-obsidian-primary/20 rounded-lg text-xs font-bold hover:bg-obsidian-primary/20 transition-colors"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          Analizar
                        </button>
                        <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-obsidian-muted hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {isNewCampaignModalOpen && (
          <NewCampaignModal onClose={() => setIsNewCampaignModalOpen(false)} />
        )}

        {/* Panel de Análisis Lateral */}
        {selectedCampaign && (
          <div className="fixed inset-y-0 right-0 w-[400px] bg-obsidian-bg border-l border-obsidian-border z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Análisis IA</h2>
                  <p className="text-xs text-obsidian-muted truncate max-w-[200px]">{selectedCampaign.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCampaign(null)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-100px)]">
              {isAnalysing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                  <div className="w-12 h-12 border-4 border-obsidian-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-obsidian-muted">Performance Agent analizando métricas...</p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <p className="text-[10px] text-obsidian-muted font-bold uppercase mb-1">Estado</p>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        analysis.estado_general === 'saludable' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {analysis.estado_general}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <p className="text-[10px] text-obsidian-muted font-bold uppercase mb-1">CPL Actual</p>
                      <p className="text-xl font-bold">€{analysis.metricas_actuales?.cpl}</p>
                    </div>
                  </div>

                  {analysis.alertas && analysis.alertas.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-obsidian-muted uppercase tracking-widest">Alertas Críticas</h4>
                      {analysis.alertas.map((alerta: any, i: number) => (
                        <div key={i} className={cn(
                          "p-4 rounded-xl border flex flex-col gap-2",
                          alerta.nivel === 'danger' ? "bg-rose-500/5 border-rose-500/20" : "bg-amber-500/5 border-amber-500/20"
                        )}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", alerta.nivel === 'danger' ? "bg-rose-500" : "bg-amber-500")} />
                            <p className="text-xs font-bold">{alerta.problema}</p>
                          </div>
                          <p className="text-[11px] text-obsidian-muted">{alerta.accion_inmediata}</p>
                          <button className="mt-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold transition-colors">
                            Ejecutar Resolución
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {analysis.acciones_automaticas && analysis.acciones_automaticas.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-obsidian-muted uppercase tracking-widest">Optimizaciones Ejecutadas</h4>
                      <div className="space-y-2">
                        {analysis.acciones_automaticas.map((accion: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] text-emerald-500">
                            <Target className="w-3.5 h-3.5" />
                            {accion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-sm text-obsidian-muted">No se pudo obtener el análisis.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
