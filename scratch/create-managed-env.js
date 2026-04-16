async function createEnv() {
    const url = 'https://api.anthropic.com/v1/environments';
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    console.log('🌐 Creando entorno de ejecución para Rora (Managed Agents)...');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'managed-agents-2026-04-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Rora Orchestrator Runtime",
                config: {
                    type: "cloud",
                    networking: { type: "unrestricted" }
                }
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('\n✅ ENTORNO CREADO:');
            console.log('-----------------------------------');
            console.log('ID:', data.id);
            console.log('-----------------------------------');
        } else {
            console.error('\n❌ ERROR:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('\n❌ Error de red:', error.message);
    }
}

createEnv();
