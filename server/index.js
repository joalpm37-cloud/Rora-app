import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// --- CONFIGURACIÓN BÁSICA INMEDIATA ---
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

// --- BINDEO DE PUERTO (ANTI-CRASH CLOUD RUN) ---
// Escuchamos inmediatamente para que Google Cloud Run no mate el contenedor por timeout.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RORA Backend (Anti-Crash) listening on port ${PORT}`);
  console.log(`📡 Deployment Mode: Full Restoration V4.2.0-STABLE`);
});

// --- ROUTES ---

// Health Check (Inmediato)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'anti-crash_lazy_binding',
    version: 'V4.2.0-STABLE',
    timestamp: new Date().toISOString()
  });
});

// Root API Handler (Para evitar 404 en navegadores)
app.get('/api', (req, res) => {
  res.json({
    message: "RORA API Gateway is operational",
    endpoints: ["/api/health", "/api/rora/chat", "/api/sales-agent/mensaje"],
    status: "online"
  });
});

// --- LAZY-LOADED ENDPOINTS ---

// Google Auth
app.get('/api/auth/google/url', async (req, res) => {
  try {
    const { getAuthUrl } = await import('./rora/utils/google-api.js');
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    res.json({ url: getAuthUrl(userId) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { handleAuthCallback } = await import('./rora/utils/google-api.js');
    const { code, state: userId } = req.query;
    if (!code || !userId) return res.status(400).send('Missing code or state');
    await handleAuthCallback(code, userId);
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.rora.com.es';
    res.redirect(`${frontendUrl}/integrations?status=success`);
  } catch (error) {
    res.status(500).send('Authentication failed');
  }
});

// GHL Proxy (Lazy)
app.get('/api/ghl/contacts', async (req, res) => {
  try { 
    const ghl = await import('./rora/utils/ghl-api.js');
    res.json(await ghl.obtenerContactosGHL(req.query.limit || 20)); 
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/ghl/conversations', async (req, res) => {
  try { 
    const ghl = await import('./rora/utils/ghl-api.js');
    res.json(await ghl.buscarConversacionesGHL()); 
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ghl/send', async (req, res) => {
  try { 
    const ghl = await import('./rora/utils/ghl-api.js');
    res.json(await ghl.enviarMensajeGHL(req.body.conversationId, req.body.text)); 
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reports (Lazy)
app.use('/api/reports', async (req, res, next) => {
  try {
    const { default: reportsRouter } = await import('./routes/reports.js');
    reportsRouter(req, res, next);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Property Management
app.post('/api/properties', async (req, res) => {
  try {
    const { getDb } = await import('./lib/firebase.js');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const propertyData = { ...req.body, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    const docRef = await addDoc(collection(getDb(), 'propiedades'), propertyData);
    res.json({ success: true, id: docRef.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Utils
app.post('/api/utils/pdf/generate', async (req, res) => {
  try {
    const { generarDossierPDF } = await import('./rora/utils/pdf-generator.js');
    res.json({ url: await generarDossierPDF(req.body) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/video/render', (req, res) => {
  res.status(503).json({ error: "Motor de video desactivado por contingencia de memoria." });
});

// Agentes
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
