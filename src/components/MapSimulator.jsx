import React, { useRef, useState, useEffect } from 'react';
import { useSafety } from '../context/SafetyContext';
import { MAP_ZONES } from '../utils/geoFence';

export default function MapSimulator() {
  const { tourists, updateTouristLocation, selectedTouristId, setSelectedTouristId, addSystemLog } = useSafety();
  const svgRef = useRef(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  // Coordinate conversion bounds:
  // Lng: 89.5 E to 97.5 E (Width: 800px)
  // Lat: 21.5 N to 29.5 N (Height: 500px)
  const mapWidth = 800;
  const mapHeight = 500;
  const minLng = 89.5;
  const maxLng = 97.5;
  const minLat = 21.5;
  const maxLat = 29.5;

  const toSvgX = (lng) => ((lng - minLng) / (maxLng - minLng)) * mapWidth;
  const toSvgY = (lat) => ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

  const toLatLng = (x, y) => {
    const lng = minLng + (x / mapWidth) * (maxLng - minLng);
    const lat = maxLat - (y / mapHeight) * (maxLat - minLat);
    return {
      lat: Math.min(maxLat, Math.max(minLat, lat)),
      lng: Math.min(maxLng, Math.max(minLng, lng))
    };
  };

  // State Path Outlines (Seven Sisters) to make a gorgeous vector visual
  const stateOutlines = [
    {
      name: "Arunachal Pradesh",
      path: "M 120,60 L 320,50 L 520,70 L 680,80 L 740,110 L 760,160 L 700,210 L 640,190 L 540,210 L 450,170 L 380,180 L 260,130 Z",
      color: "rgba(30, 41, 59, 0.45)"
    },
    {
      name: "Assam",
      path: "M 100,200 L 250,140 L 370,185 L 470,175 L 530,215 L 630,195 L 680,210 L 620,270 L 520,260 L 460,285 L 390,240 L 280,290 L 120,245 Z",
      color: "rgba(51, 65, 85, 0.35)"
    },
    {
      name: "Meghalaya",
      path: "M 130,250 L 290,250 L 280,295 L 120,290 Z",
      color: "rgba(71, 85, 105, 0.4)"
    },
    {
      name: "Nagaland",
      path: "M 625,200 L 690,215 L 670,290 L 610,260 Z",
      color: "rgba(15, 23, 42, 0.5)"
    },
    {
      name: "Manipur",
      path: "M 605,265 L 665,295 L 635,370 L 575,340 Z",
      color: "rgba(30, 41, 59, 0.5)"
    },
    {
      name: "Mizoram",
      path: "M 550,350 L 600,350 L 585,465 L 530,425 Z",
      color: "rgba(15, 23, 42, 0.65)"
    },
    {
      name: "Tripura",
      path: "M 440,330 L 500,335 L 485,410 L 430,390 Z",
      color: "rgba(71, 85, 105, 0.3)"
    }
  ];

  const handleMouseDown = (touristId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedNode(touristId);
    setSelectedTouristId(touristId);
    addSystemLog(`Began dragging tactical locator node for ${tourists.find(t => t.id === touristId)?.name}`, 'info');
  };

  const handleMouseMove = (e) => {
    if (!draggedNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale standard mouse coordinate within SVG viewbox 0-800, 0-500
    const svgX = (x / rect.width) * mapWidth;
    const svgY = (y / rect.height) * mapHeight;
    
    const coords = toLatLng(svgX, svgY);
    updateTouristLocation(draggedNode, coords.lat, coords.lng);
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      addSystemLog(`Locking coordinates for ${tourists.find(t => t.id === draggedNode)?.name}`, 'success');
      setDraggedNode(null);
    }
  };

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* HUD Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono tracking-widest text-cyan-400 font-semibold uppercase">Tactical GIS Monitor Grid</span>
        </div>
        <div className="flex space-x-4 text-[10px] font-mono text-slate-400">
          <div><span className="inline-block w-2.5 h-1.5 bg-red-500/25 border border-red-500 mr-1"></span> Landslide Red Zones</div>
          <div><span className="inline-block w-2.5 h-1.5 bg-amber-500/25 border border-amber-500 mr-1"></span> High-Alt Forest Orange Zones</div>
          <div><span className="inline-block w-2.5 h-1.5 bg-indigo-500/25 border border-indigo-500 mr-1"></span> Border Security Purple Zones</div>
        </div>
      </div>

      {/* SVG GIS Grid Area */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-auto select-none bg-slate-950/90"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
          </pattern>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5bc0be" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#5bc0be" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Radar Glow Background */}
        <circle cx="400" cy="250" r="350" fill="url(#glow)" />

        {/* 1. Draw North Eastern State Boundaries */}
        <g id="states-group">
          {stateOutlines.map((state, idx) => (
            <path
              key={idx}
              d={state.path}
              fill={state.color}
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="1.5"
              className="transition-colors hover:fill-slate-800/60 duration-200"
            />
          ))}
          
          {/* State Text Titles */}
          <text x="500" y="100" fill="rgba(148, 163, 184, 0.35)" fontSize="12" fontFamily="monospace" textAnchor="middle">Arunachal Pradesh</text>
          <text x="350" y="210" fill="rgba(148, 163, 184, 0.35)" fontSize="12" fontFamily="monospace" textAnchor="middle">Assam</text>
          <text x="210" y="275" fill="rgba(148, 163, 184, 0.35)" fontSize="10" fontFamily="monospace" textAnchor="middle">Meghalaya</text>
          <text x="655" y="240" fill="rgba(148, 163, 184, 0.35)" fontSize="10" fontFamily="monospace" textAnchor="middle">Nagaland</text>
          <text x="625" y="315" fill="rgba(148, 163, 184, 0.35)" fontSize="10" fontFamily="monospace" textAnchor="middle">Manipur</text>
          <text x="575" y="405" fill="rgba(148, 163, 184, 0.35)" fontSize="10" fontFamily="monospace" textAnchor="middle">Mizoram</text>
          <text x="465" y="375" fill="rgba(148, 163, 184, 0.35)" fontSize="10" fontFamily="monospace" textAnchor="middle">Tripura</text>
        </g>

        {/* 2. Plot Geo-fenced Danger Zones */}
        
        {/* Red Zones (Landslides) */}
        {MAP_ZONES.red.map((zone, idx) => (
          <g key={`red-${idx}`}>
            <polygon
              points={zone.points.map(p => `${toSvgX(p[1])},${toSvgY(p[0])}`).join(' ')}
              className="fill-red-500/10 stroke-red-500/40"
              strokeWidth="2"
              strokeDasharray="4 4"
              onMouseEnter={() => setHoveredZone({ ...zone, type: 'RED ZONE' })}
              onMouseLeave={() => setHoveredZone(null)}
            />
            <text
              x={toSvgX(zone.points[0][1]) + 15}
              y={toSvgY(zone.points[0][0]) + 20}
              fill="rgb(239, 68, 68)"
              fontSize="9"
              fontFamily="monospace"
              className="opacity-60 pointer-events-none"
            >
              ⚠️ Landslide Danger Area
            </text>
          </g>
        ))}

        {/* Orange Zones (High Altitude/Dense Forest) */}
        {MAP_ZONES.orange.map((zone, idx) => (
          <g key={`orange-${idx}`}>
            <polygon
              points={zone.points.map(p => `${toSvgX(p[1])},${toSvgY(p[0])}`).join(' ')}
              className="fill-amber-500/10 stroke-amber-500/30"
              strokeWidth="2"
              strokeDasharray="6 3"
              onMouseEnter={() => setHoveredZone({ ...zone, type: 'CAUTION ZONE' })}
              onMouseLeave={() => setHoveredZone(null)}
            />
          </g>
        ))}

        {/* Purple Zones (Border Corridors) */}
        {MAP_ZONES.purple.map((zone, idx) => (
          <g key={`purple-${idx}`}>
            <polygon
              points={zone.points.map(p => `${toSvgX(p[1])},${toSvgY(p[0])}`).join(' ')}
              className="fill-indigo-500/15 stroke-indigo-500/35"
              strokeWidth="2.5"
              strokeDasharray="2 3"
              onMouseEnter={() => setHoveredZone({ ...zone, type: 'RESTRICTED BORDER SECURITY CORRIDOR' })}
              onMouseLeave={() => setHoveredZone(null)}
            />
          </g>
        ))}

        {/* 3. Draw Active Tourist Nodes */}
        {tourists.map((t) => {
          const cx = toSvgX(t.lng);
          const cy = toSvgY(t.lat);
          const isSelected = t.id === selectedTouristId;
          
          let colorClass = 'fill-emerald-500 stroke-emerald-400';
          let ringColor = 'rgba(16, 185, 129, 0.4)';
          
          if (t.status === 'WRN') {
            colorClass = 'fill-amber-500 stroke-amber-400';
            ringColor = 'rgba(245, 158, 11, 0.5)';
          } else if (t.status === 'SOS') {
            colorClass = 'fill-red-500 stroke-red-400';
            ringColor = 'rgba(239, 68, 68, 0.7)';
          }

          return (
            <g
              key={t.id}
              className="cursor-pointer group"
              onMouseDown={(e) => handleMouseDown(t.id, e)}
            >
              {/* Pulsing ring for emergency alert */}
              {t.status === 'SOS' && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="20"
                  fill="none"
                  stroke={ringColor.replace('0.7', '0.2')}
                  strokeWidth="3"
                  className="animate-ping"
                />
              )}

              {/* Selection Halo */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="15"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                  className="animate-spin"
                  style={{ animationDuration: '6s' }}
                />
              )}

              {/* Outer drag shadow */}
              <circle
                cx={cx}
                cy={cy}
                r="10"
                fill="transparent"
                className="group-hover:fill-slate-400/20"
              />

              {/* Node Center */}
              <circle
                cx={cx}
                cy={cy}
                r="6.5"
                className={`${colorClass} transition-transform duration-150 group-hover:scale-125`}
                strokeWidth="2"
              />

              {/* Ping Anchor Line (Dotted HUD line connecting to text badge) */}
              {isSelected && (
                <>
                  <line x1={cx} y1={cy} x2={cx + 30} y2={cy - 30} stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" />
                  <rect x={cx + 30} y={cy - 48} width="115" height="24" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#22d3ee" strokeWidth="1" />
                  <text x={cx + 38} y={cy - 32} fill="#22d3ee" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {t.name.split(' ')[0]} ({t.status})
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Info Tooltip Overlay */}
      {hoveredZone && (
        <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 rounded-lg p-2.5 max-w-xs text-left shadow-xl pointer-events-none">
          <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{hoveredZone.type}</p>
          <h4 className="text-xs font-semibold text-white">{hoveredZone.name}</h4>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            Tactical geofence coordinates loaded. Moving node inside triggers automatic emergency response sequence.
          </p>
        </div>
      )}

      {/* Mini Legend & Instructions */}
      <div className="absolute top-12 right-3 flex flex-col space-y-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] text-left text-slate-300 font-mono backdrop-blur-sm pointer-events-none">
        <p className="font-bold text-cyan-400 border-b border-slate-800 pb-1 mb-1">TACTICAL INSTRUCTION</p>
        <p>• Click & Drag nodes to relocate tourists</p>
        <p>• Drop node in <span className="text-red-400">Red Zone</span> to test SOS trigger</p>
        <p>• Drop node in <span className="text-purple-400">Purple Zone</span> to test Border Warning</p>
        <p>• Selected Node connects with Simulator app</p>
      </div>
    </div>
  );
}
