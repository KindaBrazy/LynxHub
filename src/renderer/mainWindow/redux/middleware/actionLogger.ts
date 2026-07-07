import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Middleware} from '@reduxjs/toolkit';

/**
 * Recursively redacts sensitive keys from action payloads to ensure user privacy.
 */
const sanitizePayload = (payload: any): any => {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'object') {
    if (typeof payload === 'string' && payload.length > 200) {
      return `${payload.slice(0, 50)}... [TRUNCATED ${payload.length} chars]`;
    }
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayload(item));
  }

  const sanitized = {...payload};
  const sensitiveKeys = [
    'dsn',
    'password',
    'token',
    'key',
    'secret',
    'auth',
    'address',
    'url',
    'path',
    'dir',
    'location',
    'name',
    'user',
    'email',
    'avatar',
    'anonymousid',
    'sentrydsn',
    'appdatadir',
  ];

  for (const k of Object.keys(sanitized)) {
    const lowerKey = k.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[k] = '[REDACTED]';
    } else if (lowerKey.includes('favicon') || lowerKey.includes('icon')) {
      sanitized[k] = '[ICON DATA REDACTED]';
    } else if (typeof sanitized[k] === 'object') {
      sanitized[k] = sanitizePayload(sanitized[k]);
    } else if (typeof sanitized[k] === 'string' && sanitized[k].length > 200) {
      sanitized[k] = `${sanitized[k].slice(0, 50)}... [TRUNCATED ${sanitized[k].length} chars]`;
    }
  }
  return sanitized;
};

/**
 * Middleware that intercepts Redux actions and logs them anonymously.
 * Ignores high-frequency internal events to prevent log spam.
 */
export const actionLoggerMiddleware: Middleware = () => next => action => {
  const result = next(action);

  if (action && typeof action === 'object' && 'type' in action) {
    const type = action.type as string;

    // Only log page navigation events to reduce telemetry noise
    if (type === 'tabs/setActivePage') {
      let logMessage = `Redux Action: ${type}`;
      if ('payload' in action && action.payload !== undefined) {
        try {
          const sanitizedPayload = sanitizePayload(action.payload);
          logMessage += ` | Payload: ${JSON.stringify(sanitizedPayload)}`;
        } catch {
          logMessage += ` | Payload: [unserializable]`;
        }
      }
      AddBreadcrumb_Renderer(logMessage);
    }
  }

  return result;
};
