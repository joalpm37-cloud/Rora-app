import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Agentes
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { procesarConversacionConLira } from './rora/agentes/sales-agent.js';
import { analizarCampanaActiva, crearEstructuraCampana } from './rora/agentes/performance-agent.js';
import { generarContenidoConLumen } from './rora/agentes/content-agent.js';
import { buscarAlternativasConAtlas } from './rora/agentes/explorer-agent.js';
import { createCalendarEvent, sendGmail } from './rora/utils/google-api.js';
import { renderPropiedadVideo } from './rora/video/videoRenderer.js';

// Utils
import { 
  buscarConversacionesGHL, 
  obtenerMensajesGHL, 
  enviarMensajeGHL,
  obtenerContactosGHL,
  obtenerSlotsCalendario,
  crearContactoGHL,
  buscarContactoGHL,
  crearCitaGHL
} from './rora/utils/ghl-api.js';
import reportsRouter from './routes/reports.js';
import { generarDossierPDF } from './rora/utils/pdf-generator.js';
import { getAuthUrl, handleAuthCallback } from './rora/utils/google-api.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import admin from './lib/firebase-admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: [
    'https://rora-app-d98e6.web.app',
    'https://rora-app-d98e6.firebaseapp.com',
    'https://app.rora.com.es',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})); 
app.use(express.json());

// Routes
app.use('/api/reports', reportsRouter);

// --- ENDPOINTS ---

app.post('/api/utils/pdf/generate', async (req, res) => {
  try {
    const result = await generarDossierPDF(req.body);
    res.json({ url: result });
  } catch (error) {
    console.error('Error in /api/utils/pdf/generate:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'propiedades'), propertyData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error in POST /api/properties:', error);
    res.status(500).json({ error: 'Error saving property' });
  }
});

// --- GOOGLE AUTH ENDPOINTS ---

app.get('/api/auth/google/url', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const url = getAuthUrl(userId);
  res.json({ url });
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) return res.status(400).send('Missing code or state');

  try {
    await handleAuthCallback(code, userId);
    // Redirigir de vuelta al frontend (ajustar URL según entorno)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/integrations?status=success`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/auth/google/status/:userId', async (req, res) => {
  try {
    const docRef = doc(db, 'user-integrations', req.params.userId);
    const snap = await getDoc(docRef);
    const isConnected = snap.exists() && snap.data().google?.status === 'active';
    res.json({ connected: isConnected, email: snap.data()?.google?.tokens?.email });
  } catch (error) {
    res.status(500).json({ error: 'Error checking status' });
  }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: 'V3.1.0-STABLE', 
    message: 'RORA Backend - Google Cloud Run optimized deployment active.' 
  });
});

// --- GHL PROXY ENDPOINTS ---

app.get('/api/ghl/contacts', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const contacts = await obtenerContactosGHL(limit);
    res.json(contacts);
  } catch (error) {
    console.error('Error in /api/ghl/contacts:', error);
    res.status(500).json({ error: 'Error fetching GHL contacts' });
  }
});

app.post('/api/ghl/contacts/create', async (req, res) => {
  try {
    const result = await crearContactoGHL(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/ghl/contacts/create:', error);
    res.status(500).json({ error: 'Error creating contact' });
  }
});

app.post('/api/ghl/contacts/search', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await buscarContactoGHL(query);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/ghl/contacts/search:', error);
    res.status(500).json({ error: 'Error searching contact' });
  }
});

app.get('/api/ghl/conversations', async (req, res) => {
  try {
    const convs = await buscarConversacionesGHL();
    res.json(convs);
  } catch (error) {
    console.error('Error in /api/ghl/conversations:', error);
    res.status(500).json({ error: 'Error fetching GHL conversations' });
  }
});

app.get('/api/ghl/messages/:id', async (req, res) => {
  try {
    const msgs = await obtenerMensajesGHL(req.params.id);
    res.json(msgs);
  } catch (error) {
    console.error('Error in /api/ghl/messages:', error);
    res.status(500).json({ error: 'Error fetching GHL messages' });
  }
});

