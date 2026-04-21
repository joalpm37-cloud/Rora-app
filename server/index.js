import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

// --- HEALTH CHECK (Mantiene la Luz Verde) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'restoration_f2_stable',
    version: 'V4.0.0-LAZY'
  });
});

// --- GHL PROXY (Ligeros) ---
// Importamos solo lo necesario para que no pese en el arranque estático
import * as ghl from './rora/utils/ghl-api.js';

app.get('/api/ghl/contacts', async (req, res) => {
  try {
    const contacts = await ghl.obtenerContactosGHL(req.query.limit || 20);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/ghl/conversations', async (req, res) => {
  try {
    const convs = await ghl.buscarConversacionesGHL();
    res.json(convs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ghl/send', async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const result = await ghl.enviarMensajeGHL(conversationId, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AGENTES (Dinamismo Total) ---
// Usamos importación dinámica dentro del handler para evitar que pesen al arrancar el contenedor

app.post('/api/rora/chat', async (req, res) => {
  try {
    const { mensaje, historial } = req.body;
    // Carga diferida del módulo del agente
    const { procesarMensajeRora } = await import('./rora/agentes/rora-central.js');
    const result = await procesarMensajeRora(mensaje, historial || []);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error en /api/rora/chat:', error);
    res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { contactId, mensaje, historial } = req.body;
    const { procesarConversacionConLira } = await import('./rora/agentes/sales-agent.js');
    const resultado = await procesarConversacionConLira(contactId, historial || []);
    res.json({ success: true, ...resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bindeo rápido para Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RORA Core Restored (Lazy) on port ${PORT}`);
});
