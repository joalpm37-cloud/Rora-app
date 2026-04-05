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
import { Settings } from './pages/Settings';
import { More } from './pages/More';
import { Login } from './pages/Login';
import { CommandCenter } from './pages/CommandCenter';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-obsidian-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
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
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/more" element={<More />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
