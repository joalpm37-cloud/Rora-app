import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead } from '../types';

export interface LyraConversation {
  contactId: string;
  nombre: string;
  channel: string;
  conversacion: {
    sender: 'lead' | 'agent';
    text: string;
    timestamp: any;
  }[];
  clasificacion: string;
  bant: any;
  ultimaActualizacion: any;
}

export const lyraService = {
  // Obtener leads filtrados por su importancia (BANT Score)
  async getTopLeads(): Promise<Lead[]> {
    const q = query(
      collection(db, 'leads'),
      orderBy('score', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
  },

  // Obtener el reporte detallado de conversación con Lyra
  async getLeadConversation(contactId: string): Promise<LyraConversation | null> {
    const docRef = doc(db, 'sales-conversations', contactId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as LyraConversation;
    }
    return null;
  },

  // Agrupar leads por estado para el pipeline
  async getPipelineData() {
    const leads = await this.getTopLeads();
    return {
      pending: leads.filter(l => l.status === 'new' || l.status === 'contacted'),
      visiting: leads.filter(l => l.status === 'visit_scheduled'),
      approved: leads.filter(l => l.status === 'closed' || l.status === 'ganado')
    };
  }
};
