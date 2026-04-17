async function diagnosticGHL() {
  // Probamos obtener los detalles de la Location directamente
  const locationId = 'Da4xumnCtfy4YV1czMZd';
  const token = 'pit-c3c18cb7-e3c8-4383-9ccc-297fb59653c5';
  const url = `https://services.leadconnectorhq.com/locations/${locationId}`;
  
  console.log(`📡 Diagnosticando GHL para Location: ${locationId}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 403) {
        console.log('\n🚨 CONFIRMADO: El token no tiene permisos para esta Location.');
        console.log('Debes regenerar el PIT Token asegurándote de que tenga acceso a la subcuenta seleccionada.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

diagnosticGHL();
