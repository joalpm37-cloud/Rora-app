import express from 'express';
import dotenv from 'dotenv';
import { procesarMensajeSalesAgent } from './rora/agentes/sales-agent.js';

dotenv.config();

const app = express();
app.use(express.json());

// Endpoint (webhook) para recibir mensajes desde GHL
app.post('/api/sales-agent/mensaje', async (req, res) => {
  try {
    const { contactId, nombre, telefono, canal, mensaje, historial } = req.body;

    // Llamamos a la lógica del Agente de Ventas
    const resultado = await procesarMensajeSalesAgent({
      contactId,
      nombre,
      telefono,
      canal,
      mensaje,
      historial: historial || []
    });

    // Devolver la respuesta en el formato JSON esperado
    res.json({
      respuesta: resultado.respuesta,
      clasificacion: resultado.clasificacion,
      siguientePaso: resultado.siguientePaso
    });

  } catch (error) {
    console.error('Error en el webhook /api/sales-agent/mensaje:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de Webhooks de RORA escuchando en el puerto ${PORT}`);
});
