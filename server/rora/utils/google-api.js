import { google } from 'googleapis';
import { db } from '../../lib/firebase.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:10000/api/auth/google/callback';

export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Genera la URL de autenticación
 */
export function getAuthUrl(state) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state // usualmente el userId del asesor
  });
}

/**
 * Intercambia el código por tokens y los guarda en Firestore
 */
export async function handleAuthCallback(code, userId) {
  const { tokens } = await oauth2Client.getToken(code);
  
  // Guardar tokens en Firestore
  const integrationRef = doc(db, 'user-integrations', userId);
  await setDoc(integrationRef, {
    google: {
      tokens,
      connectedAt: new Date(),
      status: 'active'
    }
  }, { merge: true });

  return tokens;
}

/**
 * Obtiene un cliente autorizado para un usuario específico
 */
export async function getAuthorizedClient(userId) {
  const docRef = doc(db, 'user-integrations', userId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists() || !snap.data().google?.tokens) {
    throw new Error('Google integration not found or tokens missing.');
  }

  const { tokens } = snap.data().google;
  const client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
  
  client.setCredentials(tokens);

  // Auto-refresh si el token ha expirado
  client.on('tokens', async (newTokens) => {
    await updateDoc(docRef, {
      'google.tokens': { ...tokens, ...newTokens }
    });
  });

  return client;
}

/**
 * Obtiene huecos libres del calendario
 */
export async function getFreeBusy(userId, timeMin, timeMax) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: 'primary' }]
    }
  });

  return response.data.calendars.primary.busy;
}

/**
 * Crea un evento en el calendario
 */
export async function createCalendarEvent(userId, eventDetails) {
  const auth = await getAuthorizedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: eventDetails,
    sendUpdates: 'all'
  });

  return response.data;
}

/**
 * Envía un email via Gmail
 */
export async function sendGmail(userId, { to, subject, body }) {
  const auth = await getAuthorizedClient(userId);
  const gmail = google.gmail({ version: 'v1', auth });

  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    body,
  ];
  const message = messageParts.join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}
