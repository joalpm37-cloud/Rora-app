import dotenv from 'dotenv';
import SYSTEM_PROMPT_RORA from '../rora/prompts/system-prompt-rora';
import { GHL_TOOLS } from '../rora/utils/claude-tools';

dotenv.config();

async function createAgent() {
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  const ghlToken = process.env.VITE_GHL_PIT_TOKEN;
  const ghlLocation = process.env.VITE_GHL_LOCATION_ID;
  
  const url = 'https://api.anthropic.com/v1/agents';
  
  const body = {
    name: "RORA Central",
    model: "claude-sonnet-4-6",
    system_prompt: SYSTEM_PROMPT_RORA,
    tools: GHL_TOOLS,
    mcp_servers: [
      {
        type: "url",
        url: "https://services.leadconnectorhq.com/mcp/",
        name: "ghl-mcp",
        headers: {
          "Authorization": `Bearer ${ghlToken}`,
          "locationId": ghlLocation
        }
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'managed-agents-2026-04-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (data.id) {
        console.log('SUCCESS: Agent created with ID:', data.id);
        // Instruction was: Guardar el agent_id que devuelve como variable de entorno CLAUDE_AGENT_ID_RORA.
        // I'll append it to .env
    }
  } catch (error) {
    console.error('Error during API call:', error);
  }
}

createAgent();
