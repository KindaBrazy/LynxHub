import {APP_BUILD_NUMBER, EARLY_RELEASES_PAGE, INSIDER_RELEASES_PAGE, RELEASES_PAGE} from '@lynx_common/consts';
import {AppUpdateInfo, Changelog, UpdateDownloadProgress} from '@lynx_common/types';
import applicationIpc from '@lynx_shared/ipc/application';
import staticsIpc from '@lynx_shared/ipc/statics';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useTabVisibility} from '../../../../layouts/tabs/utils';
import {topToast} from '../../../../layouts/ToastProviders';
import {useCardsState} from '../../../../redux/reducers/cards';
import {modalActions, useModalsState} from '../../../../redux/reducers/modals';
import {settingsActions, useSettingsState} from '../../../../redux/reducers/settings';
import {useTabsState} from '../../../../redux/reducers/tabs';
import {useUserState} from '../../../../redux/reducers/user';
import {AppDispatch} from '../../../../redux/store';

export type ReleaseNote = {
  version: string;
  changes: Changelog[];
};

export const useUpdateApp = () => {
  const {isOpen} = useModalsState('updateApp');
  const activeTab = useTabsState('activeTab');
  const runningCard = useCardsState('runningCard');
  const checkCustomUpdate = useSettingsState('checkCustomUpdate');
  const updateChannel = useUserState('updateChannel');

  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [updateInfo, setUpdateInfo] = useState<Omit<AppUpdateInfo, 'earlyAccess'> | undefined>(undefined);
  const [downloadProgress, setDownloadProgress] = useState<UpdateDownloadProgress>();
  const [downloadState, setDownloadState] = useState<'failed' | 'completed' | 'progress' | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fetched, setFetched] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const removeListener = useRef<(() => void) | null>(null);

  const show = useTabVisibility(activeTab);

  const listenProgress = useCallback(() => {
    if (removeListener.current) removeListener.current();
    removeListener.current = applicationIpc.on.updateStatus((type, status) => {
      switch (type) {
        case 'update-available': {
          setDownloadProgress(undefined);
          dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: true}));
          topToast.info('New Update Available!');
          const isRunningAI = runningCard.some(card => card.tabId === activeTab);
          if (!isRunningAI) {
            dispatch(modalActions.openUpdateApp());
          }
          break;
        }
        case 'download-progress': {
          setDownloadState('progress');
          if (status && typeof status !== 'string') setDownloadProgress(status);
          break;
        }
        case 'update-downloaded': {
          setDownloadProgress(undefined);
          setDownloadState('completed');
          break;
        }
        case 'error': {
          setDownloadProgress(undefined);
          setDownloadState('failed');
          if (typeof status === 'string') setErrorMsg(status);
          break;
        }
      }
    });

    return () => removeListener.current?.();
  }, [dispatch, runningCard, activeTab]);

  const onClose = useCallback(() => {
    dispatch(modalActions.closeUpdateApp());
  }, [dispatch]);

  const cancel = useCallback(() => {
    setDownloadState(undefined);
  }, []);

  const startDownload = useCallback(() => {
    listenProgress();
    applicationIpc.send.updateDownload();
    setDownloadProgress(undefined);
    setDownloadState('progress');
  }, [listenProgress]);

  const cancelDownload = useCallback(() => {
    removeListener.current?.();
    applicationIpc.send.updateCancel();
    setDownloadState(undefined);
  }, []);

  const openDownloadPage = useCallback(() => {
    const isEA = updateChannel === 'early_access';
    const isInsider = updateChannel === 'insider';
    window.open(isInsider ? INSIDER_RELEASES_PAGE : isEA ? EARLY_RELEASES_PAGE : RELEASES_PAGE);
    dispatch(modalActions.closeUpdateApp());
  }, [dispatch, updateChannel]);

  useEffect(() => {
    return () => {
      removeListener.current?.();
    };
  }, []);

  useEffect(() => {
    listenProgress();

    async function fetchData() {
      const result: ReleaseNote[] = [];

      const data = await staticsIpc.getReleases();
      const insiderData = await staticsIpc.getInsider();

      if (!data || !insiderData) return;

      const isEA = updateChannel === 'early_access';
      const isInsider = updateChannel === 'insider';

      const latestBuild =
        (isInsider ? insiderData.currentBuild : isEA ? data.earlyAccess.build : data.currentBuild) || 0;

      if (latestBuild > APP_BUILD_NUMBER) {
        const version =
          (isInsider ? insiderData.currentVersion : isEA ? data.earlyAccess.version : data.currentVersion) || '';
        const build = (isInsider ? insiderData.currentBuild : isEA ? data.earlyAccess.build : data.currentBuild) || 0;
        const date =
          (isInsider ? insiderData.releaseDate : isEA ? data.earlyAccess.releaseDate : data.releaseDate) || '';

        setUpdateInfo({currentBuild: build, currentVersion: version, releaseDate: date});

        const sourceData = isInsider ? insiderData : data;

        if (isEmpty(sourceData.changeLog)) return;

        sourceData.changeLog.forEach(change => {
          if (change.build <= APP_BUILD_NUMBER || change.build > latestBuild) return;

          result.push({
            version: change.version,
            changes: change.changes,
          });
        });

        setReleaseNotes(result);
        setFetched(true);
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, updateChannel, listenProgress]);

  const title = useMemo(() => {
    switch (downloadState) {
      case 'failed':
        return 'Download Unsuccessful';
      case 'completed':
        return 'Download Complete';
      case 'progress':
        return 'Download in Progress';
      default:
        return 'Update Information';
    }
  }, [downloadState]);

  const autoDownload = checkCustomUpdate || !!window.isPortable;

  return {
    isOpen,
    onClose,
    title,
    downloadState,
    downloadProgress,
    errorMsg,
    fetched,
    updateInfo,
    releaseNotes,
    startDownload,
    cancelDownload,
    cancel,
    openDownloadPage,
    autoDownload,
    show,
  };
};
