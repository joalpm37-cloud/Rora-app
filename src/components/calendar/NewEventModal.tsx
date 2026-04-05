import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, User as UserIcon, FileText } from 'lucide-react';
import { addDoc, Timestamp } from 'firebase/firestore';
import { collections } from '../../lib/collections';
import { useAuth } from '../../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';
import { EventType } from '../../types';

interface NewEventModalProps {
  onClose: () => void;
  selectedDate?: Date;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ onClose, selectedDate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '12:00',
    type: 'meeting' as EventType,
    clientName: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // Create a Date object from the date and time strings
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      const eventDate = new Date(year, month - 1, day, hours, minutes);

      await addDoc(collections.calendarEvents, {
        agencyId: user.agencyId || 'default-agency',
        agentId: user.uid,
        title: formData.title,
        date: Timestamp.fromDate(eventDate),
        time: formData.time,
        type: formData.type,
        clientName: formData.clientName,
        location: formData.location,
        createdAt: Timestamp.now()
      });
      
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calendarEvents');
      alert('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <h2 className="text-xl font-bold">Nuevo Evento</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-obsidian-muted mb-1">Título del evento *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-obsidian-card border border-obsidian-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
                placeholder="Ej. Reunión con cliente"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-obsidian-muted mb-1">Fecha *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-obsidian-muted mb-1">Hora *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-obsidian-muted mb-1">Tipo de evento *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                <select
                  required
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as EventType})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors appearance-none"
                >
                  <option value="meeting">Reunión</option>
                  <option value="visit">Visita</option>
                  <option value="call">Llamada</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-obsidian-muted mb-1">Cliente (Opcional)</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  placeholder="Nombre del cliente"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-obsidian-muted mb-1">Ubicación (Opcional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
                  placeholder="Dirección o enlace"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-obsidian-border bg-obsidian-card flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-obsidian-bg border border-obsidian-border rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="event-form"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
};
