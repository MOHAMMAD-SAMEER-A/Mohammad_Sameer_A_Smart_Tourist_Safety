import React from 'react';
import PhoneMockup from '../components/PhoneMockup';
import { useSafety } from '../context/SafetyContext';
import { Shield, Sparkles, Network, BookOpen, AlertTriangle, Layers, Key } from 'lucide-react';

export default function TouristSandbox() {
  const { tourists, selectedTouristId, setSelectedTouristId } = useSafety();

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 min-h-0 overflow-y-auto lg:overflow-hidden bg-slate-900 text-slate-100">
      
      {/* Left Panel: Documentation & Controls (8 cols on lg) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6 lg:overflow-y-auto pr-0 lg:pr-4 select-none">
        
        {/* Header Title */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-cyan-500/15 border-l border-b border-cyan-500/20 px-3 py-1 text-xs font-mono text-cyan-400 rounded-bl-xl uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Prototype Sandbox
          </div>
          
          <h1 className="text-2xl font-black text-white font-mono tracking-tight uppercase flex items-center">
            KAVACH-NE
          </h1>
          <p className="text-cyan-400 font-mono text-xs font-semibold mt-1 tracking-wider">
            Smart Tourist Safety & Decentralized Incident Response System (SIH25002)
          </p>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Welcome to the public sandbox of KAVACH-NE, commissioned by the Ministry of Development of North Eastern Region. This interactive portal lets judges and engineers stress-test tourist-side protocols, rotating cryptographic tokens, and geo-fence alerts.
          </p>
        </div>

        {/* Tourist Selector Widget */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 mr-2 text-cyan-400" /> Select Sandbox Tourist Profile
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Node Sync Active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {tourists.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTouristId(t.id)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-300 font-mono ${
                  t.id === selectedTouristId
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-neon-glow'
                    : 'bg-slate-950/60 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-[11px] font-bold truncate">{t.name}</span>
                <span className="text-[9px] mt-1 text-slate-500 uppercase">{t.state}</span>
                <span className={`inline-block mt-2 text-[8px] font-bold uppercase rounded-md px-1.5 py-0.5 text-center w-fit ${
                  t.status === 'OK' ? 'bg-emerald-500/15 text-emerald-400' :
                  t.status === 'WRN' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400 animate-pulse'
                }`}>
                  {t.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Core Solution Brief & Problem Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 text-left">
            <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2 text-cyan-400" /> SIH Problem Statement
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              North East India presents rugged terrains, landslide corridors, dense canopy covers, and international border areas where communication grids are volatile. 
              <br/><br/>
              **SIH25002** commands a decentralized, dual-channel tracker system that handles tracking in total cell outages using packed SMS telemetry.
            </p>
          </div>

          <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-5 text-left">
            <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2 flex items-center">
              <Key className="w-4 h-4 mr-2 text-cyan-400" /> Decentralized DID Passport
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon entry, tourists receive a secure decentralized ID (`did:kavach:ne:...`). 
              <br/><br/>
              A time-bound cryptographic QR is rotated on the mobile application. Local checkpoint rangers scan these QR tokens to log checkpoints to the blockchain, building an audit ledger without cell service.
            </p>
          </div>

        </div>

        {/* Dynamic Sandbox User Instructions */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 text-left font-mono">
          <h4 className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-2 mb-3 flex items-center">
            <AlertTriangle className="w-4.5 h-4.5 mr-2 text-amber-500" /> Sandbox Interactive Guide
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">Step 1:</span>
              <span>Use the <strong>Select Sandbox Tourist Profile</strong> widget above to link the phone mockup to different tourists. Note how the DID, battery and logs change dynamically.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">Step 2:</span>
              <span>Click the <strong>"Drop Network"</strong> switch on the phone mockup. Watch the network status flip to offline and the <strong>Offline SMS Packer Widget</strong> render the compressed string.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">Step 3:</span>
              <span>Click <strong>"PANIC"</strong> in the phone mockup. This will register a high-attention distress event and generate an immutable ledger log immediately.</span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mr-2">Step 4:</span>
              <span>Verify these shifts instantly reflect on the <strong>Command Center View</strong> (switch views via the top navigation bar).</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Right Panel: Phone Frame Mockup (4 cols on lg) */}
      <div className="lg:col-span-5 xl:col-span-4 flex justify-center items-center p-2 lg:overflow-hidden bg-slate-950/40 rounded-3xl border border-slate-850">
        <PhoneMockup />
      </div>

    </div>
  );
}
