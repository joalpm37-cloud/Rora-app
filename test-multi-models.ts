import dotenv from 'dotenv';
dotenv.config();

async function testModel(modelName) {
  console.log(`--- Probando Modelo: ${modelName} ---`);
  const url = 'https://api.anthropic.com/v1/messages';
  const apiKey = process.env.VITE_CLAUDE_API_KEY;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    if (response.ok) {
        console.log('✅ OK');
        return true;
    } else {
        console.log('❌ Error:', JSON.stringify(data));
        return false;
    }
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function run() {
    await testModel("claude-3-5-sonnet-20241022");
    await testModel("claude-3-haiku-20240307");
    await testModel("claude-haiku-4-5-20251001");
}

run();
