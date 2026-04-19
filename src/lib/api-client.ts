/**
 * RORA API Client
 * Centralizes all frontend-to-backend calls.
 */

export const getApiUrl = (path: string) => {
  const base = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://rora-app.onrender.com';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

// --- GHL Proxy Calls ---

export async function fetchGhlContacts(limit = 20) {
  const r = await fetch(getApiUrl(`/api/ghl/contacts?limit=${limit}`));
  if (!r.ok) throw new Error('Error fetching GHL contacts');
  return r.json();
}

export async function fetchGhlConversations() {
  const r = await fetch(getApiUrl('/api/ghl/conversations'));
  if (!r.ok) throw new Error('Error fetching GHL conversations');
  return r.json();
}

export async function fetchGhlMessages(contactId: string) {
  const r = await fetch(getApiUrl(`/api/ghl/messages/${contactId}`));
  if (!r.ok) throw new Error('Error fetching GHL messages');
  return r.json();
}

export async function sendGhlMessage(conversationId: string, text: string) {
  const r = await fetch(getApiUrl('/api/ghl/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, text })
  });
  if (!r.ok) throw new Error('Error sending GHL message');
  return r.json();
}

// --- Rora AI Calls ---

export async function sendRoraChat(mensaje: string, historial: any[] = []) {
  const r = await fetch(getApiUrl('/api/rora/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje, historial })
  });
  if (!r.ok) throw new Error('Error in Rora chat');
  return r.json();
}
