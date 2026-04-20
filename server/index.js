import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';

// --- ARRANQUE ATÓMICO (Línea 10) ---
// Abrimos el puerto de inmediato para evitar el timeout de Cloud Run
const app = express();
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RORA Backend is live on port ${PORT}`);
});

// Importaciones pesadas (Firestore, Agentes, etc.)
// Nota: En ESM estas se ejecutan antes del código de arriba, pero al ser
// el mismo archivo, Node.js las procesa en orden de aparición.
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import admin from './lib/firebase-admin.js';

// Agentes
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { procesarConversacionConLira } from './rora/agentes/sales-agent.js';
import { analizarCampanaActiva, crearEstructuraCampana } from './rora/agentes/performance-agent.js';
import { generarContenidoConLumen } from './rora/agentes/content-agent.js';
import { buscarAlternativasConAtlas } from './rora/agentes/explorer-agent.js';
import { createCalendarEvent, sendGmail } from './rora/utils/google-api.js';

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
    version: 'V3.3.0-PHOENIX', 
    message: 'RORA Backend - Fusion Core Active.' 
  });
});

app.get('/', (req, res) => {
  res.send('<h1>RORA AI Backend</h1><p>Status: Operating</p>');
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
  return res.status(503).json({ 
    success: false, 
    error: "Motor de video desactivado por contingencia de memoria en Cloud Run.",
    status: 503
  });
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
    const normalizedChannel = (type || source || canal || 'sms').toLowerCase();
    const finalChannel = normalizedChannel.includes('whatsapp') ? 'whatsapp' : 
                         normalizedChannel.includes('instagram') ? 'instagram' : 'sms';
    
    if (direction && direction !== 'inbound') {
      return res.json({ success: true, message: 'Mensaje saliente ignorado' });
    }

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
