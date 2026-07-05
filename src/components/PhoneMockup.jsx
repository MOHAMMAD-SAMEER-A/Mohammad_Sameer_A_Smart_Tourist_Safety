import React, { useState, useEffect } from 'react';
import { useSafety } from '../context/SafetyContext';
import { packSMS } from '../utils/smsPacker';
import { Shield, Radio, Battery, Wifi, WifiOff, AlertTriangle, RefreshCw, Key, Send, Copy, Check } from 'lucide-react';

export default function PhoneMockup() {
  const {
    tourists,
    selectedTouristId,
    triggerManualSOS,
    toggleOfflineMode,
    addSystemLog
  } = useSafety();

  const tourist = tourists.find(t => t.id === selectedTouristId) || tourists[0];
  const [rotatingKey, setRotatingKey] = useState('');
  const [qrPattern, setQrPattern] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('passport'); // passport, tracker, log

  // Generate rotating cryptographic QR key & grid pattern every 5 seconds
  useEffect(() => {
    if (!tourist) return;
    
    const generateToken = () => {
      const timeSeed = Math.floor(Date.now() / 5000); // changes every 5s
      const keyVal = `${tourist.did}:${timeSeed}`;
      // Generate a simple hex key hash representation
      let hash = 0;
      for (let i = 0; i < keyVal.length; i++) {
        hash = ((hash << 5) - hash) + keyVal.charCodeAt(i);
        hash |= 0;
      }
      const hexKey = Math.abs(hash).toString(16).padEnd(8, 'f') + Math.abs(hash * 31).toString(16).substring(0, 8);
      setRotatingKey(hexKey.toUpperCase());

      // Generate a mock QR grid layout (6x6 matrix of bits)
      const bits = [];
      let val = Math.abs(hash);
      for (let i = 0; i < 36; i++) {
        val = (val * 16807) % 2147483647;
        bits.push(val % 2 === 0);
      }
      setQrPattern(bits);
    };

    generateToken();
    const interval = setInterval(generateToken, 5000);
    return () => clearInterval(interval);
  }, [tourist, selectedTouristId]);

  if (!tourist) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400 font-mono">
        Loading Satellite Link...
      </div>
    );
  }

  // Get packed telemetry string
  const packedStr = packSMS({
    status: tourist.status,
    lat: tourist.lat,
    lng: tourist.lng,
    alt: tourist.alt,
    battery: tourist.battery
  });

  const handleCopySMS = () => {
    navigator.clipboard.writeText(packedStr);
    setCopied(true);
    addSystemLog(`Packed SMS telemetry copied to clipboard: ${packedStr}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mx-auto w-[310px] h-[620px] bg-slate-950 border-[10px] border-slate-800 rounded-[45px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-300">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2"></span>
        <span className="w-10 h-1 bg-slate-900 rounded"></span>
      </div>

      {/* Phone Status Bar */}
      <div className="h-9 px-6 pt-3 flex justify-between items-center text-[10px] text-slate-300 z-40 bg-slate-950 border-b border-slate-900/60 font-mono select-none">
        <span>19:47</span>
        <div className="flex items-center space-x-1.5">
          {tourist.offline ? (
            <WifiOff className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span className="text-[9px] uppercase tracking-tighter">
            {tourist.offline ? 'SMS-ONLY' : 'SATELLITE 5G'}
          </span>
          <div className="flex items-center space-x-0.5">
            <Battery className={`w-3.5 h-3.5 ${tourist.battery < 20 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`} />
            <span>{tourist.battery}%</span>
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 pt-4 pb-14 bg-gradient-to-b from-slate-950 to-slate-900">
        
        {/* Profile Card Summary */}
        <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
          <div>
            <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Tourist Profile</h3>
            <p className="text-sm font-bold text-white leading-tight mt-0.5">{tourist.name}</p>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">{tourist.did.substring(0, 24)}...</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
              tourist.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              tourist.status === 'WRN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
            }`}>
              {tourist.status}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('passport')}
            className={`py-1.5 rounded-lg font-medium text-center font-mono ${
              activeTab === 'passport' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            DID Passport
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-1.5 rounded-lg font-medium text-center font-mono ${
              activeTab === 'tracker' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`py-1.5 rounded-lg font-medium text-center font-mono ${
              activeTab === 'log' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            Device Logs
          </button>
        </div>

        {/* Tab 1: Blockchain DID Passport */}
        {activeTab === 'passport' && (
          <div className="space-y-4">
            {/* Rotating QR Key Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 text-center relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 bg-cyan-500/10 border-l border-b border-cyan-500/20 px-2 py-0.5 text-[7px] font-mono text-cyan-400 rounded-bl-lg tracking-wider flex items-center">
                <RefreshCw className="w-2 h-2 mr-1 animate-spin" style={{ animationDuration: '5s' }} /> TVI SYNCING
              </div>

              <h4 className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-3">Time-Bound DID Checkpoint</h4>
              
              {/* Simulated QR Code Canvas */}
              <div className="w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40">
                <div className="grid grid-cols-6 gap-1 w-full h-full relative">
                  {/* Corner Anchors */}
                  <div className="absolute top-0 left-0 w-8 h-8 bg-slate-900 border-2 border-white rounded-md"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-slate-900 border-2 border-white rounded-md"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-slate-900 border-2 border-white rounded-md"></div>
                  
                  {/* Internal Grid Bits */}
                  {qrPattern.map((bit, idx) => {
                    // Check if block is inside anchor zones (skip corner anchors to keep it QR-like)
                    const isAnchor =
                      (idx < 2 && idx % 6 < 2) || // top-left
                      (idx < 2 && idx % 6 >= 4) || // top-right
                      (idx >= 30 && idx % 6 < 2);  // bottom-left
                    
                    return (
                      <div
                        key={idx}
                        className={`rounded-sm transition-all duration-300 ${
                          isAnchor ? 'bg-transparent' : (bit ? 'bg-slate-950' : 'bg-slate-50')
                        }`}
                      ></div>
                    );
                  })}
                </div>
              </div>

              {/* ROTATING SECURITY KEY */}
              <div className="mt-3.5 w-full bg-slate-950/80 border border-slate-900 rounded-xl p-2 font-mono">
                <p className="text-[8px] text-slate-400">CRYPTOGRAPHIC ROTATING TOKEN</p>
                <p className="text-xs font-bold text-cyan-400 tracking-widest mt-0.5 select-all flex items-center justify-center">
                  <Key className="w-3 h-3 mr-1 text-cyan-400" /> {rotatingKey}
                </p>
              </div>

              <div className="mt-2 text-[9px] text-slate-400 font-mono">
                Scanned by rangers at checkpoints to update the blockchain ledger offline or online.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GPS & Sensor Telemetry */}
        {activeTab === 'tracker' && (
          <div className="space-y-3 font-mono text-left">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block uppercase">Latitude</span>
                <span className="font-bold text-white text-xs">{tourist.lat.toFixed(4)}° N</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block uppercase">Longitude</span>
                <span className="font-bold text-white text-xs">{tourist.lng.toFixed(4)}° E</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block uppercase">Elevation (ALT)</span>
                <span className="font-bold text-white text-xs">{tourist.alt} m</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5">
                <span className="text-[8px] text-slate-400 block uppercase">Risk Rating</span>
                <span className="font-bold text-white text-xs flex items-center">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${
                    tourist.status === 'OK' ? 'bg-emerald-500' :
                    tourist.status === 'WRN' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></span>
                  {tourist.status === 'OK' ? 'LOW' : tourist.status === 'WRN' ? 'ELEVATED' : 'CRITICAL'}
                </span>
              </div>
            </div>

            {/* Offline Packing Visualizer */}
            {tourist.offline && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center">
                    <Radio className="w-3.5 h-3.5 mr-1 text-amber-400 animate-pulse" /> Offline SMS Packer Active
                  </span>
                  <span className="text-[8px] text-slate-400">Compressed: {packedStr.length} chars</span>
                </div>
                <div className="bg-slate-950 border border-slate-900 rounded-lg p-2 flex justify-between items-center text-[10px] break-all select-all font-semibold">
                  <code className="text-cyan-400">{packedStr}</code>
                  <button
                    onClick={handleCopySMS}
                    className="ml-2 p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 transition-colors text-slate-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal font-sans">
                  No cell tower coverage found. Coordinates and status are compressed into a sub-40 character payload for transmission via sat-SMS protocols.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Local Logs */}
        {activeTab === 'log' && (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-3 flex-1 flex flex-col text-left font-mono">
            <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2 border-b border-slate-800/85 pb-1 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1" /> Local Telemetry Logs
            </h4>
            <div className="flex-1 space-y-2 text-[10px] overflow-y-auto max-h-[170px] pr-1">
              {tourist.phoneLogs.map((log, idx) => (
                <div key={idx} className="border-l border-cyan-500/20 pl-2 py-0.5">
                  <span className="text-cyan-500 text-[9px] font-semibold">[{log.time}]</span>{' '}
                  <span className="text-slate-300">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Simulation Toggle */}
        <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-2.5 flex justify-between items-center font-mono">
          <div className="text-left">
            <span className="text-[9px] text-slate-400 uppercase">Network Simulation</span>
            <p className="text-[10px] text-white font-bold mt-0.5">
              {tourist.offline ? 'TOTAL NETWORK DROP' : 'CELLULAR ONLINE'}
            </p>
          </div>
          <button
            onClick={() => toggleOfflineMode(tourist.id)}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[9px] uppercase transition-all duration-300 border ${
              tourist.offline 
                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 shadow-neon-crimson'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-neon-emerald'
            }`}
          >
            {tourist.offline ? 'Go Online' : 'Drop Network'}
          </button>
        </div>

        {/* PANIC BUTTON */}
        <div className="pt-2 flex flex-col items-center">
          <button
            onClick={() => triggerManualSOS(tourist.id)}
            disabled={tourist.status === 'SOS'}
            className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 relative ${
              tourist.status === 'SOS'
                ? 'bg-red-600/30 border-red-500 text-red-500 shadow-neon-crimson cursor-not-allowed'
                : 'bg-red-600 border-red-500 text-white hover:bg-red-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            }`}
          >
            {tourist.status === 'SOS' && (
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-60"></span>
            )}
            <AlertTriangle className="w-8 h-8 mb-1" />
            <span className="text-xs font-mono font-black uppercase tracking-widest">
              {tourist.status === 'SOS' ? 'ACTIVE' : 'PANIC'}
            </span>
            <span className="text-[8px] font-mono opacity-80 uppercase tracking-tighter mt-0.5">
              {tourist.status === 'SOS' ? 'Escalated' : 'Press 1s'}
            </span>
          </button>
          
          <p className="text-[8px] font-mono text-slate-400 mt-2 tracking-wide text-center">
            {tourist.status === 'SOS' 
              ? 'EMERGENCY SOS SIGNAL BROADCAST ACTIVE'
              : 'Pressing PANIC triggers instant DID blockchain audit ledger report and launches air-rescue protocol.'}
          </p>
        </div>

      </div>

      {/* Screen bottom bar */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-800 rounded"></div>
    </div>
  );
}
