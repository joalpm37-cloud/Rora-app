import React from 'react';
import { CreditCard, Download, Zap, Check } from 'lucide-react';

export const BillingSettings: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Current Plan */}
      <div className="glass-card p-8 border border-obsidian-primary/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-obsidian-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">RORA Platinum</h3>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider">Activo</span>
            </div>
            <p className="text-obsidian-muted">Plan anual. Próxima factura el 15 de Mayo, 2026.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-2xl font-bold">€299</p>
              <p className="text-xs text-obsidian-muted">/mes, facturado anualmente</p>
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">
              Gestionar Plan
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-obsidian-primary/10 text-obsidian-primary flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm">Agentes IA Ilimitados</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-obsidian-primary/10 text-obsidian-primary flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm">Soporte 24/7 Dedicado</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-obsidian-primary/10 text-obsidian-primary flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <span className="text-sm">Marca Blanca (White-label)</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-obsidian-primary" />
          Método de Pago
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="24" rx="4" fill="#253B80"/>
                <circle cx="12" cy="12" r="7" fill="#EB001B"/>
                <circle cx="24" cy="12" r="7" fill="#F79E1B"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Mastercard terminada en 4242</p>
              <p className="text-xs text-obsidian-muted">Expira 12/28</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors">
            Actualizar
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-bold mb-6">Historial de Facturación</h3>
        <div className="space-y-4">
          {[
            { id: 'INV-2026-003', date: 'Abr 15, 2026', amount: '€299.00', status: 'Pagado' },
            { id: 'INV-2026-002', date: 'Mar 15, 2026', amount: '€299.00', status: 'Pagado' },
            { id: 'INV-2026-001', date: 'Feb 15, 2026', amount: '€299.00', status: 'Pagado' },
          ].map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border-b border-obsidian-border last:border-0 hover:bg-white/5 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-xs font-bold text-obsidian-muted">DOC</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{invoice.id}</p>
                  <p className="text-xs text-obsidian-muted">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold">{invoice.amount}</span>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-bold uppercase tracking-wider hidden sm:block">
                  {invoice.status}
                </span>
                <button className="p-2 text-obsidian-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
