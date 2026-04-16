/**
 * Generador de Dossier RORA (En mantenimiento)
 * Esta versión ha sido simplificada para restaurar la estabilidad de la web.
 */
export async function generarDossierPDF(datosDossier) {
  console.warn("Generación de PDF desactivada temporalmente para mantenimiento.");
  
  return new Promise((resolve) => {
    const { perfil_cliente } = datosDossier;
    
    // Devolvemos un mensaje informativo en lugar de un PDF real
    // Esto evita cargar pdfkit o módulos de Node en el navegador
    const fakeUrl = `https://rora.com.es/mantenimiento-dossier?cliente=${encodeURIComponent(perfil_cliente?.nombre || 'cliente')}`;
    
    // Resolvemos inmediatamente
    resolve(fakeUrl);
  });
}
