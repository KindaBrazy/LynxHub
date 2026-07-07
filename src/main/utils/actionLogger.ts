import {randomUUID} from 'node:crypto';
import os from 'node:os';
import {join} from 'node:path';

import {LYNXHUB_WEBSITE} from '@lynx_common/consts';
import classHolder from '@lynx_main/managers/classHolder';
import axios from 'axios';
import {app} from 'electron';
import fs from 'graceful-fs';

type ActionEvent = {
  category: string;
  message: string;
  level: string;
  timestamp: Date;
  payload?: any;
};

type CollectedActionsPayload = {
  anonymousId: string;
  sessionId: string;
  appVersion: string;
  platform: string;
  actions: ActionEvent[];
};

let sessionId = '';
let anonymousId = '';
const actionQueue: ActionEvent[] = [];
let failedActionsFilePath = '';
let lastLoggedAction: {category: string; message: string; timestamp: number} | null = null;
const DEDUPLICATION_WINDOW_MS = 2000;

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeSensitiveInfo(value: any): any {
  if (typeof value === 'string') {
    let sanitized = value.replace(/\\/g, '/');
    try {
      const home = os.homedir().replace(/\\/g, '/');
      const homeRegex = new RegExp(escapeRegExp(home), 'gi');
      sanitized = sanitized.replace(homeRegex, '~');
    } catch {
      // Ignore errors if os.homedir() fails
    }
    try {
      const username = os.userInfo().username;
      if (username) {
        const userRegex = new RegExp(escapeRegExp(username), 'gi');
        sanitized = sanitized.replace(userRegex, '<username>');
      }
    } catch {
      // Ignore errors if os.userInfo() fails
    }
    return sanitized;
  }

  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(sanitizeSensitiveInfo);
    }
    const result: {[key: string]: any} = {};
    for (const key of Object.keys(value)) {
      result[key] = sanitizeSensitiveInfo(value[key]);
    }
    return result;
  }

  return value;
}

/**
 * Initializes the action log session, generates a unique session ID, and attempts to send any cached actions from previous runs.
 */
export function initSession(): void {
  sessionId = randomUUID();
  failedActionsFilePath = join(app.getPath('userData'), 'failed-actions.json');

  const {storageManager} = classHolder;
  anonymousId = storageManager.getData('app').anonymousId;

  // Attempt to upload failed actions from previous sessions if they exist
  if (fs.existsSync(failedActionsFilePath)) {
    try {
      const fileData = fs.readFileSync(failedActionsFilePath, 'utf8');
      const cachedPayload = JSON.parse(fileData) as CollectedActionsPayload;

      if (cachedPayload && Array.isArray(cachedPayload.actions) && cachedPayload.actions.length > 0) {
        axios
          .post(`${LYNXHUB_WEBSITE}/api/actions/collect`, cachedPayload, {timeout: 8000})
          .then(() => {
            console.log('Successfully sent offline actions log cached from previous session.');
            try {
              fs.unlinkSync(failedActionsFilePath);
            } catch (err) {
              console.error('Failed to delete sent offline action logs file:', err);
            }
          })
          .catch(err => {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn(`Failed to send offline actions log on startup (will retry on next exit): ${errorMsg}`);
          });
      } else {
        // Corrupted file, clean it up
        fs.unlinkSync(failedActionsFilePath);
      }
    } catch (err) {
      console.error('Error handling cached failed-actions file on startup:', err);
    }
  }
}

/**
 * Logs a single action event in memory if breadcrumbs collection is enabled in settings.
 */
export function logAction(category: string, message: string, level: string = 'info', payload?: any): void {
  const {storageManager} = classHolder;

  // Respect settings toggle
  if (!storageManager.getData('app').addBreadcrumbs) {
    return;
  }

  const sanitizedMessage = sanitizeSensitiveInfo(message);
  const now = Date.now();

  // Deduplicate consecutive identical actions within the threshold window
  if (
    lastLoggedAction &&
    lastLoggedAction.category === category &&
    lastLoggedAction.message === sanitizedMessage &&
    now - lastLoggedAction.timestamp < DEDUPLICATION_WINDOW_MS
  ) {
    return;
  }

  lastLoggedAction = {
    category,
    message: sanitizedMessage,
    timestamp: now,
  };

  actionQueue.push({
    category,
    message: sanitizedMessage,
    level,
    timestamp: new Date(),
    payload: sanitizeSensitiveInfo(payload),
  });
}

/**
 * Sends all collected actions for the current session to the website.
 * Saves actions locally to failed-actions.json if transmission fails (e.g. offline).
 */
export async function sendCollectedActions(): Promise<void> {
  const {storageManager} = classHolder;

  // Don't send anything if the user has disabled breadcrumbs or queue is empty
  if (!storageManager.getData('app').addBreadcrumbs || actionQueue.length === 0) {
    return;
  }

  const payload: CollectedActionsPayload = {
    anonymousId,
    sessionId,
    appVersion: app.getVersion(),
    platform: process.platform,
    actions: [...actionQueue],
  };

  // Clear the queue to prevent double-logging
  actionQueue.length = 0;

  try {
    await axios.post(`${LYNXHUB_WEBSITE}/api/actions/collect`, payload, {timeout: 5000});
    console.log(`Successfully sent ${payload.actions.length} action logs to database.`);
  } catch (err) {
    const errorMsg = (err as Error)?.message || err;
    console.warn(`Failed to send actions log on close. Caching to disk. Error: ${errorMsg}`);
    try {
      fs.writeFileSync(failedActionsFilePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (writeErr) {
      console.error('Failed to write offline action logs to disk:', writeErr);
    }
  }
}

/**
 * Returns the current session ID.
 */
export function getSessionId(): string {
  return sessionId;
}

/**
 * Returns the current anonymous ID.
 */
export function getAnonymousId(): string {
  return anonymousId;
}
