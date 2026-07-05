/**
 * Risk-Score Analytical Profiling Engine for KAVACH-NE
 * Computes a live Vulnerability Index percentage and returns risk classification states.
 */

/**
 * Calculates the vulnerability index.
 * @param {Object} factors - { weather, terrain, borderProximity, deviation } - values 0-100
 * @returns {Object} - { score, level, color, description }
 */
export function calculateRiskScore(factors) {
  const {
    weather = 0,
    terrain = 0,
    borderProximity = 0,
    deviation = 0
  } = factors;
  
  // Weights:
  // Weather: 25%
  // Terrain: 20%
  // Border Proximity: 30%
  // Itinerary Deviation: 25%
  const score = Math.round(
    (weather * 0.25) +
    (terrain * 0.20) +
    (borderProximity * 0.30) +
    (deviation * 0.25)
  );
  
  let level = 'LOW';
  let color = 'cyber-emerald'; // Green
  let textHex = '#10b981';
  let description = 'Safe: Normal conditions. Standard tracking active.';
  
  if (score >= 35 && score <= 70) {
    level = 'ELEVATED';
    color = 'cyber-amber'; // Amber
    textHex = '#f59e0b';
    description = 'Elevated Risk: System issuing preemptive warnings. Keep offline channel primed.';
  } else if (score > 70) {
    level = 'CRITICAL';
    color = 'cyber-crimson'; // Crimson
    textHex = '#ef4444';
    description = 'Critical Danger: Emergency response forces notified. GPS ping lock enabled.';
  }
  
  return {
    score,
    level,
    color,
    textHex,
    description
  };
}
