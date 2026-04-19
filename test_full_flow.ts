import dotenv from 'dotenv';
import { dbAdmin } from './src/lib/firebase-admin.js';
import { procesarMensajeSalesAgent } from './rora/agentes/sales-agent.js';

dotenv.config();

async function testFullFlow() {
  console.log("🚀 Iniciando # TEST DE FLUJO COMPLETO: LEAD ENTRANTE (Gemini 2.0)");
  
  const datosLead = {
    nombre: 'Juan Pérez',
    interes: 'Departamento Moderno',
    canal: 'whatsapp',
    mensaje: 'Hola, vi el anuncio del departamento moderno y me interesa.'
  };

  try {
    // 1. ESCRITURA EN FIREBASE (Admin)
    console.log("📝 Paso 1: Intentando guardar lead en 'leads' con Admin SDK...");
    let leadId = "mock_lead_123";
    
    try {
      const docRef = await dbAdmin.collection('leads').add({
        name: datosLead.nombre,
        notes: `Interés: ${datosLead.interes}`,
        status: 'new',
        source: 'meta_ads',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      leadId = docRef.id;
      console.log(`✅ Lead creado con éxito en Firebase. ID: ${leadId}`);
    } catch (dbError) {
      console.error("❌ Error escribiendo en Firebase (Admin):", dbError.message);
      console.log("ℹ️ Verificando si es por falta de credenciales (JSON)...");
    }

    // 2. ACTIVACIÓN DE LYRA (VENTAS)
    console.log(`🤖 Paso 2: Activando Agente Lyra para ${datosLead.nombre}...`);
    
    try {
      const resultado = await procesarMensajeSalesAgent({
        contactId: leadId,
        nombre: datosLead.nombre,
        mensaje: datosLead.mensaje,
        canal: datosLead.canal,
        historial: []
      });

      console.log("\n💬 REPORTE DE MENSAJE (LYRA AI):");
      console.log("--------------------------------------------------");
      console.log(resultado.respuesta);
      console.log("--------------------------------------------------");
      
      console.log("\n📊 ESTADO DEL ANALISIS (AI ANALYSIS):");
      console.log(JSON.stringify(resultado.clasificacion, null, 2));

    } catch (aiError) {
      console.error("❌ Error en el Agente (AI):", aiError.message);
    }

  } catch (error) {
    console.error("❌ Error catastrófico en el test:", error);
  }
}

testFullFlow();
