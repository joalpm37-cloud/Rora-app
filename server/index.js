import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

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

// --- HEALTH CHECK (STABLE) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'full_restoration_f3_final',
    version: 'V4.1.0-STABLE'
  });
});

// --- GOOGLE AUTH ENDPOINTS ---
import { getAuthUrl, handleAuthCallback } from './rora/utils/google-api.js';

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
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.rora.com.es';
    res.redirect(`${frontendUrl}/integrations?status=success`);
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// --- GHL PROXY ---
import * as ghl from './rora/utils/ghl-api.js';
app.get('/api/ghl/contacts', async (req, res) => {
  try { res.json(await ghl.obtenerContactosGHL(req.query.limit || 20)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/ghl/conversations', async (req, res) => {
  try { res.json(await ghl.buscarConversacionesGHL()); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/ghl/send', async (req, res) => {
  try { res.json(await ghl.enviarMensajeGHL(req.body.conversationId, req.body.text)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// --- REPORTS ROUTER ---
import reportsRouter from './routes/reports.js';
app.use('/api/reports', reportsRouter);

// --- PROPERTY MANAGEMENT ---
app.post('/api/properties', async (req, res) => {
  try {
    const propertyData = { ...req.body, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'propiedades'), propertyData);
    res.json({ success: true, id: docRef.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- VIDEO & PDF ---
app.post('/api/utils/pdf/generate', async (req, res) => {
  try {
    const { generarDossierPDF } = await import('./rora/utils/pdf-generator.js');
    res.json({ url: await generarDossierPDF(req.body) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/video/render', (req, res) => {
  res.status(503).json({ error: "Motor de video desactivado por contingencia de memoria." });
});

// --- AGENTES (LAZY) ---
app.post('/api/rora/chat', async (req, res) => {
  try {
    const { procesarMensajeRora } = await import('./rora/agentes/rora-central.js');
    res.json({ success: true, ...await procesarMensajeRora(req.body.mensaje, req.body.historial || []) });
  } catch (e) { res.status(500).json({ error: 'Error in Rora Agent' }); }
});

app.post('/api/agents/performance/analyze', async (req, res) => {
  try {
    const { analizarCampanaActiva } = await import('./rora/agentes/performance-agent.js');
    res.json(await analizarCampanaActiva(req.body));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/agents/explorer/search', async (req, res) => {
  try {
    const { buscarAlternativasConAtlas } = await import('./rora/agentes/explorer-agent.js');
    res.json(await buscarAlternativasConAtlas(req.body));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/agents/content/generate', async (req, res) => {
  try {
    const { generarContenidoConLumen } = await import('./rora/agentes/content-agent.js');
    res.json(await generarContenidoConLumen(req.body));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { procesarConversacionConLira } = await import('./rora/agentes/sales-agent.js');
    res.json({ success: true, ...await procesarConversacionConLira(req.body.contactId, req.body.historial || []) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bindeo rápido para Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RORA Full Core Restored (Lazy) on port ${PORT}`);
});
