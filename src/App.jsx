import React, { useState } from 'react';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import TouristSandbox from './views/TouristSandbox';
import AdminDashboard from './views/AdminDashboard';
import { Shield, Smartphone, Radio, Server, Heart } from 'lucide-react';

function DashboardShell() {
  const [currentView, setCurrentView] = useState('admin'); // default to 'admin' command center
  const { incidents, tourists } = useSafety();

  const openIncidents = incidents.filter(i => i.status === 'OPEN').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans select-none">
      
      {/* 1. Global Tactical Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand/System Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-widest text-white uppercase font-mono">KAVACH-NE</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-mono font-bold">
                SIH25002
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5 tracking-wider">
              Smart Safety & Rescue Command System
            </p>
          </div>
        </div>

        {/* Tactical Switch Tabs */}
        <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-2xl space-x-1">
          <button
            onClick={() => setCurrentView('admin')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 ${
              currentView === 'admin'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-neon-indigo'
                : 'text-slate-400 hover:text-white hover:bg-slate-850/50'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Ministry Command Centre</span>
          </button>
          
          <button
            onClick={() => setCurrentView('tourist')}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-300 relative ${
              currentView === 'tourist'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-neon-glow'
                : 'text-slate-400 hover:text-white hover:bg-slate-850/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Tourist App Sandbox</span>
            
            {/* Alarm Badge on Tourist switch if there's an open incident */}
            {openIncidents > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] items-center justify-center text-white font-bold">
                  {openIncidents}
                </span>
              </span>
            )}
          </button>
        </div>

        {/* Global Connection Status */}
        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-slate-500 text-[9px] uppercase">Gis Grid Node</span>
            <span className="text-slate-300 font-bold">Guwahati, IN</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-900 hidden sm:block"></div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-widest">Sys Link Active</span>
          </div>
        </div>

      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-900">
        {currentView === 'admin' ? <AdminDashboard /> : <TouristSandbox />}
      </main>

      {/* 3. Footer HUD */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-2.5 flex justify-between items-center text-[9.5px] font-mono text-slate-500 select-none">
        <div>
          <span>MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION (MDoNER) © 2026</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>MADE FOR SIH 2025</span>
          <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500 animate-pulse" />
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <SafetyProvider>
      <DashboardShell />
    </SafetyProvider>
  );
}
