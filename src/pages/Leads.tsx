import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  UserPlus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, orderBy, collection, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { collections } from '../lib/collections';
import { Lead } from '../types';
import { LeadForm } from '../components/leads/LeadForm';
import { LeadProfile } from '../components/leads/LeadProfile';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { fetchGhlContacts } from '../lib/api-client';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{show: boolean, count: number}>({show: false, count: 0});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  useEffect(() => {
    const q = query(collections.leads, orderBy('createdAt', 'desc'));
    
    // Auto-sync GHL contacts on mount as requested
    const autoSync = async () => {
      try {
        await handleSyncGHL(true); // silent sync
      } catch (e) {
        console.error("Auto-sync failed", e);
      }
    };
    autoSync();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      } catch (e) {
        // Handled
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSyncGHL = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const ghlContacts = await fetchGhlContacts(100);
      let importedCount = 0;

      for (const contact of ghlContacts) {
        // Verificar si ya existe en Firebase
        const q = query(collection(db, 'leads'), where('ghl_id', '==', contact.id));
        const snap = await getDocs(q);

        if (snap.empty) {
          await addDoc(collection(db, 'leads'), {
            name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Sin nombre',
            email: contact.email || '',
            phone: contact.phone || '',
            ghl_id: contact.id,
            canal: "ghl",
            status: "new",
            score: 0,
            type: "buyer", // default
            createdAt: serverTimestamp()
          });
          importedCount++;
        }
      }

      if (!silent && importedCount > 0) {
        setSyncStatus({ show: true, count: importedCount });
        setTimeout(() => setSyncStatus({ show: false, count: 0 }), 5000);
      }
    } catch (err) {
      console.error("Error durante la sincronización GHL:", err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.phone.includes(searchQuery);
    return matchesSearch;
  });

  const handleCreateNew = () => {
    setLeadToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsFormOpen(true);
    setSelectedLead(null); // Close profile if open
  };

  return (
    <div className="space-y-8 relative">
      {syncStatus.show && (
        <div className="fixed top-24 right-8 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">Sincronización completa — {syncStatus.count} contactos importados</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contactos (Leads)</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Gestiona y califica tus prospectos con inteligencia artificial.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSyncGHL()}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Sincronizando..." : "Sincronizar GHL"}
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Lead
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..." 
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
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Nombre / Contacto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Estado</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">AI Score</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Zona</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-obsidian-muted">
                  Cargando leads...
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-obsidian-muted">
                  No se encontraron leads.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-obsidian-border flex items-center justify-center text-sm font-bold uppercase">
                        {lead.name.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{lead.name}</span>
                          {lead.ghl_id && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[9px] font-bold">GHL</span>
                          )}
                        </div>
                        <span className="text-xs text-obsidian-muted">{lead.email || lead.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                      lead.status === 'new' ? "bg-blue-500/10 text-blue-500" : 
                      lead.status === 'contacted' ? "bg-amber-500/10 text-amber-500" : 
                      lead.status === 'visit_scheduled' ? "bg-purple-500/10 text-purple-500" :
                      lead.status === 'closed' ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-rose-500/10 text-rose-500"
                    )}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-obsidian-border rounded-full overflow-hidden max-w-[60px]">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            lead.score > 80 ? "bg-emerald-500" : lead.score > 50 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{lead.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium capitalize">{lead.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-obsidian-muted">{lead.zone || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-obsidian-muted hover:text-white"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      {lead.email && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.open(`mailto:${lead.email}`); }}
                          className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-obsidian-muted hover:text-white"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(lead); }}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-obsidian-muted hover:text-white"
                      >
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

      {/* Modals & Slide-overs */}
      {isFormOpen && (
        <LeadForm 
          lead={leadToEdit} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}

      {selectedLead && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" 
            onClick={() => setSelectedLead(null)}
          />
          <LeadProfile 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)} 
            onEdit={handleEdit}
          />
        </>
      )}
    </div>
  );
};
