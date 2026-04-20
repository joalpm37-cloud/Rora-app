import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  User,
  Filter
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { onSnapshot, query, where, orderBy, Timestamp, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { collections } from '../lib/collections';
import { CalendarEvent } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { NewEventModal } from '../components/calendar/NewEventModal';
import { getApiUrl } from '../lib/api-client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  useEffect(() => {
    if (!user) return;

    // Auto-sync GHL Slots
    const syncGhl = async () => {
      setIsSyncing(true);
      try {
        const response = await fetch(getApiUrl('/api/ghl/slots'));
        const slots = await response.json();
        for (const slot of slots) {
          // Verificar si ya existe por ghl_event_id
          const q = query(collection(db, 'calendarEvents'), where('ghl_event_id', '==', slot.id));
          const snap = await getDocs(q);
          
          if (snap.empty) {
            await addDoc(collection(db, 'calendarEvents'), {
              agencyId: user.agencyId || 'default-agency',
              agentId: user.uid,
              title: slot.title || 'Evento GHL',
              date: Timestamp.fromDate(new Date(slot.startTime)),
              time: format(new Date(slot.startTime), 'HH:mm'),
              type: "visit",
              ghl_event_id: slot.id,
              sincronizado: true,
              createdAt: Timestamp.now()
            });
          }
        }
      } catch (err) {
        console.error("Error syncing GHL slots:", err);
      } finally {
        setIsSyncing(false);
      }
    };
    syncGhl();

    // Fetch events for the user
    const q = query(
      collections.calendarEvents,
      where('agentId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CalendarEvent[];

      // Filter by date range in memory
      const filteredEvents = fetchedEvents.filter(event => {
        const eventDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });

      // Sort in memory
      filteredEvents.sort((a, b) => {
        const timeA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
        const timeB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
        return timeA - timeB;
      });

      setEvents(filteredEvents);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'calendarEvents');
      } catch (e) {
        // Handled
      }
    });

    return () => unsubscribe();
  }, [user, currentDate]); // Re-fetch when month changes

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);
      return isSameDay(eventDate, date);
    });
  };

  const selectedEvents = getEventsForDay(selectedDate);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-obsidian-muted mt-1 text-sm md:text-base">Gestiona tus visitas y eventos importantes.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-card border border-obsidian-border rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsNewEventModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-obsidian-primary text-obsidian-bg rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-4 md:p-6 overflow-x-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                Hoy
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 gap-px bg-obsidian-border rounded-xl overflow-hidden border border-obsidian-border">
              {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
                <div key={day} className="bg-obsidian-card p-4 text-center text-xs font-bold uppercase tracking-widest text-obsidian-muted">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "bg-obsidian-card min-h-[100px] p-2 cursor-pointer transition-all hover:bg-white/5 relative group",
                      !isCurrentMonth && "opacity-30",
                      isSelected && "bg-obsidian-primary/5 ring-1 ring-inset ring-obsidian-primary/30"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                        isToday && "bg-obsidian-primary text-obsidian-bg font-bold",
                        isSelected && !isToday && "text-obsidian-primary"
                      )}>
                        {format(day, 'd')}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] p-1.5 bg-obsidian-primary/10 text-obsidian-primary rounded-md truncate font-bold border border-obsidian-primary/20 flex items-center gap-1"
                        >
                          {event.ghl_event_id && <RefreshCw className="w-2 h-2 shrink-0" />}
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Events */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">
                Eventos para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsNewEventModalOpen(true);
                }}
                className="p-1 hover:bg-white/10 rounded-md transition-colors text-obsidian-primary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => {
                      setEditingEvent(event);
                      setIsNewEventModalOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-obsidian-primary">{event.title}</span>
                        {event.ghl_event_id && (
                          <span className="px-1 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-bold flex items-center gap-1">
                            <RefreshCw className="w-2 h-2" /> GHL
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-obsidian-muted uppercase tracking-widest">{event.time}</span>
                    </div>
                    <div className="space-y-2">
                      {event.clientName && (
                        <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                          <User className="w-3.5 h-3.5" />
                          <span>{event.clientName}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-obsidian-muted">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="w-12 h-12 text-obsidian-muted/20 mb-4" />
                  <p className="text-sm text-obsidian-muted">No hay eventos programados para este día.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold text-lg mb-6">Próximos eventos</h3>
            <div className="space-y-4">
              {events
                .filter(e => {
                  const eDate = e.date instanceof Timestamp ? e.date.toDate() : new Date(e.date);
                  return eDate >= new Date(); // Only future events
                })
                .slice(0, 3)
                .map((event) => {
                  const eDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);
                  return (
                    <div key={event.id} className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/5 rounded-xl shrink-0 border border-white/5">
                        <span className="text-[10px] font-bold uppercase text-obsidian-muted">{format(eDate, 'MMM', { locale: es })}</span>
                        <span className="text-lg font-bold leading-none">{format(eDate, 'd')}</span>
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-sm font-bold truncate">{event.title}</span>
                        <span className="text-xs text-obsidian-muted truncate">{event.time} {event.location ? `• ${event.location}` : ''}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {isNewEventModalOpen && (
        <NewEventModal
          onClose={() => {
            setIsNewEventModalOpen(false);
            setEditingEvent(null);
          }}
          selectedDate={selectedDate}
          event={editingEvent}
        />
      )}
    </div>
  );
};
