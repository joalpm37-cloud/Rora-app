import React, { useEffect, useState } from 'react';
import { onSnapshot, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, X, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QualificationNotifier: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<any>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'leads'),
      where('qualifiedAlert', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const leadDoc = snapshot.docs[0];
        setActiveAlert({ id: leadDoc.id, ...leadDoc.data() });
      } else {
        setActiveAlert(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDismiss = async () => {
    if (!activeAlert) return;
    try {
      const leadRef = doc(db, 'leads', activeAlert.id);
      await updateDoc(leadRef, { qualifiedAlert: false });
      setActiveAlert(null);
    } catch (err) {
      console.error("Error dismissing alert:", err);
    }
  };

  const handleAction = () => {
    window.location.href = `/leads`;
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[200] w-[320px] md:w-[400px]"
        >
          <div className="glass-card p-5 border-emerald-500/30 bg-emerald-500/10 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-obsidian-bg flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                    Oportunidad Detectada
                  </span>
                  <button onClick={handleDismiss} className="text-obsidian-muted hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white mt-1 truncate">
                  {activeAlert.name} ha sido Calificado
                </h3>
                <p className="text-xs text-obsidian-muted mt-1 leading-relaxed">
                  Lira ha detectado intereses claros y presupuesto compatible. ¡Intervén ahora!
                </p>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={handleAction}
                    className="flex-1 py-2 bg-emerald-500 text-obsidian-bg text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Ver Perfil
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
