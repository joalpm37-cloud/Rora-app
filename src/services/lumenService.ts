import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI(apiKey);

export interface LumenInput {
  ubicacion: string;
  tipo: string;
  precio: string;
  m2_totales: string;
  recamaras: string;
  banos: string;
  informacion_extra: string;
  fotos: File[];
  solicitud: string;
  tono: string;
}

export interface LumenOutput {
  agente: string;
  status: string;
  outputs: {
    guion_video: {
      hook: string;
      presentacion: string;
      recorrido: string;
      propuesta_valor: string;
      cta: string;
    };
    descripcion_larga: string;
    descripcion_corta: string;
    hashtags_feed: string[];
    hashtags_stories: string[];
    sugerencia_horario: string;
    videoConfig?: {
      colorPalette: { primary: string; secondary: string; accent: string };
      fontFamily: string;
      animationStyle: string;
    };
  };
  datos_faltantes: string[];
  notas_para_rora: string;
}

async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateLumenContent(input: LumenInput): Promise<LumenOutput> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `Eres Lumen, el agente de contenido de la plataforma RORA. 
    Tu función es transformar fotos y datos de propiedades en contenido cinematográfico.
    Analiza visualmente las fotos para destacar materiales, luz y espacios únicos en el guion.
    Devuelve siempre JSON puro.`
  });

  const imageParts = await Promise.all(input.fotos.map(fileToGenerativePart));
  
  const prompt = `Genera el contenido para esta propiedad:
  Ubicación: ${input.ubicacion}
  Tipo: ${input.tipo}
  Precio: ${input.precio}
  M2: ${input.m2_totales}
  Recámaras: ${input.recamaras}
  Baños: ${input.banos}
  Extra: ${input.informacion_extra}
  Solicitud: ${input.solicitud}
  Tono: ${input.tono}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [...imageParts, { text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT" as any,
        properties: {
          agente: { type: "STRING" as any },
          status: { type: "STRING" as any },
          outputs: {
            type: "OBJECT" as any,
            properties: {
              guion_video: {
                type: "OBJECT" as any,
                properties: {
                  hook: { type: "STRING" as any },
                  presentacion: { type: "STRING" as any },
                  recorrido: { type: "STRING" as any },
                  propuesta_valor: { type: "STRING" as any },
                  cta: { type: "STRING" as any }
                },
                required: ["hook", "presentacion", "recorrido", "propuesta_valor", "cta"]
              },
              descripcion_larga: { type: "STRING" as any },
              descripcion_corta: { type: "STRING" as any },
              hashtags_feed: { type: "ARRAY" as any, items: { type: "STRING" as any } },
              hashtags_stories: { type: "ARRAY" as any, items: { type: "STRING" as any } },
              sugerencia_horario: { type: "STRING" as any },
              videoConfig: {
                type: "OBJECT" as any,
                properties: {
                  colorPalette: {
                    type: "OBJECT" as any,
                    properties: {
                      primary: { type: "STRING" as any },
                      secondary: { type: "STRING" as any },
                      accent: { type: "STRING" as any }
                    },
                    required: ["primary", "secondary", "accent"]
                  },
                  fontFamily: { type: "STRING" as any },
                  animationStyle: { type: "STRING" as any }
                }
              }
            },
            required: ["guion_video", "descripcion_larga", "descripcion_corta", "hashtags_feed", "hashtags_stories", "sugerencia_horario"]
          },
          datos_faltantes: { type: "ARRAY" as any, items: { type: "STRING" as any } },
          notas_para_rora: { type: "STRING" as any }
        },
        required: ["agente", "status", "outputs", "datos_faltantes", "notas_para_rora"]
      }
    }
  });

  return JSON.parse(result.response.text());
}
