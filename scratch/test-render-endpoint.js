async function testRender() {
  const url = 'https://rora-app.onrender.com/api/rora/agents/test';
  console.log(`📡 Llamando a: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: 'Hola RORA, ¿estas operativa desde Ohio?' })
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('Respuesta:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRender();
