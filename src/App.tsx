/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { Toaster } from 'sonner';
import { cn } from './lib/utils';

function AppContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center selection:bg-cyan-500/30 p-0 relative overflow-hidden transition-colors duration-500",
      isDark ? "bg-[#050510] text-white" : "bg-[#fdfdff] text-slate-900"
    )} style={isDark ? { background: 'radial-gradient(circle at top right, #1e1b4b, #050510, #09090b)' } : { background: 'radial-gradient(circle at top right, #f0f9ff, #fafafa, #ffffff)' }}>
      {/* Decorative Background Elements */}
      <div className={cn("absolute -z-0 w-[600px] h-[600px] blur-[140px] -top-40 -left-40 pointer-events-none transition-opacity duration-1000", isDark ? "bg-indigo-600/20 opacity-100" : "bg-blue-400/10 opacity-60")} />
      <div className={cn("absolute -z-0 w-[500px] h-[500px] blur-[120px] -bottom-40 -right-40 pointer-events-none transition-opacity duration-1000", isDark ? "bg-fuchsia-600/20 opacity-100" : "bg-purple-400/10 opacity-50")} />
      <div className={cn("absolute -z-0 w-[400px] h-[400px] blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000", isDark ? "bg-cyan-600/10 opacity-60" : "bg-cyan-400/5 opacity-40")} />

      {/* Application Container */}
      <div className={cn(
        "w-full max-w-full h-screen relative flex flex-col overflow-hidden z-10 transition-all duration-500",
        // Menggunakan backdrop-blur yang lebih rendah di mobile untuk performa
        "backdrop-blur-xl sm:backdrop-blur-3xl",
        isDark ? "bg-black/20 shadow-[0_0_80px_rgba(0,0,0,0.4)]" : "bg-white/60 shadow-[0_0_80px_rgba(0,0,0,0.05)]"
      )}>
        <Toaster position="top-right" expand={false} richColors theme={theme} />
        {user ? <Dashboard /> : <AuthScreen />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
