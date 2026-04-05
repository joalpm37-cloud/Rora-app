import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { onSnapshot, query, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { collections } from '../lib/collections';
import { Notification, NotificationStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { db } from '../lib/firebase';

export const CommandCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collections.notifications,
      where('targetUserId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort in memory to avoid composite index requirement initially
      notifs.sort((a, b) => {
        const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      } catch (e) {
        // Handled
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAction = async (notification: Notification, newStatus: NotificationStatus) => {
    try {
      const notifRef = doc(db, 'notifications', notification.id);
      await updateDoc(notifRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      // Optional Webhook Call
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'notification_resolved',
              notificationId: notification.id,
              status: newStatus,
              userId: user?.uid,
              data: notification.data
            })
          });
        } catch (webhookError) {
          console.error('Webhook call failed:', webhookError);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
      alert('Error al actualizar la notificación.');
    }
  };

  const pendingNotifs = notifications.filter(n => n.status === 'pending');
  const historyNotifs = notifications.filter(n => n.status !== 'pending');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Centro de Mando</h1>
        <p className="text-obsidian-muted mt-1 text-sm md:text-base">Notificaciones y aprobaciones pendientes.</p>
      </header>

      {loading ? (
        <div className="glass-card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-obsidian-primary/30 border-t-obsidian-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-obsidian-primary" />
              Acciones Pendientes ({pendingNotifs.length})
            </h2>
            
            {pendingNotifs.length > 0 ? (
              <div className="space-y-4">
                {pendingNotifs.map(notif => (
                  <div key={notif.id} className="glass-card p-6 border-l-4 border-l-obsidian-primary">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-obsidian-primary/10 text-obsidian-primary rounded-md">
                            {notif.agentType}
                          </span>
                          {notif.priority === 'urgent' && (
                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 rounded-md">
                              Urgente
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg">{notif.title}</h3>
                        <p className="text-sm text-obsidian-muted mt-1">{notif.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleAction(notif, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                        <button 
                          onClick={() => handleAction(notif, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl text-sm font-bold transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-12 h-12 text-green-500/50 mb-4" />
                <p className="text-lg font-bold">Todo al día</p>
                <p className="text-sm text-obsidian-muted mt-1">No tienes acciones pendientes por revisar.</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-obsidian-muted" />
              Historial
            </h2>
            
            <div className="glass-card p-6">
              {historyNotifs.length > 0 ? (
                <div className="space-y-4">
                  {historyNotifs.slice(0, 10).map(notif => (
                    <div key={notif.id} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors">
                      <div className="mt-0.5">
                        {notif.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{notif.title}</p>
                        <p className="text-xs text-obsidian-muted mt-0.5">
                          {notif.status === 'approved' ? 'Aprobado' : 'Rechazado'} • {notif.agentType}
                        </p>
                      </div>
                    </div>
                  ))}
                  {historyNotifs.length > 10 && (
                    <button className="w-full py-2 text-xs font-bold text-obsidian-primary hover:bg-obsidian-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1">
                      Ver todo el historial <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-obsidian-muted">El historial está vacío.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
