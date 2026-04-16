import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { procesarMensajeRora } from './server/rora/agentes/rora-central.js';
import { crearContactoGHL } from './server/rora/utils/ghl-api.js';
import { db } from './server/lib/firebase.js';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { crearAgenteManaged } from './server/rora/utils/claude-api.js';
import SYSTEM_PROMPT_RORA from './server/rora/prompts/system-prompt-rora.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://app.rora.com.es']
}));
app.use(express.json());

// Health check / Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RORA Backend is running (Root Entry Point)' });
});

// NUEVO: Endpoint para inicializar Managed Agents
app.post('/api/rora/agents/setup', async (req, res) => {
  try {
    const agente = await crearAgenteManaged('RORA Central', SYSTEM_PROMPT_RORA);
    
    // Guardar el ID en Firebase para uso futuro
    await setDoc(doc(db, 'config', 'managed_agents'), {
      rora_central_id: agente.id,
      activatedAt: serverTimestamp(),
      model: agente.model
    });

    res.json({ 
      success: true, 
      agent_id: agente.id,
      message: 'Agente RORA Central activado correctamente en Anthropic' 
    });
  } catch (error) {
    console.error('Error configurando agentes:', error);
    res.status(500).json({ error: 'Fallo al activar Managed Agents' });
  }
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
    const contactResult = await crearContactoGHL(datosLead);
    
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
  console.log(`🚀 RORA Server (Root) running on port ${PORT}`);
});
