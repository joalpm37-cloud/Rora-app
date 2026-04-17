import fs from 'fs';
import path from 'path';

// Snapshot de seguridad V2.6.7 (Stable Loop)
const BACKUP_DIR = './server/rora/backups/v267';

const filesToBackup = [
  'server/rora/utils/claude-api.js',
  'server/index.js',
  'backend-rora.js'
];

async function runBackup() {
  console.log("🛡️ Iniciando backup preventivo de Rora V2.6.7...");
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  filesToBackup.forEach(file => {
    const fileName = path.basename(file);
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(BACKUP_DIR, fileName));
      console.log(`✅ Backup creado: ${fileName}`);
    } else {
      console.warn(`⚠️ Archivo no encontrado: ${file}`);
    }
  });

  console.log("\n🚀 Punto de restauración creado con éxito. Iniciando despliegue de Rora Prime...");
}

runBackup();
