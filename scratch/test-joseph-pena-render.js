async function testJosephPenaSearch() {
  const url = 'https://rora-app.onrender.com/api/rora/agents/test';
  console.log(`📡 Llamando a Rora en Ohio para buscar a "Joseph Peña": ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: 'Busca el contacto de Joseph Peña por favor.' })
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    
    if (data.success) {
        console.log('\n✅ Rora ha respondido exitosamente desde Ohio:');
        console.log('-----------------------------------');
        console.log(data.reply);
        console.log('-----------------------------------');
    } else {
        console.log('\n❌ Fallo en la respuesta:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error de red:', error.message);
  }
}

testJosephPenaSearch();
