import { llamarAgenteManaged } from './server/rora/utils/claude-api.js';
import dotenv from 'dotenv';
dotenv.config();

async function testJosephPena() {
  console.log('🧪 Iniciando prueba de búsqueda para: Joseph Peña');
  
  try {
    const result = await llamarAgenteManaged('Busca el contacto de Joseph Peña por favor.');
    console.log('\n✅ Respuesta de Rora:');
    console.log('-----------------------------------');
    console.log(result.reply);
    console.log('-----------------------------------');
  } catch (error) {
    if (error.message.includes('403')) {
        console.error('\n❌ ERROR 403 (Región Bloqueada):');
        console.log('Tal como sospechábamos, desde tu IP local (España) Anthropic sigue bloqueando la petición.');
        console.log('Para que Rora funcione, debemos ejecutarla desde el servidor de Render (Ohio).');
    } else {
        console.error('\n❌ Error inesperado:', error.message);
    }
  }
}

testJosephPena();
