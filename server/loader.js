import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const loader = express();
const PORT = process.env.PORT || 8080;

// 1. ABRIR EL PUERTO INSTANTÁNEAMENTE
// Esto satisface a Google Cloud Run en milisegundos.
const bridge = loader.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 [LOADER] Puerto ${PORT} asegurado. Avisando a Cloud Run...`);
});

// 2. HEALTH CHECK BÁSICO (Para que Google vea que respondemos)
loader.get('/api/health', (req, res) => {
    res.json({ 
        status: 'booting', 
        message: 'RORA Phoenix is rising...', 
        timestamp: new Date().toISOString() 
    });
});

// 3. CARGA DINÁMICA DE LA APP REAL
// Al usar import() dentro de una función, evitamos el "bloqueo" de hoisting del ESM.
async function bootstrap() {
    try {
        console.log("📦 [LOADER] Iniciando carga de módulos pesados (RORA Core)...");
        
        // Importamos dinámicamente el index.js real
        // Nota: El index.js real ya no debe intentar llamar a app.listen() por su cuenta,
        // o debe detectar si ya hay un puerto abierto.
        const { default: app } = await import('./index.js');
        
        // 4. TRANSFERENCIA DE RUTAS
        // Inyectamos la app real dentro del cargador que ya tiene el puerto.
        loader.use(app);
        
        console.log("✅ [LOADER] RORA Core acoplado con éxito al puerto activo.");
    } catch (err) {
        console.error("🚨 [LOADER] Error fatal cargando RORA Core:");
        console.error(err);
        // No salimos del proceso para que el contenedor no entre en bucle de reinicio infinito
        // al menos así podemos entrar por SSH o ver logs.
    }
}

bootstrap();
