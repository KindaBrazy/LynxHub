import {randomUUID} from 'node:crypto';
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
            console.warn(
              'Failed to send offline actions log on startup (will retry on next exit):',
              err.message || err,
            );
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

  actionQueue.push({
    category,
    message,
    level,
    timestamp: new Date(),
    payload,
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
