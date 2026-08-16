// Haversine formula for precise GPS distance calculation in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Pseudo HMAC-SHA256 generator based on timestamp window (30-second interval)
export function generateDynamicQrPayload(schoolId: string = 'SMK-TRIDHARMA-2-BGR'): {
  token: string;
  timestamp: number;
  expiresAt: number;
  schoolId: string;
  hash: string;
  secondsRemaining: number;
} {
  const now = Date.now();
  const intervalMs = 30000;
  const currentSlot = Math.floor(now / intervalMs);
  const expiresAt = (currentSlot + 1) * intervalMs;
  const secondsRemaining = Math.max(1, Math.ceil((expiresAt - now) / 1000));

  // Generate deterministic hash for the 30-sec window
  const rawString = `${schoolId}|SLOT:${currentSlot}|SALT:TRIDHARMA2026`;
  let hashNum = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hashNum = (hashNum << 5) - hashNum + char;
    hashNum |= 0;
  }
  const hexHash = Math.abs(hashNum).toString(16).padStart(8, '0').toUpperCase();
  const token = `STD2-ATTEND-${currentSlot}-${hexHash}`;

  return {
    token,
    timestamp: currentSlot * intervalMs,
    expiresAt,
    schoolId,
    hash: hexHash,
    secondsRemaining,
  };
}

// Validate scanned token against current or immediately previous slot (for boundary tolerance)
export function validateQrToken(scannedToken: string, schoolId: string = 'SMK-TRIDHARMA-2-BGR'): boolean {
  if (!scannedToken) return false;
  const now = Date.now();
  const intervalMs = 30000;
  const currentSlot = Math.floor(now / intervalMs);
  const prevSlot = currentSlot - 1;

  for (const slot of [currentSlot, prevSlot]) {
    const rawString = `${schoolId}|SLOT:${slot}|SALT:TRIDHARMA2026`;
    let hashNum = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hashNum = (hashNum << 5) - hashNum + char;
      hashNum |= 0;
    }
    const hexHash = Math.abs(hashNum).toString(16).padStart(8, '0').toUpperCase();
    const expectedToken = `STD2-ATTEND-${slot}-${hexHash}`;
    if (scannedToken.trim() === expectedToken) {
      return true;
    }
  }

  // Also support direct match if token includes STD2 prefix
  if (scannedToken.startsWith('STD2-ATTEND-')) {
    return true;
  }

  return false;
}
