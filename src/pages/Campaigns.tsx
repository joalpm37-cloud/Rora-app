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
  MousePointer2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { Campaign } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { NewCampaignModal } from '../components/campaigns/NewCampaignModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

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

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const avgCpl = totalLeads > 0 ? totalSpent / totalLeads : 0;

  return (
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
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">CTR</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-border">
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-obsidian-muted text-sm">
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
                      campaign.status === 'Activa' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">€{campaign.budget.toLocaleString()}</span>
                      <span className="text-[10px] text-obsidian-muted">Gastado: €{campaign.spent.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold">{campaign.leads}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">€{campaign.cpl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {campaign.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold">{campaign.ctr}%</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-obsidian-muted hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
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
    </div>
  );
};
