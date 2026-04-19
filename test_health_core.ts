import dotenv from 'dotenv';
import { db, auth } from './src/lib/firebase.js';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

dotenv.config();

async function runHealthCheck() {
  console.log("🏥 Iniciando Health Check con Auth...");
  
  try {
    // 1. Intentar Auth Anónimo
    try {
      console.log("🔐 Intentando login anónimo...");
      await signInAnonymously(auth);
      console.log("✅ Autenticado anónimamente.");
    } catch (authError) {
      console.warn("⚠️ Login anónimo falló (probablemente desactivado en consola):", authError.message);
    }

    // 2. Probar Firebase
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, limit(1));
    const snapshot = await getDocs(q);
    
    console.log(`📡 Firebase: Conectado. Propiedades encontradas: ${snapshot.size}`);

    // 3. Probar Gemini Key
    const key = process.env.GEMINI_API_KEY;
    console.log(`🔑 Gemini Key Status: ${(!key || key === 'TU_GEMINI_API_KEY') ? '❌ PENDIENTE' : '✅ CONFIGURADA'}`);

    console.log("✅ Prueba de salud completada.");
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error("❌ Firebase: Error de Permisos. (Las reglas requieren usuario autenticado)");
    } else {
      console.error("❌ Error en Health Check:", error);
    }
  }
}

runHealthCheck();
