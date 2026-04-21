/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Chats } from './pages/Chats';
import { Leads } from './pages/Leads';
import { Calendar } from './pages/Calendar';
import { Properties } from './pages/Properties';
import { AIAgents } from './pages/AIAgents';
import { Campaigns } from './pages/Campaigns';
import { Content } from './pages/Content';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';
import { More } from './pages/More';
import { Login } from './pages/Login';
import { CommandCenter } from './pages/CommandCenter';
import { useAuth } from './hooks/useAuth';
import { ShieldCheck, Clock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const { user, loading, isApproved, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-obsidian-bg flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-obsidian-soft/20 via-obsidian-bg to-obsidian-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 flex flex-col items-center text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Acceso Restringido</h1>
            <p className="text-obsidian-muted">
              Tu cuenta ha sido creada correctamente, pero un administrador debe aprobar tu acceso antes de que puedas entrar.
            </p>
          </div>

          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Estado: Esperando Aprobación
          </div>

          <div className="w-full pt-4 border-t border-obsidian-muted/10">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 text-obsidian-muted hover:text-white transition-colors text-sm w-full"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/content" element={<Content />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/more" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
