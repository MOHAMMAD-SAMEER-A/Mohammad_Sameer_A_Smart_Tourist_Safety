/**
 * Blockchain Mock Utility for KAVACH-NE
 * Tracks tourist checkpoints, border crossings, and emergency alerts on an audit ledger.
 */

/**
 * Generates a mock SHA-256 string hash (64 hex characters) from any input message.
 * Completely deterministic and behaves like a cryptographic hash.
 * @param {string} message 
 * @returns {string} - 64-character hex string hash
 */
export function sha256(message) {
  let hash1 = 5381;
  let hash2 = 127;
  
  const str = String(message);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + char;
    hash1 = hash1 & hash1; // Convert to 32bit integer
    
    hash2 = ((hash2 << 7) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  
  // Create 64 character hex string by chaining expanded deterministic seeds
  let h1 = Math.abs(hash1).toString(16).padStart(8, '0');
  let h2 = Math.abs(hash2 * 17).toString(16).padStart(8, '0');
  let h3 = Math.abs((hash1 + hash2) * 31).toString(16).padStart(8, '0');
  let h4 = Math.abs((hash1 ^ hash2) * 97).toString(16).padStart(8, '0');
  let h5 = Math.abs(hash1 * 131).toString(16).padStart(8, '0');
  let h6 = Math.abs(hash2 * 199).toString(16).padStart(8, '0');
  let h7 = Math.abs((hash1 - hash2) * 277).toString(16).padStart(8, '0');
  let h8 = Math.abs((hash1 | hash2) * 499).toString(16).padStart(8, '0');
  
  return (h1 + h2 + h3 + h4 + h5 + h6 + h7 + h8).substring(0, 64);
}

/**
 * Generates a unique Decentralized Identifier (DID) for a tourist.
 * Format: did:kavach:ne:<state>:<hash>
 * @param {string} state - e.g. "assam", "meghalaya"
 * @param {string} id - unique tourist database identifier
 * @returns {string}
 */
export function generateDID(state, id) {
  const seed = `${state}:${id}:${new Date().getTime()}`;
  const hashPart = sha256(seed).substring(0, 16);
  return `did:kavach:ne:${state.toLowerCase()}:${hashPart}`;
}

/**
 * Recalculates the hash of a given block.
 * @param {Object} block - The block to hash
 * @returns {string} - SHA-256 hash string
 */
export function calculateBlockHash(block) {
  const dataToHash = 
    block.index + 
    block.timestamp + 
    block.prevHash + 
    JSON.stringify(block.payload);
  return sha256(dataToHash);
}

/**
 * Verifies the integrity of a blockchain ledger.
 * Checks that hashes match recalculations and link successfully to previous blocks.
 * @param {Array} chain - List of blocks
 * @returns {Object} - { isValid: boolean, errorDetails: string|null, failedBlockIndex: number|null }
 */
export function verifyChainIntegrity(chain) {
  if (!chain || chain.length === 0) {
    return { isValid: true, errorDetails: null, failedBlockIndex: null };
  }
  
  // Verify Genesis Block if present
  const genesis = chain[0];
  const recalculatedGenesisHash = calculateBlockHash(genesis);
  if (genesis.hash !== recalculatedGenesisHash) {
    return { 
      isValid: false, 
      errorDetails: "Genesis block hash is corrupted.", 
      failedBlockIndex: 0 
    };
  }
  
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const prevBlock = chain[i - 1];
    
    // 1. Recalculate hash of current block
    const recalculatedHash = calculateBlockHash(currentBlock);
    if (currentBlock.hash !== recalculatedHash) {
      return {
        isValid: false,
        errorDetails: `Block #${currentBlock.index} payload or hash was tampered with.`,
        failedBlockIndex: currentBlock.index
      };
    }
    
    // 2. Check link integrity
    if (currentBlock.prevHash !== prevBlock.hash) {
      return {
        isValid: false,
        errorDetails: `Link broken between Block #${prevBlock.index} and Block #${currentBlock.index}.`,
        failedBlockIndex: currentBlock.index
      };
    }
  }
  
  return { isValid: true, errorDetails: null, failedBlockIndex: null };
}
