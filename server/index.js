import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { crearContactoGHL } from './rora/utils/ghl-api.js';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { crearAgenteManaged, llamarAgenteManaged } from './rora/utils/claude-api.js';
import SYSTEM_PROMPT_RORA from './rora/prompts/system-prompt-rora.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'https://app.rora.com.es']
}));
app.use(express.json());

// TEST: Probar el agente Managed (ID Proporcionado por el Usuario)
app.post('/api/rora/agents/test', async (req, res) => {
  const { mensaje } = req.body;
  const AGENT_ID = 'agent_011Ca82NXWoe3hWykRQCd6bv'; 

  try {
    console.log(`🤖 Iniciando diagnóstico profundo de Agente Managed (${AGENT_ID})...`);
    
    // Paso 1: Crear o definir el entorno ( Ohio context)
    const commonHeaders = {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'managed-agents-2026-04-01',
      'Content-Type': 'application/json'
    };

    console.log('🌐 Creando entorno de ejecución...');
    const envResp = await fetch('https://api.anthropic.com/v1/environments', {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({
        name: "Rora Orchestrator Sandbox (Diagnostic)",
        config: { type: "cloud", networking: { type: "unrestricted" } }
      })
    });

    const envData = await envResp.json();
    if (!envResp.ok) throw new Error(`Error en entorno: ${JSON.stringify(envData)}`);
    
    const envId = envData.id;
    console.log(`✅ Entorno temporal listo: ${envId}`);

    // Paso 2: Usar el puente de sesiones para hablar con Rora
    console.log(`🔗 Llamando a llamarAgenteManaged con Agent:${AGENT_ID} y Env:${envId}`);
    const respuesta = await llamarAgenteManaged(AGENT_ID, mensaje || 'Hola RORA, preséntate como Directora de Orquesta.', envId);
    
    res.json({ 
      success: true, 
      version: 'V2.5.1',
      agent_id: AGENT_ID,
      environment_id: envId,
      respuesta 
    });
  } catch (error) {
    console.error('❌ Error en orquestación de prueba (V2.5.1):', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check / Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RORA Backend is running (V2.5.1 - Deep Logging Active)' });
});

// NUEVO: Endpoint para inicializar Managed Agents (Duplicado por redundancia)
app.post('/api/rora/agents/setup', async (req, res) => {
  try {
    const agente = await crearAgenteManaged('RORA Central', SYSTEM_PROMPT_RORA);
    console.log('✅ Agente creado en Anthropic ID:', agente.id);
    
    let firebaseSaved = false;
    try {
      // Intentar guardar el ID en Firebase
      await setDoc(doc(db, 'config', 'managed_agents'), {
        rora_central_id: agente.id,
        activatedAt: serverTimestamp(),
        model: agente.model
      });
      firebaseSaved = true;
    } catch (dbError) {
      console.error('⚠️ Error guardando en Firebase (Permisos):', dbError.message);
    }

    res.json({ 
      success: true, 
      agent_id: agente.id,
      firebaseSaved,
      message: firebaseSaved 
        ? 'Agente RORA Central activado y guardado en Firebase' 
        : 'Agente activado en Anthropic, pero falló guardado en Firebase (Usa el agent_id manualmente)'
    });
  } catch (error) {
    console.error('Error configurando agentes (redundancia):', error);
    res.status(500).json({ 
      error: 'Fallo al activar Managed Agents',
      details: error.message,
      stack: error.stack
    });
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
