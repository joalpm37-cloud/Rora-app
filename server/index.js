import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { llamarAgenteManaged } from './rora/utils/claude-api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://app.rora.com.es']
}));
app.use(express.json());

// TEST Endpoint: Probar conexión con Claude (Sin entornos complejos)
app.post('/api/rora/agents/test', async (req, res) => {
  const { mensaje } = req.body;
  console.log('🤖 Realizando prueba de conexión Rora Vanilla...');
  
  try {
    const result = await llamarAgenteManaged(mensaje || 'Hola RORA, confirma conexión.');
    res.json({ 
      success: true, 
      version: 'V2.10.2',
      reply: result.reply,
      sessionId: result.sessionId
    });
  } catch (error) {
    console.error('❌ Error en prueba de conexión:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Main Chat Endpoint
app.post('/api/rora/chat', async (req, res) => {
  const { mensaje, sessionId } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje es requerido' });
  }

  try {
    const result = await llamarAgenteManaged(mensaje, sessionId);
    res.json({
      success: true,
      reply: result.reply,
      sessionId: result.sessionId
    });
  } catch (error) {
    console.error('Error en /api/rora/chat:', error);
    res.status(500).json({ 
      error: 'Error procesando el mensaje',
      success: false,
      reply: 'RORA está afinando la orquesta tecnológica. Reintenta en un momento.' 
    });
  }
});

// Lead Endpoint
app.post('/api/rora/lead', async (req, res) => {
  const datosLead = req.body;
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...datosLead,
      createdAt: serverTimestamp(),
      status: 'new',
      source: 'ai_backend'
    });
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error en /api/rora/lead:', error);
    res.status(500).json({ error: 'Error guardando el lead' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'V2.10.2', message: 'RORA Backend is live and stable.' });
});

app.listen(PORT, () => {
  console.log(`🚀 RORA Server running on port ${PORT}`);
});
