import dotenv from 'dotenv';
import SYSTEM_PROMPT_RORA from '../server/rora/prompts/system-prompt-rora.js';

dotenv.config();

const API_KEY = process.env.VITE_CLAUDE_API_KEY;

async function activate() {
    try {
        console.log('🚀 Iniciando activación local de Managed Agent...');
        console.log('📡 Conectando con Anthropic (Managed Agents Beta)...');
        
        const response = await fetch('https://api.anthropic.com/v1/agents', {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': 'managed-agents-2026-04-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: 'RORA Central',
                model: 'claude-3-5-sonnet-20241022',
                system: SYSTEM_PROMPT_RORA
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ AGENTE ACTIVADO CON ÉXITO:');
            console.log('-----------------------------------');
            console.log(`ID: ${data.id}`);
            console.log(`Nombre: ${data.name}`);
            console.log(`Modelo: ${data.model}`);
            console.log('-----------------------------------');
            console.log('Guarda este ID. Lo usaremos para configurar el backend.');
        } else {
            console.error('❌ ERROR DE ACTIVACIÓN:');
            console.log(JSON.stringify(data, null, 2));
            
            if (response.status === 403) {
                console.log('\n⚠️ CONFIRMADO: Bloqueo regional detectado en local.');
                console.log('Debemos esperar a que Render (Ohio, EE.UU.) termine de desplegar.');
            }
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

activate();