app.post('/api/ghl/send', async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const result = await enviarMensajeGHL(conversationId, text);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/ghl/send:', error);
    res.status(500).json({ error: 'Error sending GHL message' });
  }
});

app.get('/api/ghl/slots', async (req, res) => {
  try {
    const slots = await obtenerSlotsCalendario();
    res.json(slots);
  } catch (error) {
    console.error('Error in /api/ghl/slots:', error);
    res.status(500).json({ error: 'Error fetching GHL slots' });
  }
});

app.post('/api/ghl/appointments/create', async (req, res) => {
  try {
    const result = await crearCitaGHL(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/ghl/appointments/create:', error);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

// --- AI AGENT PROXY ENDPOINTS ---

app.post('/api/agents/performance/analyze', async (req, res) => {
  try {
    const result = await analizarCampanaActiva(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/agents/performance/analyze:', error);
    res.status(500).json({ error: 'Error in Performance Agent analysis' });
  }
});

app.post('/api/agents/performance/campaign/create', async (req, res) => {
  try {
    const result = await crearEstructuraCampana(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/agents/performance/campaign/create:', error);
    res.status(500).json({ error: 'Error in Performance Agent creation' });
  }
});

app.post('/api/agents/content/generate', async (req, res) => {
  try {
    const result = await generarContenidoConLumen(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/agents/content/generate:', error);
    res.status(500).json({ error: 'Error in Content Agent' });
  }
});

app.post('/api/video/render', async (req, res) => {
  const { propiedadId, videoConfig, type } = req.body;
  
  if (!propiedadId) {
    return res.status(400).json({ error: 'Falta propiedadId' });
  }

  try {
    console.log(`🎬 Pipeline de Video iniciado para: ${propiedadId}`);
    
    // 1. Obtener datos de la propiedad
    const propRef = doc(db, 'propiedades', propiedadId);
    const propSnap = await getDoc(propRef);
    if (!propSnap.exists()) throw new Error("Propiedad no encontrada");
    const propiedadData = propSnap.data();

    // 2. Si es tipo Lumen, generamos la dirección de arte si no viene dada
    let finalConfig = videoConfig;
    if (type === 'LUMEN_VIDEO_RENDER' && !finalConfig) {
      console.log("🎨 Solicitando dirección de arte a Lumen AI...");
      const lumenResult = await generarContenidoConLumen(propiedadData);
      finalConfig = lumenResult.videoConfig;
    }

    if (!finalConfig) throw new Error("Configuración de video no disponible");

    // 3. Responder al cliente que el proceso ha empezado (Async)
    res.json({ success: true, message: 'Renderizado en proceso...' });

    // 4. Ejecución en segundo plano
    (async () => {
      try {
        const localFilePath = await renderPropiedadVideo(propiedadId, finalConfig);
        
        // 5. Subir a Firebase Storage
        console.log("☁️ Subiendo video a Firebase Storage...");
        const bucket = admin.storage().bucket();
        const destination = `videos/${propiedadId}/${Date.now()}.mp4`;
        
        const [file] = await bucket.upload(localFilePath, {
          destination,
          metadata: { contentType: 'video/mp4' }
        });

        // Hacerlo público
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

        // 6. Actualizar Firestore
        await updateDoc(propRef, {
          videoUrl: publicUrl,
          videoGeneratedAt: serverTimestamp(),
          videoStatus: 'completed'
        });

        // 7. Cleanup local
        fs.unlinkSync(localFilePath);
        console.log(`✅ Video completado y disponible en: ${publicUrl}`);

      } catch (innerError) {
        console.error("❌ Error en el proceso de renderizado:", innerError);
        await updateDoc(propRef, { videoStatus: 'error', videoError: innerError.message });
      }
    })();

  } catch (error) {
    console.error('Error in /api/video/render:', error);
    res.status(500).json({ error: 'Error al iniciar pipeline de video' });
  }
});

app.post('/api/agents/explorer/search', async (req, res) => {
  try {
    const result = await buscarAlternativasConAtlas(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/agents/explorer/search:', error);
    res.status(500).json({ error: 'Error in Explorer Agent' });
  }
});

// --- RORA ORCHESTRATOR & SALES AGENT ---

app.post('/api/rora/chat', async (req, res) => {
  const { mensaje, sessionId, historial } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Mensaje es requerido' });

  try {
    console.log('🤖 RORA Orquestador (Prod) procesando...');
    const result = await procesarMensajeRora(mensaje, historial || []);
    res.json({
      success: true,
      reply: result.mensajeParaMostrar || '',
      accion: result.accion,
      datos: result.datos,
      sessionId: sessionId || `session_${Date.now()}`,
      version: 'V3.0.0-FLASH'
    });
  } catch (error) {
    console.error('Error en /api/rora/chat:', error);
    res.status(500).json({ error: 'Error procesando el mensaje', success: false });
  }
});

app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { contactId, nombre, telefono, canal, mensaje, historial, type, source, direction } = req.body;
    
    // Identificación dinámica del canal (WA/IG)
    const normalizedChannel = (type || source || canal || 'sms').toLowerCase();
    const finalChannel = normalizedChannel.includes('whatsapp') ? 'whatsapp' : 
                         normalizedChannel.includes('instagram') ? 'instagram' : 'sms';
    
    // Filtro: Solo inbound
    if (direction && direction !== 'inbound') {
      return res.json({ success: true, message: 'Mensaje saliente ignorado' });
    }

    console.log(`📥 [Prod] Procesando mensaje de ${nombre || contactId} canal: ${finalChannel}`);

    const resultado = await procesarConversacionConLira(
      contactId || req.body.leadId,
      historial || [{ sender: 'lead', text: mensaje }]
    );

    res.json({ success: true, ...resultado });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// --- SCHEDULER AGENT ---

app.post('/api/agents/scheduler/suggest', async (req, res) => {
  const { userId, leadData } = req.body;
  try {
    const result = await sugerirCitasParaLead(userId, leadData);
    res.json(result);
  } catch (error) {
    console.error('Error in Scheduler Agent:', error);
    res.status(500).json({ error: 'Error in Scheduler Agent' });
  }
});

app.post('/api/agents/scheduler/book', async (req, res) => {
  const { userId, leadId, appointment, leadEmail } = req.body;
  try {
    const event = {
      summary: `Visita Inmobiliaria: ${appointment.descripcion}`,
      description: `Cita agendada via RORA AI para el lead ${leadId}`,
      start: { dateTime: `${appointment.fecha}T${appointment.hora_inicio}:00`, timeZone: 'Europe/Madrid' },
      end: { dateTime: `${appointment.fecha}T${appointment.hora_fin}:00`, timeZone: 'Europe/Madrid' },
      attendees: [{ email: leadEmail }]
    };

    const calendarEvent = await createCalendarEvent(userId, event);
    
    // Notificación via Gmail
    await sendGmail(userId, {
      to: leadEmail,
      subject: 'Confirmación de Visita Inmobiliaria',
      body: `<h1>Cita Confirmada</h1><p>Tu visita para <b>${appointment.descripcion}</b> ha sido agendada para el ${appointment.fecha} a las ${appointment.hora_inicio}.</p>`
    });

    res.json({ success: true, event: calendarEvent });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Error booking appointment' });
  }
});

// --- START SERVER ---
try {
  console.log("🚀 Starting RORA Backend...");
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`📦 Port: ${PORT}`);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ RORA Backend listening on port ${PORT}`);
    console.log(`🔥 Firebase Admin Status: ${admin.apps.length > 0 ? 'CONNECTED' : 'NOT CONNECTED'}`);
  });
} catch (error) {
  console.error("❌ CRITICAL ERROR during server startup:", error);
  process.exit(1);
}
