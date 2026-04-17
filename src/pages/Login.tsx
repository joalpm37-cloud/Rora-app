import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-obsidian-soft/20 via-obsidian-bg to-obsidian-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 flex flex-col items-center space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
        
        <div className="flex flex-col items-center gap-4">
          <Logo className="w-16 h-16" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isRegistering ? 'Crea tu cuenta' : 'Bienvenido a RORA'}
            </h1>
            <p className="text-obsidian-muted mt-2">
              {isRegistering ? 'Únete a la nueva era inmobiliaria' : 'Inicia sesión para acceder a tu panel'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-obsidian-muted group-focus-within:text-emerald-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-obsidian-soft/30 border border-obsidian-muted/20 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-obsidian-muted/50"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-obsidian-muted group-focus-within:text-emerald-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-obsidian-soft/30 border border-obsidian-muted/20 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-obsidian-muted/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isRegistering ? 'Crear Cuenta' : 'Acceder'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="w-full pt-4 border-t border-obsidian-muted/10">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-obsidian-muted hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isRegistering ? (
              <>
                <LogIn className="w-4 h-4" />
                ¿Ya tienes cuenta? Inicia sesión
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                ¿No tienes cuenta? Regístrate
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
