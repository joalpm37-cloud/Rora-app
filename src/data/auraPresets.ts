export const auraPresets = [
  {
    id: "crear-exitosa",
    name: "Modo 1: Crear Campaña",
    description: "Crear una campaña válida según lineamientos de Real Estate.",
    json: JSON.stringify({
      "tipo": "anuncio",
      "intencion": "crear",
      "realtor": {
        "ad_account_id": "act_1029384756",
        "page_id": "1234567890",
        "instagram_actor_id": "9876543210",
        "pixel_id": "555666777"
      },
      "campana": {
        "objetivo": "leads",
        "propiedad": {
          "tipo": "Casa",
          "precio": "$450,000 USD",
          "ubicacion": "Miami, FL"
        },
        "video_url": "https://lumen.local/video/123.mp4",
        "presupuesto_diario": 2000,
        "duracion_dias": 7,
        "audiencia": {
          "ubicaciones": ["Miami, FL"],
          "edad_min": 28,
          "edad_max": 65,
          "intereses": ["Bienes raíces", "Zillow"]
        }
      }
    }, null, 2)
  },
  {
    id: "crear-housing-error",
    name: "Modo 1: Crear (Error Housing)",
    description: "Crear una campaña que viola reglas de edad/códigos postales (Housing Ads).",
    json: JSON.stringify({
      "tipo": "anuncio",
      "intencion": "crear",
      "realtor": {
        "ad_account_id": "act_1029384756",
        "page_id": "1234567890"
      },
      "campana": {
        "objetivo": "leads",
        "propiedad": {
          "tipo": "Departamento",
          "precio": "$200,000 USD",
          "ubicacion": "Dallas, TX"
        },
        "video_url": "https://lumen.local/video/456.mp4",
        "presupuesto_diario": 1500,
        "duracion_dias": 5,
        "audiencia": {
          "ubicaciones": ["Dallas, TX"],
          "edad_min": 22,
          "edad_max": 40,
          "excluir_codigos_postales": ["75201"]
        }
      }
    }, null, 2)
  },
  {
    id: "reportar-verde",
    name: "Modo 2: Reportar (Excelente)",
    description: "Reportar métricas con bajo CPL y buen CTR.",
    json: JSON.stringify({
      "tipo": "anuncio",
      "intencion": "reportar",
      "realtor": {
        "ad_account_id": "act_1029384756"
      },
      "campana": {
        "campana_id": "camp_999888777",
        "datos_api": {
          "impresiones": 12000,
          "gastado": 150.00,
          "clics": 240,
          "leads": 28
        }
      }
    }, null, 2)
  },
  {
    id: "optimizar-rojo",
    name: "Modo 3: Optimizar (Malo)",
    description: "Campaña con CPL muy alto y CTR bajo. Aura debe proponer optimizaciones.",
    json: JSON.stringify({
      "tipo": "anuncio",
      "intencion": "optimizar",
      "realtor": {
        "ad_account_id": "act_1029384756"
      },
      "campana": {
        "campana_id": "camp_111222333",
        "datos_api": {
          "impresiones": 25000,
          "gastado": 400.00,
          "clics": 120,
          "leads": 2
        }
      }
    }, null, 2)
  }
];
