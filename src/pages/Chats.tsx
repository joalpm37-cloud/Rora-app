import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Bot,
  User as UserIcon,
  MessageSquare,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  onSnapshot,
  query,
  orderBy,
  addDoc,
  collection,
  serverTimestamp,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchGhlConversations, 
  fetchGhlMessages, 
  sendGhlMessage, 
  sendRoraChat 
} from '../lib/api-client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RORA_CHAT_ID = "rora-chat-mock-id";

export const Chats: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [ghlConversations, setGhlConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGhlLoading, setIsGhlLoading] = useState(false);

  const [roraMessages, setRoraMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRoraMessages([
      {
        id: 'initial-msg',
        senderId: 'rora',
        role: 'rora',
        text: 'Hola, soy RORA 👋 Tu agente principal. Puedo ayudarte a gestionar leads, crear contenido para tus propiedades, buscar opciones para clientes o lanzar campañas. ¿Por dónde empezamos?',
        createdAt: new Date()
      }
    ]);
  }, []);

  // Sync GHL Conversations
  useEffect(() => {
    const fetchGhlConversations = async () => {
      setIsGhlLoading(true);
      try {
        const response = await fetch(getApiUrl('/api/ghl/conversations'));
        const convs = await response.json();
        setGhlConversations(convs.map((c: any) => ({
          ...c,
          isGhl: true,
          id: c.id,
          nombre: c.contactName || 'Lead GHL',
          lastMessage: c.lastMessageBody || 'Sin mensajes',
          updatedAt: c.lastMessageDate ? new Date(c.lastMessageDate) : new Date(),
          channel: (c.type || 'SMS').toLowerCase()
        })));
      } catch (err) {
        console.error("Error fetching GHL conversations:", err);
      } finally {
        setIsGhlLoading(false);
      }
    };
    fetchGhlConversations();

    // "Debajo de RORA, aparecen los chats de leads reales que vengan de Firebase desde la colección sales-conversations"
    const q = query(collection(db, 'sales-conversations'), orderBy('ultimaActualizacion', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => {
        const data = doc.data();
        let lastMsg = 'Nueva interacción';
        if (data.conversacion && data.conversacion.length > 0) {
          lastMsg = data.conversacion[data.conversacion.length - 1].content;
        }

        return {
          id: doc.id,
          participants: [user?.uid || '', doc.id],
          participantNames: { [doc.id]: data.nombre || 'Lead' },
          lastMessage: lastMsg,
          updatedAt: data.ultimaActualizacion,
          isGhl: false,
          ...data
        };
      });
      setConversations(convs);
    }, (error) => {
      console.error(error);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle message loading for GHL vs Firebase
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    
    if (selectedChat.id === RORA_CHAT_ID) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      return;
    }

    if (selectedChat.isGhl) {
      const fetchGhlMessages = async () => {
        try {
          const response = await fetch(getApiUrl(`/api/ghl/messages/${selectedChat.id}`));
          const ghlMsgs = await response.json();
          setMessages(ghlMsgs);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
          console.error("Error fetching GHL messages:", err);
        }
      };
      fetchGhlMessages();
      return;
    }

    const docRef = doc(db, 'sales-conversations', selectedChat.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.conversacion) {
          const msgs = data.conversacion.map((c: any, i: number) => ({
            id: `msg-${i}`,
            conversationId: selectedChat.id,
            sender: c.sender || (c.role === 'agente' ? 'agent' : 'lead'),
            text: c.text || c.content,
            timestamp: c.timestamp || data.ultimaActualizacion
          }));
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim() || isTyping) return;

    const text = newMessage.trim();
    setNewMessage(''); 

    if (selectedChat.isGhl) {
      try {
        const response = await fetch(getApiUrl('/api/ghl/send'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: selectedChat.id, text })
        });

        if (!response.ok) throw new Error('Error enviando mensaje GHL');
        
        // Optimistic update
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: text,
          sender: 'agent',
          timestamp: new Date(),
          isGhl: true
        }]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        console.error("Error sending GHL message:", err);
      }
      return;
    }

    if (selectedChat.id === RORA_CHAT_ID) {
      const userMsg = {
        id: Date.now().toString(),
        senderId: user.uid,
        role: 'realtor',
        text: text,
        createdAt: new Date()
      };
      
      setRoraMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

      try {
        const historial = roraMessages
          .filter(m => m.id !== 'initial-msg')
          .map(m => ({
            role: m.role === 'realtor' ? 'user' : 'assistant',
            content: m.text
          }));

        const response = await fetch(getApiUrl('/api/rora/chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: text, historial })
        });

        if (!response.ok) throw new Error('Error en la comunicación con RORA');
        const respuesta = await response.json();

        const roraMsg = {
          id: Date.now().toString() + "-rora",
          senderId: 'rora',
          role: 'rora',
          text: respuesta.reply || respuesta.mensajeParaMostrar,
          accion: respuesta.accion,
          createdAt: new Date()
        };

        setRoraMessages(prev => [...prev, roraMsg]);

        if (respuesta.accion === 'lead') {
           await addDoc(collection(db, 'aprobaciones_pendientes'), {
             title: 'Nueva captura - RORA',
             type: 'Ejecución Sales Agent',
             time: new Date().toLocaleTimeString(),
             createdAt: serverTimestamp()
           });
        }

        await addDoc(collection(db, 'conversaciones-rora'), {
          timestamp: serverTimestamp(),
          rolRealtor: 'realtor',
          contenidoRealtor: text,
          rolRora: 'rora',
          contenidoRora: respuesta.mensajeParaMostrar,
          accionDetectada: respuesta.accion || 'ninguna'
        });

      } catch (error) {
        const errorMsg = {
          id: Date.now().toString() + "-err",
          senderId: 'rora',
          role: 'rora',
          text: 'Estoy en modo de configuración. En breve estaré completamente activo. Mientras tanto puedes explorar el resto de la plataforma.',
          accion: 'ninguna',
          createdAt: new Date()
        };
        setRoraMessages(prev => [...prev, errorMsg]);
        
        await addDoc(collection(db, 'conversaciones-rora'), {
          timestamp: serverTimestamp(),
          rolRealtor: 'realtor',
          contenidoRealtor: text,
          rolRora: 'rora',
          contenidoRora: errorMsg.text,
          accionDetectada: 'error_fallback'
        });
      } finally {
        setIsTyping(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      return;
    }
  };

  const roraMockChat = {
    id: RORA_CHAT_ID,
    participants: [user?.uid || '', 'rora'],
    lastMessage: 'Activo',
    updatedAt: new Date()
  };

  const displayMessages = selectedChat?.id === RORA_CHAT_ID ? roraMessages : messages;
  const filteredConversations = [
    roraMockChat,
    ...ghlConversations,
    ...conversations
  ].filter(chat =>
    chat.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery
  );

  const getBadge = (accion: string) => {
    switch (accion) {
      case 'contenido': return <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">Content Agent activado</span>;
      case 'lead': return <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wider">CRM Agent activado</span>;
      case 'propiedad': return <span className="inline-block mt-2 px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-lg uppercase tracking-wider">Scout Agent activado</span>;
      case 'anuncio': return <span className="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-lg uppercase tracking-wider">Performance Agent activado</span>;
      default: return null;
    }
  };

  const getChannelIcon = (channel: string) => {
    const c = channel?.toLowerCase();
    if (c === 'whatsapp') return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
    if (c === 'instagram') return <Instagram className="w-4 h-4 text-[#E4405F]" />;
    if (c === 'email') return <MailIcon className="w-3 h-3" />;
    return <Smartphone className="w-3 h-3" />;
  };

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] flex glass-card overflow-hidden relative">
      <div className={cn(
        "w-full md:w-80 border-r border-obsidian-border flex flex-col bg-obsidian-card absolute md:relative z-10 h-full transition-transform duration-300",
        selectedChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>
        <div className="p-4 border-b border-obsidian-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Chats</h2>
            <button
              onClick={() => setSelectedChat(roraMockChat)}
              title="Nuevo chat"
              className="p-2 bg-obsidian-primary/10 text-obsidian-primary rounded-lg hover:bg-obsidian-primary/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar chats..."
              className="w-full bg-obsidian-bg border border-obsidian-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((chat) => {
            const isRora = chat.id === RORA_CHAT_ID;
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors text-left border-b border-obsidian-border/50",
                  selectedChat?.id === chat.id && "bg-obsidian-primary/5 border-r-2 border-obsidian-primary"
                )}
              >
                <div className="relative">
                  {isRora ? (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-obsidian-primary/30 bg-obsidian-primary/20 text-obsidian-primary text-xl font-bold">
                      R
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-obsidian-card"></div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-obsidian-border bg-white/10 text-white">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm font-bold truncate">
                        {isRora ? 'RORA — Agente Principal' : (chat.nombre || 'Lead Desconocido')}
                      </span>
                      {chat.isGhl && (
                         <span className="shrink-0 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[9px] font-bold">GHL</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn("text-xs truncate", isRora ? "text-obsidian-primary font-medium" : "text-obsidian-muted")}>
                      {chat.lastMessage || ''}
                    </p>
                    {chat.isGhl && (
                      <div className="text-obsidian-muted flex items-center gap-1 ml-2">
                        {getChannelIcon(chat.channel || chat.canal)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn(
        "flex-1 flex flex-col bg-obsidian-bg/50 absolute md:relative w-full h-full z-0 transition-transform duration-300",
        selectedChat ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {selectedChat ? (
          <>
            <header className="p-4 border-b border-obsidian-border bg-obsidian-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-2 -ml-2 mr-1 text-obsidian-muted hover:text-white"
                  onClick={() => setSelectedChat(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                {selectedChat.id === RORA_CHAT_ID ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-obsidian-primary/30 bg-obsidian-primary/20 text-obsidian-primary relative text-lg font-bold">
                    R
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-obsidian-card"></div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-obsidian-border bg-white/10 text-white">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold">{selectedChat.id === RORA_CHAT_ID ? 'RORA — AI CRM' : (selectedChat.nombre || 'Lead')}</h3>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {displayMessages.map((msg, idx) => {
                const isAgent = msg.sender === 'agent' || msg.role === 'rora' || msg.role === 'agente';
                const isMine = isAgent;
                const isRoraMsg = msg.role === 'rora';

                return (
                  <div key={idx} className={cn(
                    "flex items-start gap-3 max-w-[90%] md:max-w-[80%]",
                    isMine ? "self-end flex-row-reverse" : "self-start"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                      isMine ? "bg-obsidian-primary/20 text-obsidian-primary border-obsidian-primary/30" 
                      : isRoraMsg ? "bg-obsidian-card text-white border-obsidian-border text-sm font-bold" 
                      : "bg-white/10 text-white border-obsidian-border"
                    )}>
                      {isRoraMsg ? "R" : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                      <div className={cn(
                        "p-4 rounded-2xl",
                        isMine
                          ? "bg-obsidian-primary/20 text-white rounded-tr-none border border-obsidian-primary/30"
                          : "bg-obsidian-card border border-obsidian-border rounded-tl-none text-white font-medium"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                      {msg.accion && msg.accion !== 'ninguna' && (
                        <div className={cn("mt-1 flex", isMine ? "justify-end" : "justify-start")}>
                          {getBadge(msg.accion)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex items-start gap-3 max-w-[80%] self-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-obsidian-card text-white border-obsidian-border text-sm font-bold">R</div>
                  <div className="p-4 border border-obsidian-border bg-obsidian-card text-white rounded-2xl rounded-tl-sm w-24 flex justify-center items-center h-12">
                     <div className="flex space-x-1.5">
                       <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce"></div>
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 bg-obsidian-card/50 border-t border-obsidian-border flex items-center justify-center">
              <p className="text-xs text-obsidian-muted font-medium flex items-center gap-2">
                <Bot className="w-3.5 h-3.5" />
                Modo Monitor: Lira está gestionando esta conversación en GHL.
              </p>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-obsidian-muted">
             No hay chat seleccionado
          </div>
        )}
      </div>
    </div>
  );
};
