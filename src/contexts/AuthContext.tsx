import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isApproved: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const WHITELIST = ['joalpm23@gmail.com', 'joalpm37@gmail.com'];

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isApproved: false,
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // If in whitelist, auto-approve
        if (WHITELIST.includes(currentUser.email || '')) {
          setIsApproved(true);
          setLoading(false);
          return;
        }

        // Otherwise, listen to Firestore status
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setIsApproved(docSnap.data().approved === true);
          } else {
            setIsApproved(false);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user status", error);
          setLoading(false);
        });
      } else {
        setIsApproved(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const newUser = userCredential.user;
      
      // Initial user document
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        approved: WHITELIST.includes(newUser.email || ''),
        createdAt: serverTimestamp(),
        role: 'user'
      });
    } catch (error: any) {
      console.error("Error creating user", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isApproved, loginWithEmail, registerWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
