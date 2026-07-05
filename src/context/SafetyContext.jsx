import React, { createContext, useContext, useState, useEffect } from 'react';
import { packSMS, unpackSMS } from '../utils/smsPacker';
import { generateDID, sha256, calculateBlockHash } from '../utils/blockchain';
import { calculateRiskScore } from '../utils/riskProfiler';
import { checkGeoFence } from '../utils/geoFence';

const SafetyContext = createContext();

// Default initial mock tourists
const INITIAL_TOURISTS = [
  {
    id: 'tourist-1',
    name: 'Priya Sharma',
    state: 'Assam',
    lat: 26.144,
    lng: 91.736,
    alt: 102,
    battery: 92,
    status: 'OK',
    did: '', // Will generate on load
    factors: { weather: 15, terrain: 10, borderProximity: 12, deviation: 5 },
    offline: false,
    phoneLogs: [
      { time: '18:45', msg: 'Device Registered on Kavach-NE' },
      { time: '19:00', msg: 'Security DID Handshake Completed' }
    ]
  },
  {
    id: 'tourist-2',
    name: 'John Doe',
    state: 'Arunachal Pradesh',
    lat: 27.560,
    lng: 91.890,
    alt: 3048,
    battery: 68,
    status: 'WRN', // Landslide caution
    did: '',
    factors: { weather: 65, terrain: 80, borderProximity: 75, deviation: 45 },
    offline: false,
    phoneLogs: [
      { time: '17:30', msg: 'Entering Tawang Mountain Route' },
      { time: '18:00', msg: 'Heavy Rainfall Warning Detected' }
    ]
  },
  {
    id: 'tourist-3',
    name: 'Tenzing Norgay',
    state: 'Meghalaya',
    lat: 25.275,
    lng: 91.731,
    alt: 1484,
    battery: 81,
    status: 'OK',
    did: '',
    factors: { weather: 30, terrain: 40, borderProximity: 10, deviation: 15 },
    offline: false,
    phoneLogs: [
      { time: '16:00', msg: 'Guwahati-Cherrapunji Transit Registered' }
    ]
  },
  {
    id: 'tourist-4',
    name: 'Aditya Sen',
    state: 'Mizoram',
    lat: 23.450,
    lng: 93.480,
    alt: 890,
    battery: 45,
    status: 'SOS', // Border zone Alert / Critical
    did: '',
    factors: { weather: 40, terrain: 50, borderProximity: 90, deviation: 80 },
    offline: true, // Started in offline simulation
    phoneLogs: [
      { time: '14:20', msg: 'Network Connection Interrupted' },
      { time: '15:10', msg: 'Offline SMS Packed and Cached: SOS#23450N93480E#A37AB2D' }
    ]
  }
];

