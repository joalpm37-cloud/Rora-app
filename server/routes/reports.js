import express from 'express';
import { db } from '../lib/firebase.js';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  Timestamp,
  startAt,
  endAt
} from 'firebase/firestore';

const router = express.Router();

router.get('/voice', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    let reportText = "";

    // 1. AGENDA DE HOY
    const qToday = query(
      collection(db, 'calendarEvents'),
      where('date', '>=', Timestamp.fromDate(today)),
      where('date', '<', Timestamp.fromDate(tomorrow)),
      orderBy('date', 'asc')
    );
    const snapToday = await getDocs(qToday);
    
    if (snapToday.size > 0) {
      reportText += `Hoy tienes ${snapToday.size} compromisos: `;
      snapToday.forEach(doc => {
        const data = doc.data();
        reportText += `${data.title} a las ${data.time}. `;
      });
    } else {
      reportText += "No tienes eventos programados para hoy. ";
    }

    // 2. CITAS DE VISITA/VENTA PRÓXIMAS (Top Semanal)
    const qWeek = query(
      collection(db, 'calendarEvents'),
      where('date', '>=', Timestamp.fromDate(tomorrow)),
      where('date', '<', Timestamp.fromDate(nextWeek)),
      orderBy('date', 'asc'),
      limit(10)
    );
    const snapWeek = await getDocs(qWeek);
    
    const importantEvents = snapWeek.docs
      .map(d => d.data())
      .filter(e => ['visit', 'meeting', 'negotiation'].includes(e.type) || e.title.toLowerCase().includes('venta'))
      .slice(0, 2); // Tomamos 2 eventos clave

    if (importantEvents.length > 0) {
      reportText += `Para esta semana, tienes ${importantEvents.length} citas críticas de venta. `;
      importantEvents.forEach(e => {
        const d = e.date.toDate();
        reportText += `${e.title}, el ${d.toLocaleDateString()}. `;
      });
    }

    // 3. LEADS CALIFICADOS CON ALTO PRESUPUESTO
    const qLeads = query(
      collection(db, 'leads'),
      where('status', '==', 'qualified'),
      orderBy('budget', 'desc'),
      limit(2)
    );
    const snapLeads = await getDocs(qLeads);
    const topLeads = snapLeads.docs.map(d => d.data());

    if (topLeads.length > 0) {
      reportText += `Atlas ha identificado leads con presupuesto superior a ${topLeads[0].budget} euros que deberías contactar hoy mismo. `;
    }

    // 4. ALERTAS URGENTES O TAREAS PENDIENTES
    const qTasks = query(
      collection(db, 'tasks'),
      where('priority', '==', 'high'),
      where('status', '!=', 'completed'),
      limit(1)
    );
    const snapTasks = await getDocs(qTasks);
    if (!snapTasks.empty) {
      reportText += `Aura te recuerda que tienes una tarea urgente pendiente: ${snapTasks.docs[0].data().title}. `;
    }

    // 4. RESUMEN DE AGENTES (Mini-hitos)
    const qLumen = query(collection(db, 'logs-agentes'), where('agente', '==', 'Lumen'), orderBy('timestamp', 'desc'), limit(1));
    const snapLumen = await getDocs(qLumen);
    if (!snapLumen.empty) {
      reportText += `Lumen terminó de pulir el último video para la propiedad en la zona norte. `;
    }

    res.json({ success: true, report: reportText });

  } catch (error) {
    console.error("Error generating voice report:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
