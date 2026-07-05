/**
 * Offline SMS Compression & Packing Utility for KAVACH-NE
 * Packs tourist telemetry JSON into an alphanumeric string under 40 characters.
 * Format: <STATUS>#<LAT_INT><DIR><LNG_INT><DIR>#A<ALT_HEX>B<BATT_HEX>
 * Example: { lat: 26.1445, lng: 91.7362, alt: 120, battery: 84, status: "SOS" }
 * Packs to: "SOS#26145N91736E#A78B54"
 */

/**
 * Packs telemetry data into a compressed string.
 * @param {Object} data - { lat, lng, alt, battery, status }
 * @returns {string} - Packed SMS string
 */
export function packSMS(data) {
  try {
    const status = (data.status || 'OK').toUpperCase().substring(0, 3);
    
    // Multiplied by 1000 to keep 3 decimal places (~111m accuracy, standard for low-bandwidth rescue grids)
    const latVal = Math.round(Math.abs(data.lat || 0) * 1000);
    const latDir = (data.lat || 0) >= 0 ? 'N' : 'S';
    
    const lngVal = Math.round(Math.abs(data.lng || 0) * 1000);
    const lngDir = (data.lng || 0) >= 0 ? 'E' : 'W';
    
    // Convert altitude and battery to Hex to compress characters
    const altHex = Math.max(0, Math.round(data.alt || 0)).toString(16).toUpperCase();
    const batHex = Math.max(0, Math.min(100, Math.round(data.battery || 0))).toString(16).toUpperCase();
    
    return `${status}#${latVal}${latDir}${lngVal}${lngDir}#A${altHex}B${batHex}`;
  } catch (e) {
    console.error("Failed to pack SMS telemetry:", e);
    return "ERR#0N0E#A0B0";
  }
}

/**
 * Unpacks a compressed SMS telemetry string back into a JSON object.
 * @param {string} packedStr - e.g., "SOS#26145N91736E#A78B54"
 * @returns {Object|null} - Decoded telemetry or null if invalid
 */
export function unpackSMS(packedStr) {
  if (!packedStr || typeof packedStr !== 'string') return null;
  
  try {
    const parts = packedStr.trim().toUpperCase().split('#');
    if (parts.length < 3) return null;
    
    const status = parts[0];
    
    // Coordinates part: e.g. "26145N91736E"
    const coordPart = parts[1];
    const coordMatch = coordPart.match(/^(\d+)([NS])(\d+)([EW])$/);
    if (!coordMatch) return null;
    
    let lat = parseInt(coordMatch[1], 10) / 1000;
    if (coordMatch[2] === 'S') lat = -lat;
    
    let lng = parseInt(coordMatch[3], 10) / 1000;
    if (coordMatch[4] === 'W') lng = -lng;
    
    // Alt and Battery: e.g. "A78B54"
    const sysPart = parts[2];
    const sysMatch = sysPart.match(/^A([0-9A-F]+)B([0-9A-F]+)$/);
    if (!sysMatch) return null;
    
    const alt = parseInt(sysMatch[1], 16);
    const battery = parseInt(sysMatch[2], 16);
    
    return {
      status,
      lat,
      lng,
      alt,
      battery
    };
  } catch (e) {
    console.error("Failed to unpack SMS telemetry:", e);
    return null;
  }
}
