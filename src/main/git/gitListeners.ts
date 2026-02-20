import {gitIpc} from '@lynx_main/ipc/gitIpc';
import {SimpleGitProgressEvent} from 'simple-git';

import GitManager from './index';

/**
 * Sets up event listeners for the GitManager instance to communicate progress back to the renderer.
 *
 * @param manager - The GitManager instance to attach listeners to.
 * @param operationId - Optional identifier to track specific operations (e.g. for UI progress bars).
 */
export function setupGitManagerListeners(manager: GitManager, operationId?: string): void {
  manager.onProgress = (progress: SimpleGitProgressEvent) => {
    gitIpc.send.onProgress(operationId, 'Progress', progress);
  };

  manager.onComplete = (result?: any) => {
    gitIpc.send.onProgress(operationId, 'Completed', result);
  };

  manager.onError = (reason: string) => {
    gitIpc.send.onProgress(operationId, 'Failed', reason);
  };
}
