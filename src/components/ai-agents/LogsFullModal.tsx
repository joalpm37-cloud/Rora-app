import React, { useState, useEffect } from 'react';
import { X, Download, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogEntry {
  id: string;
  tipo: 'completado' | 'proceso' | 'error' | 'info';
  agente: string;
  mensaje: string;
  timestamp: any;
}

interface LogsFullModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogsFullModal: React.FC<LogsFullModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterAgent, setFilterAgent] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, 'logs-agentes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
      setLogs(docs);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filterAgent !== 'Todos' && log.agente !== filterAgent) return false;
    
    // Normalize type string for matching if 'Todos' is not selected
    if (filterType !== 'Todos') {
      const fType = filterType.toLowerCase() === 'en proceso' ? 'proceso' : filterType.toLowerCase();
      if (log.tipo !== fType) return false;
    }

    if (filterDateFrom || filterDateTo) {
      const logDate = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      if (filterDateFrom && logDate < new Date(filterDateFrom)) return false;
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        if (logDate > toDate) return false;
      }
    }
    return true;
  });

  const downloadCSV = () => {
    const header = ['Fecha', 'Hora', 'Agente', 'Tipo', 'Mensaje'];
    const rows = filteredLogs.map(log => {
      const dateObj = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toTimeString().split(' ')[0];
      return [`"${date}"`, `"${time}"`, `"${log.agente}"`, `"${log.tipo}"`, `"${log.mensaje.replace(/"/g, '""')}"`].join(',');
    });
    const csvContent = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logs_sistema.csv';
    link.click();
  };

  const getTypeStyle = (tipo: string) => {
    switch (tipo) {
      case 'completado': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'proceso': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'error': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toTimeString().split(' ')[0];
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-obsidian-bg border border-obsidian-border rounded-2xl w-[90vw] h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border bg-white/5 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Historial de logs del sistema
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-obsidian-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-b border-obsidian-border bg-obsidian-card shrink-0 flex flex-wrap items-end gap-4 relative z-10">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">Agente</label>
            <select 
              value={filterAgent} 
              onChange={e => setFilterAgent(e.target.value)}
              className="bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 w-full"
            >
              <option value="Todos">Todos</option>
              <option value="CRM Agent">CRM Agent</option>
              <option value="Content Agent">Content Agent</option>
              <option value="Performance Agent">Performance Agent</option>
              <option value="Explorer Agent">Explorer Agent</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">Tipo</label>
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 w-full"
            >
              <option value="Todos">Todos</option>
              <option value="Completado">Completado</option>
              <option value="En proceso">En proceso</option>
              <option value="Error">Error</option>
              <option value="Info">Info</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">Desde</label>
            <input 
              type="date" 
              value={filterDateFrom}
              onChange={e => setFilterDateFrom(e.target.value)}
              className="bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 w-full [color-scheme:dark]"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-widest text-obsidian-muted">Hasta</label>
            <input 
              type="date"
              value={filterDateTo}
              onChange={e => setFilterDateTo(e.target.value)}
              className="bg-obsidian-bg border border-obsidian-border rounded-xl px-3 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors text-gray-200 w-full [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-obsidian-bg relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-obsidian-card z-10 border-b border-obsidian-border shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted w-[100px]">Hora</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted w-[200px]">Agente</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted w-[150px]">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-obsidian-muted">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-border">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors font-mono text-sm">
                  <td className="px-6 py-4 text-obsidian-muted whitespace-nowrap">
                    [{formatTime(log.timestamp)}]
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-bold">
                    {log.agente}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-widest border", getTypeStyle(log.tipo))}>
                      {log.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {log.mensaje}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-obsidian-muted font-sans">
                    No se encontraron logs con estos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-obsidian-border bg-obsidian-card shrink-0 flex items-center justify-between">
          <span className="text-sm text-obsidian-muted">
            Mostrando {filteredLogs.length} de {logs.length} logs totales
          </span>
          <button 
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors border border-white/5"
          >
            <Download className="w-4 h-4" />
            Exportar logs
          </button>
        </div>
      </div>
    </div>
  );
};
