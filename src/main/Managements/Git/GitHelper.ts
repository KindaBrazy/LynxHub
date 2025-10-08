import {SimpleGitProgressEvent} from 'simple-git';

import {gitChannels} from '../../../cross/IpcChannelAndTypes';
import {appManager} from '../../index';
import GitManager from './GitManager';

/**
 * Sets up listeners for GitManager instance.
 * @param manager - The GitManager instance.
 * @param id - Optional identifier for pull operations.
 */
export function setupGitManagerListeners(manager: GitManager, id?: string): void {
  manager.onProgress = (progress: SimpleGitProgressEvent) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Progress', progress);
  };

  manager.onComplete = (result?: any) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Completed', result);
  };

  manager.onError = (reason: string) => {
    appManager?.getWebContent()?.send(gitChannels.onProgress, id, 'Failed', reason);
  };
}
