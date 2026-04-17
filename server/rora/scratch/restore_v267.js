import fs from 'fs';
import path from 'path';

const BACKUP_DIR = './server/rora/backups/v267';

const filesToRestore = [
  'claude-api.js',
  'index.js',
  'backend-rora.js'
];

const targetPaths = {
  'claude-api.js': 'server/rora/utils/claude-api.js',
  'index.js': 'server/index.js',
  'backend-rora.js': 'backend-rora.js'
};

async function runRestore() {
  console.log("🛡️ Restaurando sistema a V2.6.7 (Modo Seguro)...");
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error("❌ No se encontró el directorio de backup.");
    return;
  }

  filesToRestore.forEach(fileName => {
    const backupPath = path.join(BACKUP_DIR, fileName);
    const targetPath = targetPaths[fileName];

    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, targetPath);
      console.log(`✅ Restaurado: ${fileName}`);
    } else {
      console.warn(`⚠️ No se encontró backup para: ${fileName}`);
    }
  });

  console.log("\n✅ Sistema restaurado a la versión de alta estabilidad V2.6.7.");
}

runRestore();
