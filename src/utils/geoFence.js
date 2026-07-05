/**
 * Geo-fencing & Polygon Intersection Utility for KAVACH-NE
 * Implements Ray-Casting algorithm to check if a tourist coordinate falls inside
 * predefined risk polygons representing North Eastern terrains.
 */

/**
 * Checks if a point lies inside a polygon using ray casting.
 * @param {Array} point - [lat, lng]
 * @param {Array} polygon - [[lat1, lng1], [lat2, lng2], ...]
 * @returns {boolean}
 */
export function pointInPolygon(point, polygon) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    
    const intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Predefined geographic zones in NE coordinates:
// Lat bounds: ~21.5 N to ~29.5 N
// Lng bounds: ~89.5 E to ~97.5 E
export const MAP_ZONES = {
  // Red Zones: Landslide hazard regions (e.g. Upper Tawang & Western Arunachal)
  red: [
    {
      name: "Tawang Landslide Hazard Corridor",
      points: [
        [27.3, 91.0],
        [28.8, 91.0],
        [28.8, 92.5],
        [27.3, 92.5]
      ]
    }
  ],
  
  // Orange Zones: Dense Forest/High Altitude Warning zones (e.g. Meghalaya Hills & Nagaland border)
  orange: [
    {
      name: "Nokrek Biosphere & Dense Forest",
      points: [
        [25.0, 90.2],
        [25.9, 90.2],
        [25.9, 91.8],
        [25.0, 91.8]
      ]
    },
    {
      name: "Dzukou Valley High Altitude Area",
      points: [
        [25.3, 93.8],
        [26.2, 93.8],
        [26.2, 95.0],
        [25.3, 95.0]
      ]
    }
  ],
  
  // Purple Zones: Border Corridor Security Zones (Myanmar & China Border lines)
  purple: [
    {
      name: "China International Border Corridor",
      points: [
        [28.2, 91.5],
        [29.4, 91.5],
        [29.4, 97.2],
        [28.2, 97.2]
      ]
    },
    {
      name: "Myanmar Border Security Belt",
      points: [
        [21.8, 93.2],
        [25.2, 93.2],
        [25.2, 94.6],
        [21.8, 94.6]
      ]
    }
  ]
};

/**
 * Evaluates whether a coordinate has crossed into any geo-fenced safety zone.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object|null} - Zone metadata or null if in safe zone
 */
export function checkGeoFence(lat, lng) {
  const pt = [lat, lng];
  
  // Check Red Zones
  for (const zone of MAP_ZONES.red) {
    if (pointInPolygon(pt, zone.points)) {
      return { type: 'red', name: zone.name, severity: 'CRITICAL' };
    }
  }
  
  // Check Orange Zones
  for (const zone of MAP_ZONES.orange) {
    if (pointInPolygon(pt, zone.points)) {
      return { type: 'orange', name: zone.name, severity: 'WARNING' };
    }
  }
  
  // Check Purple Zones
  for (const zone of MAP_ZONES.purple) {
    if (pointInPolygon(pt, zone.points)) {
      return { type: 'purple', name: zone.name, severity: 'RESTRICTED' };
    }
  }
  
  return null;
}
