import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Middleware} from '@reduxjs/toolkit';

/**
 * Recursively redacts sensitive keys from action payloads to ensure user privacy.
 */
const sanitizePayload = (payload: any): any => {
  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'object') return payload;

  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayload(item));
  }

  const sanitized = {...payload};
  const sensitiveKeys = ['dsn', 'password', 'token', 'key', 'secret', 'auth', 'address', 'url', 'path'];

  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof sanitized[k] === 'object') {
      sanitized[k] = sanitizePayload(sanitized[k]);
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

    // Define patterns/actions to ignore (noise, internal state, window focus, etc.)
    const ignoredActionPrefixes = [
      'hotkeys/',
      'volume/',
      'cards/setRunningCardAddress',
      'cards/setRunningCardCustomAddress',
      'cards/setRunningCardCurrentAddress',
      'cards/setRunningCardBrowserTitle',
      'cards/addDomReady',
      'terminal/initState',
    ];

    const shouldIgnore = ignoredActionPrefixes.some(prefix => type.startsWith(prefix));

    // Specifically filter out noisy app/setAppState keys
    let isNoisyAppState = false;
    if (type === 'app/setAppState' && 'payload' in action && action.payload && typeof action.payload === 'object') {
      const payloadKey = (action.payload as any).key;
      const noisyKeys = ['onFocus', 'isOnline', 'maximized', 'fullscreen', 'appTitle'];
      if (noisyKeys.includes(payloadKey)) {
        isNoisyAppState = true;
      }
    }

    if (!shouldIgnore && !isNoisyAppState) {
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
