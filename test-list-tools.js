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
      method: method,
      params: params
    })
  });
  
  const text = await res.text();
  return text;
}

async function run() {
  try {
    const result = await fetchMCP('tools/list');
    fs.writeFileSync('tools.json', result);
  } catch(e) {
    fs.writeFileSync('tools.json', JSON.stringify({error: e.message}, null, 2));
  }
}

run();
