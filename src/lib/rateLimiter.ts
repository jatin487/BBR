/**
 * Progressive Rate Limiter & Abuse Protection
 *
 * Implements exponential/progressive delays for authentication attempts.
 * Prevents rapid automated brute-force / credential-stuffing attacks without
 * enforcing permanent account lockouts (which causes denial-of-service abuse).
 */

import { logSecurityEvent } from './securityLogger';

interface AttemptRecord {
  count: number;
  lastAttemptTime: number;
  blockedUntil: number;
}

const STORAGE_PREFIX = 'bbr_sec_rl_';

// In-memory fallback if sessionStorage is unavailable
const memoryStore = new Map<string, AttemptRecord>();

// Progressive cooldown rules (in seconds)
// Attempts: 1-2: 0s, 3: 5s, 4: 15s, 5: 30s, 6+: 60s max
function calculateCooldownSeconds(attemptCount: number): number {
  if (attemptCount <= 2) return 0;
  if (attemptCount === 3) return 5;
  if (attemptCount === 4) return 15;
  if (attemptCount === 5) return 30;
  return 60; // Max ceiling — never permanent lock
}

function getRecord(key: string): AttemptRecord {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  try {
    const raw = sessionStorage.getItem(fullKey);
    if (raw) return JSON.parse(raw);
  } catch {
    const mem = memoryStore.get(fullKey);
    if (mem) return mem;
  }

  return { count: 0, lastAttemptTime: 0, blockedUntil: 0 };
}

function saveRecord(key: string, record: AttemptRecord): void {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  try {
    sessionStorage.setItem(fullKey, JSON.stringify(record));
  } catch {
    memoryStore.set(fullKey, record);
  }
}

/**
 * Check if the given action/key is currently rate-limited.
 * Returns { isBlocked: boolean, remainingSeconds: number, attempts: number }
 */
export function checkRateLimit(key: string): {
  isBlocked: boolean;
  remainingSeconds: number;
  attempts: number;
} {
  const record = getRecord(key);
  const now = Date.now();

  // Reset if last attempt was over 15 minutes ago
  if (record.lastAttemptTime > 0 && now - record.lastAttemptTime > 15 * 60 * 1000) {
    resetRateLimit(key);
    return { isBlocked: false, remainingSeconds: 0, attempts: 0 };
  }

  if (record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { isBlocked: true, remainingSeconds, attempts: record.count };
  }

  return { isBlocked: false, remainingSeconds: 0, attempts: record.count };
}

/**
 * Record an authentication attempt.
 * If success is true, resets the counter.
 * If success is false, increments failure count and calculates progressive cooldown.
 */
export function recordAttempt(
  key: string,
  success: boolean,
  userId?: string
): { isBlocked: boolean; remainingSeconds: number; attempts: number } {
  if (success) {
    resetRateLimit(key);
    return { isBlocked: false, remainingSeconds: 0, attempts: 0 };
  }

  const record = getRecord(key);
  const now = Date.now();

  record.count += 1;
  record.lastAttemptTime = now;

  const cooldown = calculateCooldownSeconds(record.count);
  if (cooldown > 0) {
    record.blockedUntil = now + cooldown * 1000;

    logSecurityEvent('RATE_LIMIT_TRIGGERED', 'rate_limited', {
      userId,
      details: {
        actionKey: key,
        consecutiveFailures: record.count,
        cooldownSeconds: cooldown,
      },
    });
  }

  saveRecord(key, record);

  const remaining = Math.max(0, Math.ceil((record.blockedUntil - now) / 1000));
  return {
    isBlocked: remaining > 0,
    remainingSeconds: remaining,
    attempts: record.count,
  };
}

/**
 * Explicitly reset rate limit (e.g. after successful verification or testing reset)
 */
export function resetRateLimit(key: string): void {
  const fullKey = `${STORAGE_PREFIX}${key}`;
  try {
    sessionStorage.removeItem(fullKey);
  } catch {
    memoryStore.delete(fullKey);
  }
}
