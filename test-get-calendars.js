import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

async function fetchMCP(method, params = {}) {
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

async function run() {
  try {
    const result = await fetchMCP('locations_get-location', {locationId: process.env.GHL_LOCATION_ID});
    fs.writeFileSync('calendars.json', JSON.stringify(result, null, 2));
  } catch(e) {
    fs.writeFileSync('calendars.json', JSON.stringify({error: e.message}, null, 2));
  }
}

run();
