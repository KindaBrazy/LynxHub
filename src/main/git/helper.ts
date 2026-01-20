import gitChannels from '@lynx_cross/consts/ipc_channels/git';
import {SimpleGitProgressEvent} from 'simple-git';

import classHolder from '../core/class_holder';
import GitManager from './index';

/**
 * Sets up listeners for GitManager instance.
 * @param manager - The GitManager instance.
 * @param id - Optional identifier for pull operations.
 */
export function setupGitManagerListeners(manager: GitManager, id?: string): void {
  const {appManager} = classHolder;

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
