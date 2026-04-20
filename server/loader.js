import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🚀 RORA LOADER (Atomic Binding)
 * Abre el puerto de inmediato para evitar el timeout de Cloud Run.
 */
const loader = express();
const PORT = process.env.PORT || 8080;

// Bindeo instantáneo (Seguridad para Cloud Run)
loader.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 [LOADER] Puerto ${PORT} asegurado.`);
});

// Ruta de "Supervivencia" (Responde aunque el núcleo falle)
loader.get('/loader-status', (req, res) => {
    res.json({ status: 'alive', mode: 'atomic_loader' });
});

// CARGA DEL NÚCLEO RORA
async function loadCore() {
    try {
        console.log("📦 [LOADER] Importando RORA Core...");
        const { default: app } = await import('./index.js');
        
        // Acoplamos las rutas de index.js directamente al cargador
        loader.use(app);
        
        console.log("✅ [LOADER] Módulos cargados y rutas acopladas.");
    } catch (err) {
        console.error("🚨 [LOADER] Error FATAL cargando index.js:");
        console.error(err);
    }
}

loadCore();
