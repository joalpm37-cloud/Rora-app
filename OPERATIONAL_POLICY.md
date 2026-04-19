# Política Operativa de Antigravity para RORA

Este documento establece las reglas permanentes para el uso de recursos y herramientas de IA en este proyecto.

## Regla de Oro: Protección de Créditos
**PROHIBIDO** utilizar la `ANTHROPIC_API_KEY` del usuario (o cualquier clave proporcionada en el `.env`) para tareas de razonamiento interno, sub-agentes de navegación autónoma o verificaciones de despliegue.

### Casos de Uso Permitidos
- **Chat de RORA**: La clave API solo debe utilizarse para procesar las interacciones de los usuarios finales dentro de la aplicación RORA.
- **Consultas Directas**: Peticiones puntuales necesarias para el funcionamiento de la aplicación en producción.

### Casos de Uso Prohibidos (Para Antigravity)
- **browser_subagent**: Nunca lanzar sub-agentes autónomos que consuman tokens de la cuenta del usuario para tareas de prueba.
- **Bucles de Verificación**: No automatizar verificaciones que requieran razonamiento pesado de Claude si impactan en la facturación del usuario.

## Alternativas de Trabajo
Para mantener la funcionalidad sin gastar créditos del usuario, Antigravity deberá:
1.  Utilizar sus propias capacidades de razonamiento nativas (procesadas por Google/Deepmind).
2.  Utilizar herramientas de "bajo coste" como `read_url_content` o comandos de terminal para verificar estados de red.
3.  Solicitar verificación manual al usuario cuando sea necesario realizar pruebas visuales complejas en un entorno en el que no haya créditos disponibles.

---
*Este documento debe ser leído y respetado por cualquier instancia de Antigravity encargada de este repositorio.*
