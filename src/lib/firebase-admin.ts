import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Intentamos inicializar con Credenciales de Aplicación Predeterminadas (ADC)
// o con variables de entorno específicas si no hay archivo JSON
import fs from "fs";
import path from "path";

try {
  if (!admin.apps.length) {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "rora-app-d98e6";
    const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${projectId}.firebasestorage.app`
      });
      console.log(`✅ Firebase Admin inicializado con serviceAccountKey.json para: ${projectId}`);
    } else {
      admin.initializeApp({
        projectId: projectId,
        storageBucket: `${projectId}.firebasestorage.app`
      });
      console.log(`⚠️ Firebase Admin inicializado sin JSON (solo projectId): ${projectId}`);
    }
  }
} catch (error) {
  console.error("❌ Error inicializando Firebase Admin:", error.message);
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();
export const storageAdmin = admin.storage();

export default admin;
