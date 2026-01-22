import {SimpleGitProgressEvent} from 'simple-git';

import {gitIpc} from '../ipc/git';
import GitManager from './index';

/**
 * Sets up listeners for GitManager instance.
 * @param manager - The GitManager instance.
 * @param id - Optional identifier for pull operations.
 */
export function setupGitManagerListeners(manager: GitManager, id?: string): void {
  manager.onProgress = (progress: SimpleGitProgressEvent) => {
    gitIpc.send.onProgress(id, 'Progress', progress);
  };

  manager.onComplete = (result?: any) => {
    gitIpc.send.onProgress(id, 'Completed', result);
  };

  manager.onError = (reason: string) => {
    gitIpc.send.onProgress(id, 'Failed', reason);
  };
}
