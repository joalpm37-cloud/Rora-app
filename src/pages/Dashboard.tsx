import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, orderBy, onSnapshot, limit, where, Timestamp, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getApiUrl } from '../lib/api-client';

import { 
  Users, 
  Eye, 
  CheckCircle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Bot,
  Clock,
  Check,
  RefreshCw
} from 'lucide-react';
import { VoiceCommandCenter } from '../components/dashboard/VoiceCommandCenter';

const StatCard = ({ icon: Icon, label, value, change, trend }: any) => (
  <div className="bg-[#0F2A1A] rounded-2xl border border-obsidian-border p-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : 
        trend === 'down' ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-obsidian-muted"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
         trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
        {change}
      </div>
    </div>
    <div>
      <p className="text-obsidian-muted text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-medium mt-1">{value}</h3>
    </div>
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  
  // Real-time KPIs
  const [kpis, setKpis] = useState({
    totalLeads: { value: '0', change: '—', trend: 'none' },
    scheduledVisits: { value: '0', change: '—', trend: 'none' },
    successfulClosures: { value: '0', change: '—', trend: 'none' },
    avgCpl: { value: '€0.00', change: '—', trend: 'none' }
  });

  // Chart Data
  const [chartData, setChartData] = useState<any[]>([]);

  // Agents & Activity
  const [agents, setAgents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // 1. Aprobaciones Pendientes
    const qApprovals = query(
      collection(db, 'aprobaciones_pendientes'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubApprovals = onSnapshot(qApprovals, (snapshot) => {
      setPendingApprovals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Total Leads & Successful Closures
    const unsubLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
      const allLeads = snapshot.docs.map(doc => doc.data());
      const total = allLeads.length;
      const closures = allLeads.filter(l => l.status === 'closed' || l.status === 'ganado').length;
      
      setKpis(prev => ({
        ...prev,
        totalLeads: { ...prev.totalLeads, value: total.toLocaleString() },
        successfulClosures: { ...prev.successfulClosures, value: closures.toLocaleString() }
      }));

      // Chart Data: Last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dayStr = format(d, 'eee', { locale: es });
        const count = allLeads.filter(l => {
          const createdAt = l.createdAt?.toDate ? l.createdAt.toDate() : new Date(l.createdAt);
          return format(createdAt, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
        }).length;
        return { name: dayStr, value: count };
      });
      setChartData(last7Days);
    });

    // 3. Visitas Agendadas
    const qVisits = query(collection(db, 'calendarEvents'), where('date', '>=', Timestamp.now()));
    const unsubVisits = onSnapshot(qVisits, (snapshot) => {
      setKpis(prev => ({
        ...prev,
        scheduledVisits: { ...prev.scheduledVisits, value: snapshot.docs.length.toString() }
      }));
    });

    // 4. Avg CPL
    const unsubCampanas = onSnapshot(collection(db, 'campanas'), (snapshot) => {
      const campanas = snapshot.docs.map(doc => doc.data());
      const totalCpl = campanas.reduce((sum, c) => sum + (c.cpl_promedio || 0), 0);
      const avg = campanas.length > 0 ? totalCpl / campanas.length : 0;
      setKpis(prev => ({
        ...prev,
        avgCpl: { ...prev.avgCpl, value: `€${avg.toFixed(2)}` }
      }));
    });

    // 5. Agentes Config
    const unsubAgents = onSnapshot(collection(db, 'agentes-config'), (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        color: doc.data().estado === 'activo' ? 'emerald' : 
               doc.data().estado === 'mantenimiento' ? 'amber' : 'rose'
      }));
      setAgents(agentsData);
    });

    // 6. Actividad Reciente (Logs)
    const qLogs = query(collection(db, 'logs-agentes'), orderBy('timestamp', 'desc'), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        const d = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000);
        const timeAgo = diff < 1 ? 'Justo ahora' : diff < 60 ? `Hace ${diff} min` : `Hace ${Math.floor(diff/60)}h`;
        
        return {
          id: doc.id,
          user: data.agente,
          action: data.mensaje.split(' ').slice(0, 3).join(' '),
          target: data.mensaje.split(' ').slice(3).join(' '),
          time: timeAgo
        };
      });
      setRecentActivity(logs);
    });

    return () => {
      unsubApprovals();
      unsubLeads();
      unsubVisits();
      unsubCampanas();
      unsubAgents();
      unsubLogs();
    };
  }, []);

  const [ghlStats, setGhlStats] = useState({
    lastSync: 'Nunca',
    totalGhl: 0,
    totalRora: 0,
    isSyncing: false
  });

  useEffect(() => {
    const fetchGhlStats = async () => {
      try {
        const leadsSnap = await getDocs(query(collection(db, 'leads'), where('ghl_id', '!=', null)));
        setGhlStats(prev => ({ ...prev, totalRora: leadsSnap.size }));
        
        // This is a bit heavy but requested - using proxy
        const response = await fetch(getApiUrl('/api/ghl/contacts?limit=1'));
        const ghlContacts = await response.json();
        setGhlStats(prev => ({ ...prev, totalGhl: '100+' as any })); 
      } catch (e) {
        console.error(e);
      }
    };
    fetchGhlStats();
  }, [kpis.totalLeads]);

  const handleFullSync = async () => {
    setGhlStats(prev => ({ ...prev, isSyncing: true }));
    try {
      // Execute sync logic via proxy
      const response = await fetch(getApiUrl('/api/ghl/contacts?limit=100'));
      const ghlContacts = await response.json();
      let imported = 0;
      for (const contact of ghlContacts) {
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
            type: "buyer",
            createdAt: Timestamp.now()
          });
          imported++;
        }
      }
      setGhlStats(prev => ({ 
        ...prev, 
        lastSync: new Date().toLocaleTimeString(), 
        totalRora: prev.totalRora + imported 
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setGhlStats(prev => ({ ...prev, isSyncing: false }));
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Panel de control</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Bienvenido de nuevo, Administrador.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="flex-1 md:flex-none px-4 py-2 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            Exportar reporte
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Leads" {...kpis.totalLeads} />
        <StatCard icon={Eye} label="Visitas agendadas" {...kpis.scheduledVisits} />
        <StatCard icon={CheckCircle} label="Cierres exitosos" {...kpis.successfulClosures} />
        <StatCard icon={DollarSign} label="CPL Promedio" {...kpis.avgCpl} />
      </div>

      {/* Estado de sincronización GHL */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-emerald-500 bg-emerald-500/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <RefreshCw className={cn("w-5 h-5", ghlStats.isSyncing && "animate-spin")} />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white">Estado de sincronización GHL</h4>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-obsidian-muted">Última vez: <span className="text-white font-medium">{ghlStats.lastSync}</span></span>
              <span className="text-xs text-obsidian-muted">GHL: <span className="text-white font-medium">{ghlStats.totalGhl}</span></span>
              <span className="text-xs text-obsidian-muted">Rora: <span className="text-white font-medium">{ghlStats.totalRora}</span></span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleFullSync}
          disabled={ghlStats.isSyncing}
          className="w-full md:w-auto px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {ghlStats.isSyncing ? "Sincronizando..." : "Sincronizar ahora"}
          {!ghlStats.isSyncing && <RefreshCw className="w-3 h-3" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Rendimiento semanal</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-obsidian-bg border border-obsidian-border text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:border-obsidian-primary transition-colors focus:border-obsidian-primary appearance-none"
            >
              <option value="7d">Últimos 7 días (Leads)</option>
              <option value="30d" disabled>Últimos 30 días</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                  dx={-10} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#22C55E' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22C55E" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-6">
          <h3 className="font-bold text-lg">Estado Agentes IA</h3>
          <div className="space-y-4">
            {agents.length === 0 ? (
              <div className="text-xs text-obsidian-muted text-center py-4">Sincronizando agentes...</div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      agent.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
                      agent.color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{agent.nombre}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                    agent.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" : 
                    agent.color === 'amber' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {agent.estado}
                  </span>
                </div>
              ))
            )}
          </div>
          <button className="mt-auto w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            Ver todos los agentes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Aprobaciones pendientes</h3>
            <button className="text-obsidian-primary text-sm font-medium hover:underline">Ver todas</button>
          </div>
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
               <div className="text-sm text-obsidian-muted p-4 bg-white/5 rounded-xl text-center">
                 Al día. No hay aprobaciones pendientes.
               </div>
            ) : (
                pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-obsidian-border/50 hover:border-obsidian-primary/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{item.title}</span>
                      <span className="text-xs text-obsidian-muted mt-0.5">{item.type} • {item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                        <Clock className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Actividad reciente</h3>
            <MoreHorizontal className="w-5 h-5 text-obsidian-muted cursor-pointer" />
          </div>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <div className="text-sm text-obsidian-muted py-4 text-center">Sin actividad reciente.</div>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-obsidian-primary shrink-0" />
                  <div className="flex flex-col">
                    <p className="text-sm">
                      <span className="font-bold">{item.user}</span> {item.action} <span className="font-bold text-obsidian-primary">{item.target}</span>
                    </p>
                    <span className="text-xs text-obsidian-muted mt-1">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <VoiceCommandCenter />
    </div>
  );
};
