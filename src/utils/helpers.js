/**
 * Normalize Aptos address to standard format
 * Aptos addresses should be 66 characters: 0x + 64 hex chars
 * @param {string} address - Aptos address
 * @returns {string} Normalized address
 */
export const normalizeAptosAddress = (address) => {
  if (!address) return '';
  
  // Remove 0x prefix if exists
  const cleanAddr = address.toLowerCase().replace('0x', '');
  
  // Pad to 64 characters with leading zeros
  const paddedAddr = cleanAddr.padStart(64, '0');
  
  // Add 0x prefix back
  return `0x${paddedAddr}`;
};

/**
 * Format wallet address to show first and last 4 characters
 * @param {string} address - Wallet address
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format USDC amount from wei to readable format
 * @param {bigint|string} amount - Amount in wei (6 decimals)
 * @returns {string} Formatted amount
 */
export const formatUSDC = (amount) => {
  if (!amount) return '0';
  const value = typeof amount === 'bigint' ? amount : BigInt(amount);
  return (Number(value) / 1e6).toFixed(2);
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Relative time
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Get role badge color classes
 * @param {string} role - User role
 * @returns {string} Tailwind classes
 */
export const getRoleBadgeClass = (role) => {
  switch (role?.toLowerCase()) {
    case 'founder':
      return 'badge-founder';
    case 'builder':
      return 'badge-builder';
    case 'investor':
      return 'badge-investor';
    default:
      return 'badge';
  }
};

/**
 * Get role icon emoji
 * @param {string} role - User role
 * @returns {string} Emoji
 */
export const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case 'founder':
      return '👑';
    case 'builder':
      return '🧠';
    case 'investor':
      return '💸';
    default:
      return '👤';
  }
};

/**
 * Validate Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} Is valid
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Generate IPFS URL from CID
 * @param {string} cid - IPFS CID
 * @returns {string} Full IPFS URL
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return '';
  if (cid.startsWith('http')) return cid;
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Calculate reputation score color
 * @param {number} score - Reputation score (0-100)
 * @returns {string} Color class
 */
export const getReputationColor = (score) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-red-400';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if user can refund stake
 * @param {number} stakeTimestamp - Stake creation timestamp
 * @returns {boolean} Can refund
 */
export const canRefundStake = (stakeTimestamp) => {
  const REFUND_PERIOD = 2 * 24 * 60 * 60; // 2 days
  const now = Math.floor(Date.now() / 1000);
  return (now - stakeTimestamp) >= REFUND_PERIOD;
};

/**
 * Check if match can be released
 * @param {number} matchTimestamp - Match creation timestamp
 * @returns {boolean} Can release
 */
export const canReleaseMatch = (matchTimestamp) => {
  const RELEASE_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const now = Math.floor(Date.now() / 1000);
  return (now - matchTimestamp) >= RELEASE_PERIOD;
};

/**
 * Get time until refund available
 * @param {number} stakeTimestamp - Stake creation timestamp
 * @returns {string} Time remaining
 */
export const getTimeUntilRefund = (stakeTimestamp) => {
  const REFUND_PERIOD = 2 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - stakeTimestamp;
  const remaining = REFUND_PERIOD - elapsed;

  if (remaining <= 0) return 'Available now';

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}h ${minutes}m`;
};

/**
 * Get time until match release
 * @param {number} matchTimestamp - Match creation timestamp
 * @returns {string} Time remaining
 */
export const getTimeUntilRelease = (matchTimestamp) => {
  const RELEASE_PERIOD = 7 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - matchTimestamp;
  const remaining = RELEASE_PERIOD - elapsed;

  if (remaining <= 0) return 'Available now';

  const days = Math.floor(remaining / (24 * 3600));
  const hours = Math.floor((remaining % (24 * 3600)) / 3600);

  return `${days}d ${hours}h`;
};
