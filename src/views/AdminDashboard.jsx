import React, { useState } from 'react';
import { useSafety } from '../context/SafetyContext';
import MapSimulator from '../components/MapSimulator';
import { calculateRiskScore } from '../utils/riskProfiler';
import { verifyChainIntegrity } from '../utils/blockchain';
import { packSMS } from '../utils/smsPacker';
import {
  Users,
  AlertOctagon,
  ShieldCheck,
  Radio,
  FileText,
  Activity,
  Sliders,
  CheckCircle,
  Hash,
  Download,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    tourists,
    incidents,
    blockchain,
    selectedTouristId,
    systemLogs,
    updateTouristFactors,
    resolveIncident,
    decodeSMSAndLocate,
    addSystemLog
  } = useSafety();

  const [smsInput, setSmsInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const selectedTourist = tourists.find(t => t.id === selectedTouristId) || tourists[0];

  // Calculate Metrics
  const activeTouristsCount = tourists.length;
  const openIncidentsCount = incidents.filter(i => i.status === 'OPEN').length;
  
  // Hazard alerts count (tourists in WRN or SOS states)
  const hazardAlertsCount = tourists.filter(t => t.status !== 'OK').length;
  
  // Border Integrity score: decrease by 25% for each tourist breached into the Border Purple Zone
  const touristsInBorder = tourists.filter(t => t.factors.borderProximity > 75).length;
  const borderIntegrity = Math.max(0, 100 - (touristsInBorder * 25));

  // Handle manual SMS decode submission
  const handleSMSDecode = (e) => {
    e.preventDefault();
    if (!smsInput.trim()) return;
    
    const success = decodeSMSAndLocate(smsInput);
    if (success) {
      setSmsInput('');
    }
  };

  // Quick simulate SMS transfer from sandbox
  const handleQuickSimulateSMS = () => {
    if (!selectedTourist) return;
    
    // Create packed SMS payload for the current selected tourist
    const dataToPack = {
      status: selectedTourist.status,
      lat: selectedTourist.lat,
      lng: selectedTourist.lng,
      alt: selectedTourist.alt,
      battery: selectedTourist.battery
    };
    
    const packed = packSMS(dataToPack);
    setSmsInput(packed);
    addSystemLog(`Simulated SMS telemetry loaded from sandbox: ${packed}`, 'info');
  };

  // Run blockchain validation checks
  const handleVerifyBlockchain = () => {
    setVerifying(true);
    setVerificationResult(null);
    
    setTimeout(() => {
      const result = verifyChainIntegrity(blockchain);
      setVerifying(false);
      setVerificationResult(result);
      
      if (result.isValid) {
        addSystemLog("Blockchain cryptographic audit validation check PASSED.", "success");
      } else {
        addSystemLog(`Blockchain audit validation check FAILED: ${result.errorDetails}`, "error");
      }
      
      // Reset indicator flash after 3 seconds
      setTimeout(() => setVerificationResult(null), 3500);
    }, 800);
  };

  // Format UNIX timestamp
  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString();
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 p-6 min-h-0 overflow-y-auto bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. Dashboard Tactical Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Active Inbound Tourists</span>
            <span className="text-3xl font-black text-white font-mono mt-1 block">{activeTouristsCount}</span>
            <span className="text-[9px] font-mono text-emerald-400 mt-1 block">● Real-time GPS Uplink</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Distress Incidents</span>
            <span className="text-3xl font-black text-red-500 font-mono mt-1 block">{openIncidentsCount}</span>
            <span className={`text-[9px] font-mono mt-1 block ${openIncidentsCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
              {openIncidentsCount > 0 ? '⚠️ Rescue deployed' : '✓ Secure state'}
            </span>
          </div>
          <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
            openIncidentsCount > 0 
              ? 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse' 
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}>
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Active Hazard Warnings</span>
            <span className="text-3xl font-black text-amber-500 font-mono mt-1 block">{hazardAlertsCount}</span>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">In weather/altitude corridors</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="text-left">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Border Belt Integrity</span>
            <span className="text-3xl font-black text-indigo-400 font-mono mt-1 block">{borderIntegrity}%</span>
            <span className="text-[9px] font-mono text-slate-400 mt-1 block">Geofence buffer corridor score</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Map Visualizer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <MapSimulator />
          
          {/* Incident Logs Stack */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-cyan-400" /> Active Emergency Dispatch Feeds
            </h3>
            
            {incidents.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-4 text-center">No active distress logs. System secure.</p>
            ) : (
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-xl border transition-all duration-300 ${
                      inc.status === 'RESOLVED'
                        ? 'bg-slate-900/30 border-slate-850 opacity-60'
                        : 'bg-red-500/5 border-red-500/20 shadow-neon-crimson'
                    }`}
                  >
                    <div className="text-left font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          inc.status === 'RESOLVED' ? 'bg-slate-600' : 'bg-red-500 animate-pulse'
                        }`}></span>
                        <span className="text-xs font-black text-white">{inc.type}</span>
                        <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 rounded px-1.5 font-bold uppercase">
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Node Target: <span className="font-bold text-white">{inc.touristName}</span> | Coordinates: {inc.lat.toFixed(4)}N, {inc.lng.toFixed(4)}E
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Timestamp: {new Date(inc.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {inc.status === 'OPEN' && (
                      <button
                        onClick={() => resolveIncident(inc.id)}
                        className="mt-3 md:mt-0 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg transition-all duration-200 uppercase"
                      >
                        Resolve Incident
                      </button>
                    )}
                    {inc.status === 'RESOLVED' && (
                      <span className="mt-3 md:mt-0 text-xs font-mono text-emerald-500 font-bold uppercase flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Rescue Success
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Risk Sliders & SMS Unpacker (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SMS Unpacking Decoder Panel */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center">
              <Radio className="w-4.5 h-4.5 mr-2 text-cyan-400" /> SMS Telemetry Decoder
            </h3>
            <p className="text-xs text-slate-400 leading-normal mb-4 font-sans">
              Enter compressed SMS payloads received from offline networks. Decoding updates coordinate vectors.
            </p>
            <form onSubmit={handleSMSDecode} className="space-y-3 font-mono">
              <input
                type="text"
                placeholder="e.g. SOS#26144N91736E#A78B54"
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-bold tracking-widest text-center"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all duration-200 uppercase"
                >
                  Decode & Map Coordinates
                </button>
              </div>
            </form>

            {/* Quick Simulation Help Card */}
            {selectedTourist && selectedTourist.offline && (
              <div className="mt-3.5 p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <p className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Simulation Payload Ready</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Click below to quickly load the selected tourist's offline SMS package:
                </p>
                <button
                  type="button"
                  onClick={handleQuickSimulateSMS}
                  className="w-full bg-slate-950 p-2 rounded border border-slate-850 font-mono text-xs text-center select-all cursor-pointer font-bold text-yellow-500 hover:bg-slate-900 transition-colors"
                >
                  {packSMS({
                    status: selectedTourist.status,
                    lat: selectedTourist.lat,
                    lng: selectedTourist.lng,
                    alt: selectedTourist.alt,
                    battery: selectedTourist.battery
                  })}
                </button>
              </div>
            )}
          </div>

          {/* Risk Score Analytical Profiler Engine */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center">
              <Sliders className="w-4.5 h-4.5 mr-2 text-cyan-400" /> ML Vulnerability Profiler
            </h3>
            
            {selectedTourist ? (
              <div className="space-y-4 mt-3 font-mono text-xs">
                <div className="border-b border-slate-800 pb-2 mb-2">
                  <span className="text-[9px] text-slate-400 uppercase">Profiling Target:</span>
                  <p className="text-sm font-bold text-white mt-0.5">{selectedTourist.name}</p>
                </div>

                {/* Live Vuln Index Score display */}
                {(() => {
                  const risk = calculateRiskScore(selectedTourist.factors);
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-slate-400 uppercase">Vulnerability Index:</span>
                        <span className={`text-xl font-black ${
                          risk.level === 'LOW' ? 'text-emerald-400' :
                          risk.level === 'ELEVATED' ? 'text-amber-400' : 'text-red-500 animate-pulse'
                        }`}>
                          {risk.score}%
                        </span>
                      </div>
                      
                      {/* Color Bar representation */}
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(35, risk.score)}%` }}></div>
                        <div className="bg-amber-500 h-full" style={{ width: `${Math.max(0, Math.min(35, risk.score - 35))}%` }}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${Math.max(0, risk.score - 70)}%` }}></div>
                      </div>
                      
                      <p className="text-[10px] text-slate-300 leading-normal mt-1 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                        {risk.description}
                      </p>
                    </div>
                  );
                })()}

                {/* Risk Control Sliders */}
                <div className="space-y-3 pt-2">
                  {/* Slider 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Weather Severity</span>
                      <span className="text-white font-bold">{selectedTourist.factors.weather}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTourist.factors.weather}
                      onChange={(e) => updateTouristFactors(selectedTourist.id, { weather: parseInt(e.target.value) })}
                      className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Terrain Ruggedness</span>
                      <span className="text-white font-bold">{selectedTourist.factors.terrain}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTourist.factors.terrain}
                      onChange={(e) => updateTouristFactors(selectedTourist.id, { terrain: parseInt(e.target.value) })}
                      className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Border Proximity</span>
                      <span className="text-white font-bold">{selectedTourist.factors.borderProximity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTourist.factors.borderProximity}
                      onChange={(e) => updateTouristFactors(selectedTourist.id, { borderProximity: parseInt(e.target.value) })}
                      className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 4 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Itinerary Deviation</span>
                      <span className="text-white font-bold">{selectedTourist.factors.deviation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedTourist.factors.deviation}
                      onChange={(e) => updateTouristFactors(selectedTourist.id, { deviation: parseInt(e.target.value) })}
                      className="w-full accent-cyan-500 h-1 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-500 mt-2 text-center">Select a locator node to profile</p>
            )}
          </div>

        </div>

      </div>

      {/* 3. Blockchain Audit Ledger Visualizer */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
          <div className="text-left font-mono">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <Hash className="w-4.5 h-4.5 mr-2 text-indigo-400" /> Decentralized Audit Ledger
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Immutable logs generated on GPS check crossings, manual distress calls, and factor adjustments.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {verificationResult !== null && (
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-lg border animate-pulse ${
                verificationResult.isValid
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {verificationResult.isValid ? '✓ INTEGRITY VERIFIED (SHA-256 OK)' : `❌ TAMPERED: ${verificationResult.errorDetails}`}
              </span>
            )}
            <button
              onClick={handleVerifyBlockchain}
              disabled={verifying}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all duration-200 uppercase flex items-center"
            >
              {verifying ? 'Verifying Hashes...' : 'Verify Block Integrity'}
            </button>
          </div>
        </div>

        {/* Ledger Blocks Grid */}
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin">
          {blockchain.map((block) => (
            <div
              key={block.index}
              className="flex-shrink-0 w-80 bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[10px] font-mono relative overflow-hidden transition-all duration-300 hover:border-indigo-500/50"
            >
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5 mb-1.5">
                <span className="text-indigo-400 font-bold">BLOCK #{block.index}</span>
                <span className="text-[8px] text-slate-500">{formatTime(block.timestamp)}</span>
              </div>
              
              <div className="space-y-1 text-slate-300">
                <p className="truncate"><span className="text-slate-500 uppercase text-[9px]">Event:</span> <span className="font-bold text-white">{block.payload.event || 'System Log'}</span></p>
                {block.payload.touristName && (
                  <p><span className="text-slate-500 uppercase text-[9px]">Tourist:</span> {block.payload.touristName}</p>
                )}
                {block.payload.zone && (
                  <p><span className="text-slate-500 uppercase text-[9px]">Geofence:</span> {block.payload.zone}</p>
                )}
                {block.payload.oldLevel && (
                  <p><span className="text-slate-500 uppercase text-[9px]">Shift:</span> {block.payload.oldLevel} → {block.payload.newLevel}</p>
                )}
                {block.payload.packedString && (
                  <p className="truncate"><span className="text-slate-500 uppercase text-[9px]">SMS Packed:</span> {block.payload.packedString}</p>
                )}
              </div>

              <div className="pt-1.5 border-t border-slate-850 mt-2 space-y-1">
                <p className="text-[8.5px] truncate select-all"><span className="text-slate-500">PREV HASH:</span> {block.prevHash}</p>
                <p className="text-[8.5px] truncate select-all"><span className="text-indigo-400">HASH:</span> {block.hash}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
