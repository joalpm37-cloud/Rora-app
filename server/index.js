import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { crearContactoGHL } from './rora/utils/ghl-api.js';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://app.rora.com.es']
}));
app.use(express.json());

// Health check / Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RORA Backend is running' });
});

// POST /api/rora/chat - Orquestador principal
app.post('/api/rora/chat', async (req, res) => {
  const { mensaje, historial } = req.body;
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje es requerido' });
  }

  try {
    const respuesta = await procesarMensajeRora(mensaje, historial || []);
    res.json(respuesta);
  } catch (error) {
    console.error('Error en /api/rora/chat:', error);
    res.status(500).json({ error: 'Error procesando el mensaje' });
  }
});

// POST /api/rora/lead - Integración manual/automática de leads
app.post('/api/rora/lead', async (req, res) => {
  const datosLead = req.body;
  
  try {
    // 1. Crear en GHL
    const contactResult = await crearContactoGHL(datosLead);
    
    // 2. Guardar en Firebase
    const docRef = await addDoc(collection(db, 'leads'), {
      ...datosLead,
      ghl_id: contactResult?.contacto?.id || null,
      createdAt: serverTimestamp(),
      status: 'new',
      source: 'ai_backend'
    });

    res.json({ 
      success: true, 
      id: docRef.id, 
      ghlCreated: !!contactResult?.contacto?.id 
    });
  } catch (error) {
    console.error('Error en /api/rora/lead:', error);
    res.status(500).json({ error: 'Error guardando el lead' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RORA Server running on http://localhost:${PORT}`);
});
