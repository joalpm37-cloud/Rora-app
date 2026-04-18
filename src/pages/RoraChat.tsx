import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'realtor' | 'rora';
  content: string;
  accion?: string;
  ghlCreated?: boolean;
}

const extraerDatosGHL = (texto: string) => {
  // Parsing ingenuo para extraer partes útiles de la cadena DATOS usando regex
  const nombreMatch = texto.match(/(?:nombre|cliente)[:\s]*([A-Za-zÁ-Úá-úñÑ ]+)(?:,|$|\n)/i);
  const emailMatch = texto.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  const telfMatch = texto.match(/(?:teléfono|telefono|celular|numero)[:\s]*([0-9\-\+\s]+)(?:,|$|\n)/i);
  
  return {
    nombre: nombreMatch ? nombreMatch[1].trim() : "Contacto RORA",
    email: emailMatch ? emailMatch[1].trim() : "",
    telefono: telfMatch ? telfMatch[1].trim() : "",
    notas: texto
  };
};

const getApiUrl = (path: string) => {
  const base = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://rora-app.onrender.com';
  return `${base}${path}`;
};

export const RoraChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initAgents = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch(getApiUrl('/api/rora/agents/setup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        alert(`¡RORA Central Activado! ID: ${data.agent_id}`);
      } else {
        alert('Fallo en la activación de agentes.');
      }
    } catch (error) {
      console.error('Error init agents:', error);
      alert('Error de conexión al activar agentes.');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Mensaje automático inicial
    setMessages([
      {
        id: 'initial-msg',
        role: 'rora',
        content: 'Hola, soy RORA. ¿En qué te ayudo hoy? Puedes contarme sobre una propiedad nueva, un cliente interesado, o lo que necesites.'
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'realtor',
      content: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const historial = messages
        .filter(m => m.id !== 'initial-msg')
        .map(m => ({
          role: m.role === 'realtor' ? 'user' : 'assistant',
          content: m.content
        }));

      // LLAMADA AL BACKEND en lugar de procesarMensajeRora directo
      const response = await fetch(getApiUrl('/api/rora/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: userText, historial })
      });

      if (!response.ok) throw new Error('Error en la comunicación con el servidor');
      
      const respuesta = await response.json();
      let ghlCreated = false;

      // Integración automática con GHL para la acción "lead" (vía backend)
      if (respuesta.accion === 'lead' && respuesta.datos) {
        const datosParseados = extraerDatosGHL(respuesta.datos);
        
        // LLAMADA AL BACKEND para crear el lead
        const leadResponse = await fetch(getApiUrl('/api/rora/lead'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosParseados)
        });

        if (leadResponse.ok) {
          const leadData = await leadResponse.json();
          ghlCreated = leadData.ghlCreated;
        }
      }

      const roraMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rora',
        content: respuesta.mensajeParaMostrar || '',
        accion: respuesta.accion,
        ghlCreated
      };

      setMessages(prev => [...prev, roraMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'rora',
        content: 'RORA no está disponible en este momento. Intenta de nuevo.',
        accion: 'ninguna'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBadge = (accion: string) => {
    switch (accion) {
      case 'contenido':
        return <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-1">Content Agent activado</span>;
      case 'lead':
        return <span className="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-1">Sales Agent activado</span>;
      case 'propiedad':
        return <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-1">Scout Agent activado</span>;
      case 'anuncio':
        return <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-lg uppercase tracking-wider mb-1">Performance Agent activado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-obsidian-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-obsidian-primary/10 rounded-full flex items-center justify-center border border-obsidian-primary/30">
              <Bot className="w-7 h-7 text-obsidian-primary" />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-obsidian-bg"></div>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              RORA
            </h1>
            <p className="text-xs text-obsidian-muted font-medium">Orquestador Principal</p>
          </div>
        </div>

        <button
          onClick={initAgents}
          disabled={isInitializing}
          className="text-[10px] uppercase tracking-wider px-3 py-1.5 bg-obsidian-primary/10 hover:bg-obsidian-primary/20 border border-obsidian-primary/30 rounded-lg text-obsidian-primary font-bold transition-all disabled:opacity-50"
        >
          {isInitializing ? 'Activando...' : '⚙️ Activar Agentes'}
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-hide pr-2"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'realtor' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                msg.role === 'realtor' 
                  ? 'bg-[#7F77DD] text-white rounded-tr-sm' 
                  : 'bg-[#2A2A2A] text-white rounded-tl-sm border border-obsidian-border'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base prose prose-invert max-w-none">
                {msg.role === 'rora' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              
              <div className="flex flex-col items-start">
                {msg.role === 'rora' && msg.accion && msg.accion !== 'ninguna' && (
                  getBadge(msg.accion)
                )}

                {msg.role === 'rora' && msg.ghlCreated && (
                  <span className="flex items-center gap-1 mt-1 text-[11px] font-medium text-green-400">
                    <Check className="w-3 h-3" /> Contacto creado en GHL ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2A2A2A] border border-obsidian-border text-white p-4 rounded-2xl rounded-tl-sm w-20 flex justify-center items-center h-12">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-obsidian-muted rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pt-4 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe un mensaje para RORA..."
            className="w-full bg-black/40 border border-obsidian-border rounded-xl px-6 py-4 pr-16 text-white placeholder:text-obsidian-muted focus:outline-none focus:border-obsidian-primary transition-colors"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 p-2.5 bg-[#7F77DD] hover:bg-[#6e67c7] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
