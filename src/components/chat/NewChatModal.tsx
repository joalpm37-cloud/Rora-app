import React, { useState, useEffect } from 'react';
import { X, Search, User as UserIcon } from 'lucide-react';
import { collection, query, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { collections } from '../../lib/collections';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { handleFirestoreError, OperationType } from '../../lib/error-handling';
import { sendEventToMake } from '../../services/makeIntegration';

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onChatCreated }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.agencyId) return;
      try {
        // In a real app, we might want to filter by agencyId
        // const q = query(collections.users, where('agencyId', '==', user.agencyId));
        const q = query(collections.users);
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs
          .map(doc => ({ uid: doc.id, ...doc.data() } as User))
          .filter(u => u.uid !== user.uid); // Exclude current user
        setUsers(usersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (targetUser: User) => {
    if (!user || creating) return;
    setCreating(true);
    
    try {
      // Create a new conversation
      const newConvRef = await addDoc(collections.conversations, {
        agencyId: user.agencyId || 'default-agency',
        participants: [user.uid, targetUser.uid],
        participantNames: {
          [user.uid]: user.displayName || user.email || 'Unknown',
          [targetUser.uid]: targetUser.name || targetUser.email || 'Unknown'
        },
        unreadCount: {
          [user.uid]: 0,
          [targetUser.uid]: 0
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      await sendEventToMake({
        type: "chat.created",
        payload: {
          conversationId: newConvRef.id,
          agencyId: user.agencyId || 'default-agency',
          participants: [user.uid, targetUser.uid],
          participantNames: {
            [user.uid]: user.displayName || user.email || 'Unknown',
            [targetUser.uid]: targetUser.name || targetUser.email || 'Unknown'
          },
          createdAt: new Date().toISOString()
        }
      });
      
      onChatCreated(newConvRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'conversations');
      alert('Error al crear el chat. Revisa los permisos de Firestore.');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-obsidian-bg border border-obsidian-border rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-6 border-b border-obsidian-border">
          <h2 className="text-xl font-bold">Nuevo Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-obsidian-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuario..." 
              className="w-full bg-obsidian-card border border-obsidian-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-obsidian-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-8 text-center text-obsidian-muted text-sm">Cargando usuarios...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-obsidian-muted text-sm">No se encontraron usuarios.</div>
          ) : (
            filteredUsers.map(u => (
              <button
                key={u.uid}
                onClick={() => handleStartChat(u)}
                disabled={creating}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-obsidian-card border border-obsidian-border flex items-center justify-center shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-obsidian-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{u.name || 'Usuario sin nombre'}</div>
                  <div className="text-xs text-obsidian-muted truncate">{u.email}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
