import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

let serviceAccount;

// 1. Intenta cargar desde variable de entorno (Recomendado para Render/Producción)
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        let jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        // Si no empieza con '{', probablemente es Base64
        if (jsonStr.trim() && !jsonStr.trim().startsWith('{')) {
            console.log("🔐 Firebase Admin: Detectado formato Base64, decodificando...");
            jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
        }
        serviceAccount = JSON.parse(jsonStr);
        console.log("🔐 Firebase Admin: Cargado desde variable de entorno.");
    } catch (e) {
        console.error("❌ Error parseando FIREBASE_SERVICE_ACCOUNT_JSON:", e.message);
    }
} 

// 2. Fallback a archivo local (Desarrollo)
if (!serviceAccount && fs.existsSync('./serviceAccountKey.json')) {
    serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
    console.log("🔐 Firebase Admin: Cargado desde archivo local.");
}

try {
    if (!admin.apps.length && serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "rora-app-d98e6.firebasestorage.app"
        });
        console.log("✅ Firebase Admin inicializado correctamente.");
    } else if (!serviceAccount) {
        console.warn("⚠️ Firebase Admin NO inicializado: Falta configuración o credenciales inválidas.");
    }
} catch (error) {
    console.error("❌ ERROR FATAL inicializando Firebase Admin:", error.message);
    // No relanzamos el error para permitir que el servidor Express arranque
}

export const dbAdmin = admin.firestore();
export default admin;
