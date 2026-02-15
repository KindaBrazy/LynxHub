import {Button, CircularProgress, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from '@heroui/react';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {modalActions, useModalsState} from '@lynx/redux/reducers/modals';
import {settingsActions, useSettingsState} from '@lynx/redux/reducers/settings';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {useUserState} from '@lynx/redux/reducers/user';
import {AppDispatch} from '@lynx/redux/store';
import {modalMotionProps} from '@lynx/utils/constants';
import {lynxTopToast, RenderSubItems} from '@lynx/utils/hooks';
import {APP_BUILD_NUMBER, EARLY_RELEASES_PAGE, INSIDER_RELEASES_PAGE, RELEASES_PAGE} from '@lynx_common/consts';
import {AppUpdateInfo, UpdateDownloadProgress} from '@lynx_common/types';
import applicationIpc from '@lynx_shared/ipc/application';
import staticsIpc from '@lynx_shared/ipc/statics';
import {CollapseProps, Divider, Typography} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useTabVisibility} from '../../../tabs/utils';
import Downloaded from './Downloaded';
import Downloading from './Downloading';
import Info from './Info';

/** Manage updating application */
const UpdateApp = () => {
  const {isOpen} = useModalsState('updateApp');
  const activeTab = useTabsState('activeTab');
  const runningCard = useCardsState('runningCard');
  const checkCustomUpdate = useSettingsState('checkCustomUpdate');
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const [updateInfo, setUpdateInfo] = useState<Omit<AppUpdateInfo, 'earlyAccess'> | undefined>(undefined);
  const [downloadProgress, setDownloadProgress] = useState<UpdateDownloadProgress>();
  const [downloadState, setDownloadState] = useState<'failed' | 'completed' | 'progress' | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fetched, setFetched] = useState<boolean>(false);
  const updateChannel = useUserState('updateChannel');

  const dispatch = useDispatch<AppDispatch>();
  const removeListener = useRef<(() => void) | null>(null);

  const show = useTabVisibility(activeTab);

  const listenProgress = useCallback(() => {
    removeListener.current = applicationIpc.on.updateStatus((type, status) => {
      switch (type) {
        case 'update-available': {
          setDownloadProgress(undefined);
          dispatch(settingsActions.setSettingsState({key: 'updateAvailable', value: true}));
          lynxTopToast(dispatch).info('New Update Available!');
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

  useEffect(() => {
    return () => {
      removeListener.current?.();
    };
  }, []);

  useEffect(() => {
    listenProgress();

    async function fetchData() {
      const result: CollapseProps['items'] = [];

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

        if (isEmpty(data.changeLog)) return;

        (isInsider ? insiderData : data).changeLog.forEach((change, index) => {
          if (change.build <= APP_BUILD_NUMBER || change.build > latestBuild) return;
          const children = change.changes.map((item, index) => {
            return (
              <Typography.Paragraph key={index}>
                <ul>
                  <Divider>{item.title}</Divider>
                  {RenderSubItems(item.items, `section_${index}`)}
                </ul>
              </Typography.Paragraph>
            );
          });
          result.push({
            key: index,
            label: change.version,
            children,
          });
        });

        setItems(result);
        setFetched(true);
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, updateChannel]);

  const renderTitle = useMemo(() => {
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

  const renderBody = () => {
    switch (downloadState) {
      case 'failed':
        return (
          <Downloaded success={false} cancel={cancel} onClose={onClose} errMsg={errorMsg} tryAgain={startDownload} />
        );
      case 'completed':
        return <Downloaded cancel={cancel} onClose={onClose} tryAgain={startDownload} success />;
      case 'progress':
        return <Downloading progress={downloadProgress} />;
      default:
        return fetched ? (
          <Info items={items} updateInfo={updateInfo} />
        ) : (
          <CircularProgress size="lg" color="secondary" label="Retrieving Release Notes..." />
        );
    }
  };

  const openDownloadPage = useCallback(() => {
    const isEA = updateChannel === 'early_access';
    const isInsider = updateChannel === 'insider';
    window.open(isInsider ? INSIDER_RELEASES_PAGE : isEA ? EARLY_RELEASES_PAGE : RELEASES_PAGE);
    dispatch(modalActions.closeUpdateApp());
  }, [dispatch, updateChannel]);

  const downloadButton = useMemo(() => {
    const autoDownload: boolean = checkCustomUpdate || !!window.isPortable;

    return (
      <Button
        color="success"
        variant="light"
        className="cursor-default"
        onPress={autoDownload ? openDownloadPage : startDownload}>
        {autoDownload ? 'Download Page' : 'Download'}
      </Button>
    );
  }, [checkCustomUpdate, openDownloadPage, startDownload]);

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      scrollBehavior="inside"
      motionProps={modalMotionProps}
      classNames={{backdrop: `top-10! ${show}`, wrapper: `top-10! scrollbar-hide ${show}`}}
      hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-success">{renderTitle}</ModalHeader>
        <ModalBody className="items-center pb-5 scrollbar-hide">{renderBody()}</ModalBody>
        {downloadState !== 'completed' && downloadState !== 'failed' && (
          <ModalFooter>
            {downloadState === undefined && downloadButton}
            {downloadState === 'progress' && (
              <Button color="warning" variant="light" onPress={cancelDownload} className="cursor-default">
                Cancel
              </Button>
            )}
            <Button color="danger" variant="light" onPress={onClose} className="cursor-default">
              Close
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default UpdateApp;
