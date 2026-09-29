/**
 * Security Event Logger for BBR FREEDO
 *
 * Implements centralized, privacy-preserving security event logging.
 * NEVER logs passwords, authentication tokens, refresh tokens, session cookies,
 * private keys, or service-account credentials.
 */

export type SecurityEventType =
  | 'AUTH_LOGIN_ATTEMPT'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_REVOKED'
  | 'AUTH_GENERIC_ERROR'
  | 'RATE_LIMIT_TRIGGERED'
  | 'RATE_LIMIT_RESET'
  | 'APPCHECK_VERIFICATION'
  | 'APPCHECK_MONITORING'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'MALICIOUS_INPUT_BLOCKED'
  | 'SECURITY_AUDIT_PROBE';

export type SecurityEventStatus = 'success' | 'failure' | 'blocked' | 'rate_limited' | 'warn' | 'info';

export type AppCheckStatus = 'verified' | 'unverified' | 'debug_token' | 'not_configured' | 'metrics_mode' | 'enforced';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  status: SecurityEventStatus;
  userId?: string;
  appCheckStatus: AppCheckStatus;
  requestId?: string;
  details?: Record<string, unknown>;
}

// In-memory ring buffer (last 100 events) for UI diagnostics & audit logs
const MAX_LOG_ENTRIES = 100;
const eventLogBuffer: SecurityEvent[] = [];

// Sensitive field denylist - strictly redacted if ever encountered
const SENSITIVE_KEYS = new Set([
  'password',
  'passwd',
  'secret',
  'token',
  'idtoken',
  'refreshtoken',
  'accesstoken',
  'auth',
  'authorization',
  'cookie',
  'privatekey',
  'private_key',
  'apikey',
  'api_key',
  'otp',
  'code',
  'codeverifier',
  'clientsecret',
  'client_secret',
  'credential',
]);

/**
 * Recursively redacts sensitive fields from objects before logging
 */
function sanitizeDetails(data?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED_SENSITIVE_VALUE]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Mask user identifier for privacy (e.g., +91 9876543210 -> +91 ***3210, test@bbr.in -> t***@bbr.in)
 */
export function maskIdentifier(identifier?: string): string {
  if (!identifier) return 'anonymous';
  if (identifier.includes('@')) {
    const [name, domain] = identifier.split('@');
    if (name.length <= 2) return `*@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  }
  const clean = identifier.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `***${clean.slice(-4)}`;
  }
  return identifier.slice(0, 3) + '***';
}

/**
 * Record a security event with automatic sanitization
 */
export function logSecurityEvent(
  eventType: SecurityEventType,
  status: SecurityEventStatus,
  options?: {
    userId?: string;
    appCheckStatus?: AppCheckStatus;
    requestId?: string;
    details?: Record<string, unknown>;
  }
): SecurityEvent {
  const event: SecurityEvent = {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType,
    status,
    userId: options?.userId ? maskIdentifier(options.userId) : undefined,
    appCheckStatus: options?.appCheckStatus || 'metrics_mode',
    requestId: options?.requestId || `req-${Math.random().toString(36).slice(2, 10)}`,
    details: sanitizeDetails(options?.details),
  };

  eventLogBuffer.unshift(event);
  if (eventLogBuffer.length > MAX_LOG_ENTRIES) {
    eventLogBuffer.pop();
  }

  // Log non-sensitive event in dev console
  if (import.meta.env.DEV) {
    const style =
      status === 'failure' || status === 'blocked' || status === 'rate_limited'
        ? 'color: #ef4444; font-weight: bold;'
        : status === 'warn'
        ? 'color: #f59e0b; font-weight: bold;'
        : 'color: #10b981; font-weight: bold;';

    console.info(
      `%c[SECURITY AUDIT] %c[${event.eventType}] %c${event.status.toUpperCase()} (ID: ${event.id})`,
      'color: #FF6A00; font-weight: bold;',
      'color: #3b82f6;',
      style,
      event.details || ''
    );
  }

  return event;
}

/**
 * Get recent security event logs for audit & testing panel
 */
export function getSecurityLogs(): readonly SecurityEvent[] {
  return [...eventLogBuffer];
}

/**
 * Clear security event logs (testing use only)
 */
export function clearSecurityLogs(): void {
  eventLogBuffer.length = 0;
}
