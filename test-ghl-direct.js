import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

async function fetchMCP(method, params) {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;

  const res = await fetch('https://services.leadconnectorhq.com/mcp/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'locationId': locationId,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: method, arguments: params }
    })
  });
  
  const text = await res.text();
  let jsonResult = text;
  
  try {
     if (text.includes('data:')) {
         const dataLines = text.split('\\n').filter(line => line.startsWith('data:'));
         if (dataLines.length > 0) {
           const resultLine = dataLines.find(l => l.includes('"result"') || l.includes('"success"'));
           if (resultLine) jsonResult = JSON.parse(resultLine.replace('data:', '').trim());
           else {
             const c = dataLines.map(l => l.replace('data:', '').trim()).join('');
             jsonResult = JSON.parse(c);
           }
         }
     } else {
         jsonResult = JSON.parse(text);
     }
  } catch (e) {
     jsonResult = { unparsed: text };
  }
  
  return jsonResult;
}

async function runTests() {
  let md = "# Pruebas Directas MCP GHL\\n\\n";
  
  md += "### Prueba 1: buscar_contacto ('Test')\\n```json\\n";
  const p1 = await fetchMCP('contacts_get-contacts', {query: "Test RORA"});
  md += JSON.stringify(p1, null, 2) + "\\n```\\n\\n";

  md += "### Prueba 2: obtener_conversaciones (contactId: 95udpaj2MikSUUZ9sJ3I)\\n```json\\n";
  const p2 = await fetchMCP('conversations_search-conversation', {contactId: "95udpaj2MikSUUZ9sJ3I"});
  md += JSON.stringify(p2, null, 2) + "\\n```\\n\\n";

  md += "### Prueba 3: obtener_calendario\\n```json\\n";
  const p3 = await fetchMCP('calendars_get-calendar-events', {startTime: new Date().getTime()});
  md += JSON.stringify(p3, null, 2) + "\\n```\\n\\n";

  md += "### Prueba 4: crear_contacto\\n```json\\n";
  const p4 = await fetchMCP('contacts_create-contact', {
    firstName: "Lead Prueba RORA 2",
    phone: "1112223333",
    email: "prueba2@rora.com"
  });
  md += JSON.stringify(p4, null, 2) + "\\n```\\n\\n";

  fs.writeFileSync('mcp-tests.md', md);
}

runTests();