export const SafetyProvider = ({ children }) => {
  const [tourists, setTourists] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [blockchain, setBlockchain] = useState([]);
  const [selectedTouristId, setSelectedTouristId] = useState('tourist-1');
  const [systemLogs, setSystemLogs] = useState([]);

  // Generate initial DIDs and Genesis Block
  useEffect(() => {
    // 1. Initialize tourists with DIDs
    const touristsWithDIDs = INITIAL_TOURISTS.map(t => ({
      ...t,
      did: generateDID(t.state, t.id)
    }));
    setTourists(touristsWithDIDs);

    // 2. Setup Genesis Block
    const genesisPayload = { event: 'KAVACH-NE System Initialization', node: 'Ministry Mainframe' };
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      payload: genesisPayload,
      hash: ''
    };
    const dataToHash = genesisBlock.index + genesisBlock.timestamp + genesisBlock.prevHash + JSON.stringify(genesisBlock.payload);
    genesisBlock.hash = sha256(dataToHash);
    
    setBlockchain([genesisBlock]);
    
    // 3. Populate default incidents
    const defaultIncidents = [
      {
        id: 'inc-1',
        touristId: 'tourist-4',
        touristName: 'Aditya Sen',
        lat: 23.450,
        lng: 93.480,
        type: 'Restricted Zone Breach (Myanmar Border Corridor)',
        severity: 'CRITICAL',
        timestamp: Date.now() - 3600000,
        status: 'OPEN'
      }
    ];
    setIncidents(defaultIncidents);

    addSystemLog('KAVACH-NE Safety Context initialized successfully.', 'success');
  }, []);

  const addSystemLog = (message, type = 'info') => {
    setSystemLogs(prev => [
      { id: Math.random().toString(), time: new Date().toLocaleTimeString(), message, type },
      ...prev.slice(0, 49) // Keep last 50
    ]);
  };

  // Helper to add block to blockchain ledger
  const createBlockchainRecord = (payload) => {
    setBlockchain(prevChain => {
      const prevBlock = prevChain[prevChain.length - 1];
      const nextIndex = prevBlock.index + 1;
      const timestamp = Date.now();
      const newBlock = {
        index: nextIndex,
        timestamp,
        prevHash: prevBlock.hash,
        payload,
        hash: ''
      };
      newBlock.hash = calculateBlockHash(newBlock);
      addSystemLog(`Blockchain Transaction Recorded: Block #${nextIndex}`, 'info');
      return [...prevChain, newBlock];
    });
  };

  // Update tourist factors (Sliders)
  const updateTouristFactors = (id, newFactors) => {
    setTourists(prevTourists => {
      return prevTourists.map(t => {
        if (t.id === id) {
          const updatedFactors = { ...t.factors, ...newFactors };
          const riskDetails = calculateRiskScore(updatedFactors);
          
          // Determine status based on risk details
          let status = 'OK';
          if (riskDetails.level === 'ELEVATED') status = 'WRN';
          if (riskDetails.level === 'CRITICAL') status = 'SOS';
          
          // Log to blockchain if risk level shifted
          const oldRisk = calculateRiskScore(t.factors);
          if (oldRisk.level !== riskDetails.level) {
            createBlockchainRecord({
              event: 'Risk Level Transition',
              touristId: t.id,
              touristName: t.name,
              oldLevel: oldRisk.level,
              newLevel: riskDetails.level,
              score: riskDetails.score
            });
            
            // If critical risk, fire an alert incident
            if (status === 'SOS') {
              triggerIncident(t, `Critical Risk Profile Alert (Score: ${riskDetails.score}%)`);
            }
          }

          return {
            ...t,
            factors: updatedFactors,
            status: status === 'SOS' && t.status === 'SOS' ? 'SOS' : (status === 'SOS' ? 'SOS' : status)
          };
        }
        return t;
      });
    });
  };

  // Helper to trigger alert incident
  const triggerIncident = (tourist, type) => {
    setIncidents(prev => {
      // Check if incident already exists for this tourist
      if (prev.some(inc => inc.touristId === tourist.id && inc.status === 'OPEN')) {
        return prev;
      }
      const newInc = {
        id: `inc-${Math.random().toString().substring(2, 6)}`,
        touristId: tourist.id,
        touristName: tourist.name,
        lat: tourist.lat,
        lng: tourist.lng,
        type,
        severity: 'CRITICAL',
        timestamp: Date.now(),
        status: 'OPEN'
      };
      addSystemLog(`EMERGENCY INCIDENT DEPLOYED: ${tourist.name} - ${type}`, 'error');
      return [newInc, ...prev];
    });
  };

  // Manual Panic Button trigger from phone
  const triggerManualSOS = (id) => {
    setTourists(prevTourists => {
      return prevTourists.map(t => {
        if (t.id === id) {
          createBlockchainRecord({
            event: 'Manual SOS Escalation',
            touristId: t.id,
            touristName: t.name,
            did: t.did,
            coordinates: { lat: t.lat, lng: t.lng },
            battery: t.battery
          });

          // Trigger incident
          triggerIncident(t, 'Panic Button Pressed (Manual SOS)');

          return {
            ...t,
            status: 'SOS',
            phoneLogs: [
              { time: new Date().toLocaleTimeString().substring(0, 5), msg: 'SOS Emergency Signal Broadcasted!' },
              ...t.phoneLogs
            ]
          };
        }
        return t;
      });
    });
  };

  // Resolve an incident
  const resolveIncident = (incId) => {
    setIncidents(prev => {
      const inc = prev.find(i => i.id === incId);
      if (!inc) return prev;
      
      // Update tourist status back to OK
      setTourists(prevTourists => {
        return prevTourists.map(t => {
          if (t.id === inc.touristId) {
            createBlockchainRecord({
              event: 'Incident Resolved',
              incidentId: incId,
              touristId: t.id,
              touristName: t.name,
              resolvedTime: Date.now()
            });

            return {
              ...t,
              status: 'OK',
              phoneLogs: [
                { time: new Date().toLocaleTimeString().substring(0, 5), msg: 'Emergency State Resolved by Command Center' },
                ...t.phoneLogs
              ]
            };
          }
          return t;
        });
      });

      addSystemLog(`Incident ${incId} resolved successfully. Node status reset.`, 'success');
      return prev.map(i => i.id === incId ? { ...i, status: 'RESOLVED' } : i);
    });
  };

  // Toggle offline simulator mode
  const toggleOfflineMode = (id) => {
    setTourists(prevTourists => {
      return prevTourists.map(t => {
        if (t.id === id) {
          const newOffline = !t.offline;
          const statusMsg = newOffline ? 'Offline Mode Active - Cell Signal Lost' : 'Online Mode Restored - Reconnected to Cellular network';
          
          if (!newOffline) {
            // Reconnected! Flush blockchain block
            createBlockchainRecord({
              event: 'Network Sync Recalled',
              touristId: t.id,
              touristName: t.name,
              status: 'ONLINE'
            });
          }

          return {
            ...t,
            offline: newOffline,
            phoneLogs: [
              { time: new Date().toLocaleTimeString().substring(0, 5), msg: statusMsg },
              ...t.phoneLogs
            ]
          };
        }
        return t;
      });
    });
  };

  // Dragging or shifting coordinate points on vector GIS map
  const updateTouristLocation = (id, lat, lng) => {
    setTourists(prevTourists => {
      return prevTourists.map(t => {
        if (t.id === id) {
          const oldLat = t.lat;
          const oldLng = t.lng;
          
          // Calculate if geofenced
          const geofence = checkGeoFence(lat, lng);
          
          let updatedStatus = t.status;
          if (geofence) {
            if (geofence.severity === 'CRITICAL' || geofence.severity === 'RESTRICTED') {
              updatedStatus = 'SOS';
              triggerIncident(t, `Geo-fence Breach: ${geofence.name}`);
            } else if (geofence.severity === 'WARNING') {
              updatedStatus = 'WRN';
            }
          } else {
            // Clear alerts if they were geofenced
            if (t.status === 'SOS' && !incidents.some(inc => inc.touristId === t.id && inc.status === 'OPEN')) {
              updatedStatus = 'OK';
            } else if (t.status === 'WRN') {
              updatedStatus = 'OK';
            }
          }

          // Compute border proximity factor dynamically
          // Distance from eastern boundaries (approx. 95.0 - 97.0 lng is close border)
          const borderProx = Math.min(100, Math.round(Math.max(0, (lng - 89.5) / 8.0) * 100));
          
          // Itinerary deviation based on distance dragged from original
          const startT = INITIAL_TOURISTS.find(it => it.id === id);
          const dev = Math.min(100, Math.round(Math.sqrt(Math.pow(lat - startT.lat, 2) + Math.pow(lng - startT.lng, 2)) * 120));

          // Log block on major shifts (threshold of significant movement)
          const distShift = Math.sqrt(Math.pow(lat - oldLat, 2) + Math.pow(lng - oldLng, 2));
          if (distShift > 0.05) {
            createBlockchainRecord({
              event: 'Checkpoint Cross',
              touristId: t.id,
              touristName: t.name,
              did: t.did,
              from: { lat: oldLat, lng: oldLng },
              to: { lat, lng },
              zone: geofence ? geofence.name : 'Safe Zone Corridor'
            });
          }

          return {
            ...t,
            lat,
            lng,
            status: updatedStatus,
            factors: {
              ...t.factors,
              borderProximity: borderProx,
              deviation: dev
            },
            phoneLogs: [
              { time: new Date().toLocaleTimeString().substring(0, 5), msg: `Location Update: ${lat.toFixed(4)}N, ${lng.toFixed(4)}E` },
              ...t.phoneLogs
            ]
          };
        }
        return t;
      });
    });
  };

  // Decode packed SMS and update state
  const decodeSMSAndLocate = (packedStr) => {
    const decoded = unpackSMS(packedStr);
    if (!decoded) {
      addSystemLog('SMS Decoding failed: Hex pattern parsing error.', 'error');
      return false;
    }

    addSystemLog(`SMS Telemetry Decoded: Status=${decoded.status}, Lat=${decoded.lat.toFixed(4)}, Lng=${decoded.lng.toFixed(4)}`, 'success');
    
    // Identify which tourist matches coordinates or selected tourist
    const activeTourist = tourists.find(t => t.id === selectedTouristId) || tourists[0];
    
    setTourists(prevTourists => {
      return prevTourists.map(t => {
        if (t.id === activeTourist.id) {
          // Trigger incident if status is SOS
          if (decoded.status === 'SOS') {
            triggerIncident(t, 'Emergency telemetry received via Offline SMS');
          }

          createBlockchainRecord({
            event: 'Offline Telemetry Decoded',
            touristId: t.id,
            touristName: t.name,
            packedString: packedStr,
            decodedTelemetry: decoded
          });

          return {
            ...t,
            lat: decoded.lat,
            lng: decoded.lng,
            alt: decoded.alt,
            battery: decoded.battery,
            status: decoded.status,
            offline: true, // Confirms it was sent offline
            phoneLogs: [
              { time: new Date().toLocaleTimeString().substring(0, 5), msg: `SMS Pack Sent: ${packedStr}` },
              ...t.phoneLogs
            ]
          };
        }
        return t;
      });
    });

    return true;
  };

  return (
    <SafetyContext.Provider
      value={{
        tourists,
        incidents,
        blockchain,
        selectedTouristId,
        systemLogs,
        setSelectedTouristId,
        updateTouristFactors,
        triggerManualSOS,
        resolveIncident,
        toggleOfflineMode,
        updateTouristLocation,
        decodeSMSAndLocate,
        addSystemLog
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => useContext(SafetyContext);
