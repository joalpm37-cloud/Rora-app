import { bundle } from '@remotion/bundler';
import { renderVideo, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(__dirname, 'out');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

let bundledStorage = null;

async function getBundle() {
  if (bundledStorage) return bundledStorage;
  
  console.log("Bundling Remotion project...");
  const entry = path.join(__dirname, 'src', 'index.ts');
  bundledStorage = await bundle(entry);
  return bundledStorage;
}

export async function renderPropiedadVideo(propiedadId, videoConfig) {
  try {
    const bundleLocation = await getBundle();
    const compositionId = 'Main';
    
    // Configurar la composición con los props dinámicos
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: videoConfig,
    });

    const outputLocation = path.join(CACHE_DIR, `video-${propiedadId}-${Date.now()}.mp4`);

    console.log(`Starting render for ${propiedadId}...`);
    
    await renderVideo({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: videoConfig,
      onProgress: ({ progress }) => {
        console.log(`Rendering progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`Render complete: ${outputLocation}`);
    return outputLocation;
  } catch (error) {
    console.error("Error rendering video:", error);
    throw error;
  }
}
