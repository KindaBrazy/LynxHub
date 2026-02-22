import {tabsActions, useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import applicationIpc from '@lynx_shared/ipc/application';
import {IProgressState} from '@xterm/addon-progress';
import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

export function useTerminalProgress(tabId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const tabs = useTabsState('tabs');

  // Handle terminal progress (ConEmu OSC 9;4 sequence)
  const handleProgress = useCallback(
    (progress: IProgressState) => {
      const {state, value} = progress;

      // Update tab progress state in Redux
      dispatch(
        tabsActions.setTabProgress({
          tabID: tabId,
          progress: state === 0 ? undefined : {state: state as 0 | 1 | 2 | 3 | 4, value},
        }),
      );

      // Update Electron window progress bar (only for active tab)
      if (tabId === activeTab) {
        if (state === 0) {
          // Remove progress bar
          applicationIpc.send.setProgressBar(-1);
        } else if (state === 1) {
          // Normal progress
          applicationIpc.send.setProgressBar(value / 100, {mode: 'normal'});
        } else if (state === 2) {
          // Error state
          applicationIpc.send.setProgressBar(value / 100, {mode: 'error'});
        } else if (state === 3) {
          // Indeterminate
          applicationIpc.send.setProgressBar(2, {mode: 'indeterminate'});
        } else if (state === 4) {
          // Paused/Warning
          applicationIpc.send.setProgressBar(value / 100, {mode: 'paused'});
        }
      }
    },
    [dispatch, tabId, activeTab],
  );

  // Sync window progress bar when this tab becomes active
  useEffect(() => {
    if (tabId !== activeTab) return;

    // Get current tab's progress from tabs state
    const currentTab = tabs.find(t => t.id === tabId);
    const currentProgress = currentTab?.progress;
    if (!currentProgress || currentProgress.state === 0) {
      applicationIpc.send.setProgressBar(-1);
    } else {
      const {state, value} = currentProgress;
      if (state === 1) {
        applicationIpc.send.setProgressBar(value / 100, {mode: 'normal'});
      } else if (state === 2) {
        applicationIpc.send.setProgressBar(value / 100, {mode: 'error'});
      } else if (state === 3) {
        applicationIpc.send.setProgressBar(2, {mode: 'indeterminate'});
      } else if (state === 4) {
        applicationIpc.send.setProgressBar(value / 100, {mode: 'paused'});
      }
    }
  }, [activeTab, tabId, tabs]);

  return {handleProgress};
}
