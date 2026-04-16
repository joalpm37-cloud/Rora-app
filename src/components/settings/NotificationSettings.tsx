import React, { useState } from 'react';
import { Bell, Smartphone, Mail, MessageSquare } from 'lucide-react';

export const NotificationSettings: React.FC = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  return (
    <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-xl font-bold mb-6">Preferencias de Notificaciones</h3>
      <div className="space-y-6">
        
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Notificaciones por Email</h4>
              <p className="text-xs text-obsidian-muted mt-0.5">Recibe resúmenes diarios y alertas críticas por correo.</p>
            </div>
          </div>
          <button 
            onClick={() => setEmailNotif(!emailNotif)}
            className={`w-12 h-6 rounded-full transition-colors relative ${emailNotif ? 'bg-obsidian-primary' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${emailNotif ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Notificaciones Push</h4>
              <p className="text-xs text-obsidian-muted mt-0.5">Alertas en tiempo real en tu navegador y aplicación móvil.</p>
            </div>
          </div>
          <button 
            onClick={() => setPushNotif(!pushNotif)}
            className={`w-12 h-6 rounded-full transition-colors relative ${pushNotif ? 'bg-obsidian-primary' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${pushNotif ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-obsidian-primary/10 rounded-xl flex items-center justify-center text-obsidian-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Alertas SMS</h4>
              <p className="text-xs text-obsidian-muted mt-0.5">Para notificaciones urgentes e leads calientes.</p>
            </div>
          </div>
          <button 
            onClick={() => setSmsNotif(!smsNotif)}
            className={`w-12 h-6 rounded-full transition-colors relative ${smsNotif ? 'bg-obsidian-primary' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${smsNotif ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

      </div>
    </div>
  );
};
