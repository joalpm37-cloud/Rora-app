import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Mic } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Interfaces needed for SpeechRecognition in TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}



type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      sender: 'bot',
      text: '¡Hola! Soy Rora, tu Directora de Orquesta inmobiliaria. ¿Cómo puedo ayudarte a escalar tu negocio hoy?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem('rora_session_id'));
  const [environmentId, setEnvironmentId] = useState<string | null>(() => localStorage.getItem('rora_environment_id'));
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    if (sessionId) localStorage.setItem('rora_session_id', sessionId);
    if (environmentId) localStorage.setItem('rora_environment_id', environmentId);
  }, [sessionId, environmentId]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConfig = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConfig) {
        const recognition = new SpeechRecognitionConfig();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          const finalTranscript = event.results[0][0].transcript;
          if (finalTranscript) {
             setChatInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta el dictado por voz automáticamente.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error al iniciar grabación", err);
        setIsListening(false);
      }
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isListening]);

  const sendToRora = async (text: string) => {
    try {
      const payload = { 
        mensaje: text,
        sessionId: sessionId 
      };
      console.log("Enviando a Rora Orchestrator:", payload);

      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001/api/rora/chat' 
        : 'https://rora-app.onrender.com/api/rora/chat';

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.success === true && data.reply) {
          // Guardar IDs para persistencia y eficiencia
          if (data.sessionId) setSessionId(data.sessionId);
          if (data.environmentId) setEnvironmentId(data.environmentId);
          return data.reply;
        }
      }
      return "Lo siento, RORA está experimentando una breve pausa técnica. Reintenta en un momento.";
    } catch (error) {
      console.error("Error communicating with Rora Backend:", error);
      throw error;
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    
    if (!chatInput.trim()) return;

    const currentText = chatInput.trim();
    setChatInput('');
    setLoading(true);

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentText
    };
    setMessages(prev => [...prev, newMsg]);

    try {
      const botResponseText = await sendToRora(currentText);

      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'bot',
        sender: 'bot',
        text: botResponseText
      }]);
    } catch (error) {
       setMessages(prev => [...prev, {
        id: Date.now().toString() + 'bot',
        sender: 'bot',
        text: "Hubo un problema al procesar la solicitud con Rora."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-obsidian-primary text-obsidian-bg rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform z-50",
          isOpen ? "hidden" : "flex"
        )}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-[calc(100vw-32px)] md:w-80 h-[500px] max-h-[80vh] bg-obsidian-card border border-obsidian-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-obsidian-primary text-obsidian-bg p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">Asistente Virtual Rora</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-black/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Interface */}
          <div className="flex flex-col flex-1 bg-obsidian-bg overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-2 max-w-[90%]", 
                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-obsidian-border",
                    msg.sender === 'user' ? "bg-obsidian-primary/20 text-obsidian-primary" : "bg-white/10 text-white"
                  )}>
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed overflow-hidden break-words",  
                    msg.sender === 'user' 
                      ? "bg-obsidian-primary text-obsidian-bg rounded-tr-none font-medium" 
                      : "bg-obsidian-card border border-obsidian-border rounded-tl-none text-gray-200"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                 <div className="flex gap-2 max-w-[85%] mr-auto items-center text-obsidian-muted">
                   <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-obsidian-border bg-white/10 text-white">
                      <Bot className="w-3.5 h-3.5" />
                   </div>
                   <div className="p-3 bg-obsidian-card border border-obsidian-border rounded-2xl rounded-tl-none flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                     <span className="text-xs opacity-70">Rora orquestando...</span>
                   </div>
                 </div>
              )}

              {/* Indicador de Escucha Visual */}
              {isListening && (
                <div className="flex justify-center my-2">
                   <div className="px-4 py-2 bg-red-500/20 text-red-500 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 border border-red-500/30">
                     <Mic className="w-3.5 h-3.5" />
                     Escuchando tu micrófono...
                   </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-obsidian-border bg-obsidian-card shrink-0">
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                
                {/* Botón Micrófono */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                    isListening 
                       ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
                       : "bg-white/5 text-obsidian-muted hover:text-white hover:bg-white/10"
                  )}
                  title={isListening ? "Detener grabación" : "Dictar por voz"}
                >
                  <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={isListening ? "Habla ahora..." : "Instrucciones para Rora..."}
                  className={cn(
                    "flex-1 border text-sm rounded-xl px-3 py-2 outline-none transition-colors",
                    isListening 
                      ? "bg-red-500/5 border-red-500/30 placeholder:text-red-500/70"
                      : "bg-obsidian-bg border-obsidian-border focus:border-obsidian-primary"
                  )}
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || loading}
                  className="w-10 h-10 shrink-0 bg-obsidian-primary text-obsidian-bg rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
