import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Agents
import { procesarMensajeRora } from './rora/agentes/rora-central.js';
import { procesarMensajeSalesAgent } from './rora/agentes/sales-agent.js';
import { analizarCampanaActiva, crearEstructuraCampana } from './rora/agentes/performance-agent.js';
import { procesarSolicitudContenido } from './rora/agentes/content-agent.js';
import { buscarPropiedadesParaCliente } from './rora/agentes/explorer-agent.js';

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
import { generarDossierPDF } from './rora/utils/pdf-generator.js';

// ... (endpoints)

app.post('/api/utils/pdf/generate', async (req, res) => {
  try {
    const result = await generarDossierPDF(req.body);
    res.json({ url: result });
  } catch (error) {
    console.error('Error in /api/utils/pdf/generate:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); 
app.use(express.json());

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'V3.0.0-FLASH', message: 'RORA Backend is live and stable.' });
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
    const result = await procesarSolicitudContenido(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/agents/content/generate:', error);
    res.status(500).json({ error: 'Error in Content Agent' });
  }
});

app.post('/api/agents/explorer/search', async (req, res) => {
  try {
    const result = await buscarPropiedadesParaCliente(req.body);
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

    const resultado = await procesarMensajeSalesAgent({
      contactId,
      nombre,
      telefono,
      channel: finalChannel,
      mensaje,
      historial: historial || []
    });

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RORA Server running on port ${PORT}`);
});
