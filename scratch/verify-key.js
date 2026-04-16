import dotenv from 'dotenv';
dotenv.config();

async function verifyKey() {
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  const url = 'https://api.anthropic.com/v1/messages';
  
  const body = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [{ role: 'user', content: 'Responde solo: RORA operativo' }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error during API call:', error);
  }
}

verifyKey();
