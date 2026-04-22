import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithEmail, registerWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Algo salió mal. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex flex-col items-center justify-center p-6">
      <div className="glass-card max-w-md w-full p-8 flex flex-col items-center text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-16 h-16" />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido a RORA</h1>
            <p className="text-obsidian-muted mt-2">
              {isLogin ? 'Inicia sesión para acceder a tu panel de control' : 'Crea una cuenta para comenzar'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-left">
              {error}
            </div>
          )}

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                className="w-full bg-black/20 border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold uppercase tracking-widest text-obsidian-muted">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-muted" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-black/20 border border-obsidian-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-obsidian-primary transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-obsidian-primary text-obsidian-bg font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="w-full pt-4 border-t border-obsidian-border text-sm">
          <span className="text-obsidian-muted">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          </span>
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-obsidian-primary font-bold hover:underline"
            disabled={loading}
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};
