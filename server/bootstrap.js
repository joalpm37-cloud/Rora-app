/**
 * RORA BOOTSTRAPPER (Blackbox Diagnostic Tool)
 * 
 * Este archivo sirve como punto de entrada de emergencia para capturar errores 
 * que ocurren durante la carga de módulos (imports) en Cloud Run.
 */

console.log("🛠️  [BOOTSTRAP] Iniciando secuencia de arranque de RORA AI...");

// Diagnóstico de entorno (solo longitudes por seguridad)
console.log("🔍 [BOOTSTRAP] Verificando secretos...");
['GEMINI_API_KEY', 'GHL_LOCATION_ID', 'FIREBASE_SERVICE_ACCOUNT_JSON'].forEach(key => {
    const val = process.env[key] || '';
    console.log(`📡 [BOOTSTRAP] Variable ${key}: ${val ? `OK (Longitud: ${val.length})` : 'VACÍA ❌'}`);
});

async function startApp() {
  try {
    // Importamos dinámicamente la aplicación principal
    console.log("📦 [BOOTSTRAP] Cargando index.js...");
    await import('./index.js');
    console.log("✅ [BOOTSTRAP] Secuencia de carga completada con éxito.");
  } catch (error) {
    console.error("🚨 [BOOTSTRAP] ERROR FATAL EN EL ARRANQUE:");
    console.error("--------------------------------------------------");
    console.error(error);
    console.error("--------------------------------------------------");
    console.error("🔌 [BOOTSTRAP] Mensaje:", error.message);
    console.error("📂 [BOOTSTRAP] Stack:", error.stack);
    
    // Mantenemos el proceso vivo unos segundos para que Cloud Run 
    // termine de volcar los logs a la consola antes de morir.
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  }
}

// Escuchar cierres inesperados
process.on('uncaughtException', (err) => {
    console.error('🔥 [BOOTSTRAP] Excepción no capturada:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 [BOOTSTRAP] Rechazo de promesa no manejado:', reason);
});

startApp();
