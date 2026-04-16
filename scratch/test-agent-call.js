async function testAgent() {
    const url = 'https://rora-app.onrender.com/api/rora/agents/test';
    const payload = {
        mensaje: "Hola RORA Central, preséntate brevemente para confirmar que la conexión Ohio-Anthropic es estable."
    };

    console.log('📡 Enviando mensaje de prueba a RORA Central (vía Render)...');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('\n❌ RESPUESTA NO-JSON RECIBIDA:');
            console.log(responseText);
            return;
        }
        
        if (data.success) {
            console.log('\n✨ RESPUESTA DE RORA CENTRAL:');
            console.log('-----------------------------------');
            console.log(data.respuesta);
            console.log('-----------------------------------');
        } else {
            console.error('\n❌ ERROR EN LA PRUEBA:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('\n❌ Error de red:', error.message);
    }
}

testAgent();
