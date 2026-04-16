import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Globe, 
  Database, 
  Zap
} from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { BillingSettings } from '../components/settings/BillingSettings';
import { DomainSettings } from '../components/settings/DomainSettings';
import { IntegrationSettings } from '../components/settings/IntegrationSettings';
import { AISettings } from '../components/settings/AISettings';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Perfil de Agencia');

  const tabs = [
    { icon: User, label: 'Perfil de Agencia' },
    { icon: Shield, label: 'Seguridad y Accesos' },
    { icon: Bell, label: 'Notificaciones' },
    { icon: CreditCard, label: 'Facturación y Planes' },
    { icon: Globe, label: 'Dominio y Branding' },
    { icon: Database, label: 'Integraciones CRM' },
    { icon: Zap, label: 'Configuración AI' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Perfil de Agencia':
        return <ProfileSettings />;
      case 'Seguridad y Accesos':
        return <SecuritySettings />;
      case 'Notificaciones':
        return <NotificationSettings />;
      case 'Facturación y Planes':
        return <BillingSettings />;
      case 'Dominio y Branding':
        return <DomainSettings />;
      case 'Integraciones CRM':
        return <IntegrationSettings />;
      case 'Configuración AI':
        return <AISettings />;
      default:
        return (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold mb-2">Próximamente</h3>
            <p className="text-obsidian-muted">La sección <b>{activeTab}</b> estará disponible pronto.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Administra tu perfil de agencia, integraciones y facturación.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "flex-none lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                activeTab === item.label ? "bg-obsidian-primary/10 text-obsidian-primary border border-obsidian-primary/20" : "text-obsidian-muted hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
