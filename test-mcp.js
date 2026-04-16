import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import { ejecutarHerramientaMCP } from './rora/utils/ghl-api.js';

async function runTests() {
  const results = {};
  
  try {
    results.P1 = await ejecutarHerramientaMCP('contacts_get-contacts', {query: "Test RORA"}); 
  } catch(e) {}

  try {
    results.P2 = await ejecutarHerramientaMCP("conversations_search-conversation", {contactId: "95udpaj2MikSUUZ9sJ3I"});
  } catch(e) {}

  try {
    results.P3 = await ejecutarHerramientaMCP("calendars_get-calendar-events", {startTime: new Date().getTime()});
  } catch(e) {}

  try {
    results.P4 = await ejecutarHerramientaMCP("contacts_create-contact", {
      firstName: "Lead Prueba RORA 2",
      phone: "1112223333",
      email: "prueba2@rora.com"
    });
  } catch(e) {}

  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
}

runTests();
