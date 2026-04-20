import { GoogleGenAI } from '@google/genai';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI(apiKey);

export interface AtlasProspect {
  nombre: string;
  presupuesto_min: number;
  presupuesto_max: number;
  tipo_propiedad: string[];
  ubicaciones: string[];
  recamaras_min: number;
  banos_min: number;
  must_haves: string[];
  nice_to_haves: string[];
  mercado: "local" | "internacional";
}

export async function generateAtlasDossier(prospect: AtlasProspect, onStream: (text: string) => void) {
  // 1. Fase Local: Scoring de Portfolio en Firebase
  const propertiesRef = collection(db, 'properties');
  const q = query(propertiesRef); // Podríamos optimizar un poco más aquí
  const snapshot = await getDocs(q);
  
  const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  
  // Scoring básico (similar a la lógica del repo)
  const scored = properties.map((prop: any) => {
    let score = 0;
    
    // Filtro Presupuesto (30 pts)
    const price = parseFloat(prop.price);
    if (price >= prospect.presupuesto_min && price <= prospect.presupuesto_max) score += 30;
    else if (price <= prospect.presupuesto_max * 1.1) score += 15;

    // Filtro Ubicación (30 pts)
    const propLocation = `${prop.location} ${prop.city}`.toLowerCase();
    const matchesLocation = prospect.ubicaciones.some(loc => propLocation.includes(loc.toLowerCase()));
    if (matchesLocation) score += 30;

    // Filtro Características (20 pts)
    const propFeatures = (prop.features || []).map((f: string) => f.toLowerCase());
    const matchesMust = prospect.must_haves.every(must => propFeatures.some((f: string) => f.includes(must.toLowerCase())));
    if (matchesMust) score += 20;

    return { ...prop, matchScore: score };
  }).sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 3);

  // 2. Fase IA: Generación de Dossier
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `Eres Atlas, el agente scout experto de RORA. 
  Tu función es encontrar la propiedad perfecta y presentarla en un dossier profesional.
  Analiza el portafolio local que te proporciono y, si el mercado es internacional o los resultados son pocos, sugiere una búsqueda externa imaginaria basada en tendencias reales del mercado.
  
  IDENTIDAD: Analítico, preciso, elegante. 
  IDIOMA: Siempre español.
  FORMATO: Markdown estructurado con Match Scores.`;

  const prompt = `Genera un dossier para el prospecto:
  ${JSON.stringify(prospect, null, 2)}
  
  Portafolio local analizado:
  ${JSON.stringify(scored, null, 2)}
  
  Produce el reporte final ahora.`;

  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: systemPrompt
  });

  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onStream(chunkText);
  }
  
  return fullText;
}
