import { crearEstructuraCampana } from './rora/agentes/performance-agent.js';

async function testPerformanceAgent() {
  console.log("--- TEST PERFORMANCE AGENT ---");
  const datos = {
    nombrePropiedad: "Villa Marítima Marbella",
    presupuestoDiario: 50,
    duracionDias: 30,
    objetivo: "leads"
  };

  try {
    const estructura = await crearEstructuraCampana(datos);
    console.log(JSON.stringify(estructura, null, 2));
  } catch (error) {
    console.error("Error en el test:", error);
  }
}

testPerformanceAgent();
