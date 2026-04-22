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
  CheckCheck,
  MessageSquare,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { collections } from '../lib/collections';
import { Conversation, Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { NewChatModal } from '../components/chat/NewChatModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Chats: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collections.conversations,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // Sort in memory to avoid requiring a composite index in Firestore
      convs.sort((a, b) => {
        const timeA = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const timeB = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
        return timeB - timeA;
      });
      
      setConversations(convs);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'conversations');
      } catch (e) {
        // Handled
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const q = query(
      collections.messages,
      where('conversationId', '==', selectedChat.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Mark as read if there are unread messages for current user
      if (user && selectedChat.unreadCount && selectedChat.unreadCount[user.uid] > 0) {
        const chatRef = doc(collections.conversations, selectedChat.id);
        updateDoc(chatRef, {
          [`unreadCount.${user.uid}`]: 0
        }).catch(e => console.error("Error marking as read", e));
      }

    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      } catch (e) {
        // Handled
      }
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedChat || !newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage(''); // Optimistic clear

    try {
      // 1. Add message
      await addDoc(collections.messages, {
        conversationId: selectedChat.id,
        senderId: user.uid,
        text,
        type: 'text',
        readBy: [user.uid],
        createdAt: Timestamp.now()
      });

      // 2. Update conversation lastMessage and unread counts
      const chatRef = doc(collections.conversations, selectedChat.id);
      
      // Increment unread count for all other participants
      const unreadUpdates: Record<string, any> = {};
      selectedChat.participants.forEach(pId => {
        if (pId !== user.uid) {
          unreadUpdates[`unreadCount.${pId}`] = (selectedChat.unreadCount?.[pId] || 0) + 1;
        }
      });

      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        ...unreadUpdates
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
      alert('Error al enviar el mensaje.');
    }
  };

  const getChatName = (chat: Conversation) => {
    if (!user) return 'Chat';
    const otherParticipantId = chat.participants.find(p => p !== user.uid);
    if (!otherParticipantId) return 'Chat personal';
    return chat.participantNames?.[otherParticipantId] || 'Usuario desconocido';
  };

  const filteredConversations = conversations.filter(chat => 
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] flex glass-card overflow-hidden relative">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-obsidian-border flex flex-col bg-obsidian-card absolute md:relative z-10 h-full transition-transform duration-300",
        selectedChat ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>
        <div className="p-4 border-b border-obsidian-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Mensajes</h2>
            <button 
              onClick={() => setIsNewChatModalOpen(true)}
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
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-obsidian-muted text-sm">
              No hay conversaciones.
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const unread = user && chat.unreadCount ? (chat.unreadCount[user.uid] || 0) : 0;
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
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border border-obsidian-border bg-white/10 text-white">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold truncate">{getChatName(chat)}</span>
                      <span className="text-[10px] text-obsidian-muted">{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-obsidian-muted truncate">{chat.lastMessage || 'Nueva conversación'}</p>
                      {unread > 0 && (
                        <span className="w-4 h-4 bg-obsidian-primary text-obsidian-bg text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-2">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-obsidian-border bg-white/10 text-white">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{getChatName(selectedChat)}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4 text-obsidian-muted">
                <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-obsidian-muted text-sm">
                  Envía un mensaje para comenzar la conversación.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={cn(
                        "flex items-start gap-3 max-w-[90%] md:max-w-[80%]",
                        isMine ? "self-end flex-row-reverse" : ""
                      )}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-obsidian-border",
                          isMine ? "bg-obsidian-primary/20 text-obsidian-primary" : "bg-white/10 text-white"
                        )}>
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className={cn(
                          "p-4 rounded-2xl",
                          isMine 
                            ? "bg-obsidian-primary text-obsidian-bg rounded-tr-none" 
                            : "bg-obsidian-card border border-obsidian-border rounded-tl-none"
                        )}>
                          <p className={cn(
                            "text-sm leading-relaxed",
                            isMine ? "font-medium" : ""
                          )}>
                            {msg.text}
                          </p>
                          <div className={cn(
                            "flex items-center gap-1 mt-2",
                            isMine ? "justify-end" : ""
                          )}>
                            <span className={cn(
                              "text-[10px]",
                              isMine ? "opacity-70" : "text-obsidian-muted"
                            )}>
                              {formatTime(msg.createdAt)}
                            </span>
                            {isMine && <CheckCheck className="w-3 h-3 opacity-70" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <footer className="p-4 bg-obsidian-card border-t border-obsidian-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-4 bg-obsidian-bg border border-obsidian-border rounded-2xl px-3 md:px-4 py-2">
                <Paperclip className="w-5 h-5 text-obsidian-muted cursor-pointer hover:text-white transition-colors shrink-0" />
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..." 
                  className="flex-1 bg-transparent text-sm outline-none py-2 min-w-0"
                />
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <Smile className="w-5 h-5 text-obsidian-muted cursor-pointer hover:text-white transition-colors hidden md:block" />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-8 h-8 bg-obsidian-primary text-obsidian-bg rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-obsidian-muted hidden md:flex">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona un chat para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {isNewChatModalOpen && (
        <NewChatModal 
          onClose={() => setIsNewChatModalOpen(false)}
          onChatCreated={(chatId) => {
            setIsNewChatModalOpen(false);
            // We could automatically select the new chat here if we find it in the list,
            // but since it's real-time, it will appear in the list momentarily.
          }}
        />
      )}
    </div>
  );
};
