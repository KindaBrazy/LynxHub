import {DownloadItemInfo} from '@lynx_cross/types/download_manager';
import {ContextWindowWidthSizes} from '@lynx_cross/types/ipc';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import windowDialogsIpc from '@lynx_shared/ipc/dialogs_window';
import downloadManagerIpc from '@lynx_shared/ipc/download_manager';
import {isEmpty} from 'lodash';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {MenuTypes} from './consts';
import {contextActions} from './redux/reducer';
import {ContextDispatch} from './redux/store';

export default function useShowEvents() {
  const dispatch = useDispatch<ContextDispatch>();

  useEffect(() => {
    const offInitView = contextMenuIpc.on.rightClick((params, navHistory, contextId) => {
      const hasLinkItems = !isEmpty(params.linkURL);
      const hasImageItems = params.mediaType === 'image';
      const hasTextSelection = !isEmpty(params.selectionText);
      const hasEditItems =
        params.editFlags.canUndo ||
        params.editFlags.canRedo ||
        params.editFlags.canCut ||
        params.editFlags.canCopy ||
        params.editFlags.canPaste ||
        params.editFlags.canSelectAll;
      const isActionsAvailable = hasLinkItems || hasEditItems || hasImageItems || hasTextSelection;

      const widthSize: ContextWindowWidthSizes = hasLinkItems || hasImageItems || hasTextSelection ? 'md' : 'sm';

      dispatch(
        contextActions.showLayout({
          key: 'rightClick',
          value: {id: contextId, contextMenuParams: params, navigationHistory: navHistory},
          layout: MenuTypes.RightClick,
          widthSize,
        }),
      );
      dispatch(
        contextActions.updateRightClickParams({
          hasEditItems,
          hasImageItems,
          hasLinkItems,
          hasTextSelection,
          isActionsAvailable,
        }),
      );
    });

    const offZoom = contextMenuIpc.on.zoom((id, zoomFactor) => {
      dispatch(
        contextActions.showLayout({
          key: 'browserScale',
          value: {id, factor: zoomFactor * 100},
          layout: MenuTypes.BrowserScale,
          widthSize: 'md',
        }),
      );
    });

    const offFind = contextMenuIpc.on.find(value => {
      dispatch(
        contextActions.showLayout({
          key: 'targetID',
          value,
          layout: MenuTypes.FindInPage,
          widthSize: 'md',
        }),
      );
    });

    const offCloseApp = contextMenuIpc.on.closeApp(() => {
      dispatch(
        contextActions.showLayout({
          key: 'activeLayout',
          value: MenuTypes.CloseAppConfirm,
          widthSize: 'lg',
        }),
      );
    });

    const offTerminateProcess = contextMenuIpc.on.terminateProcess(value => {
      dispatch(
        contextActions.showLayout({
          key: 'targetID',
          value,
          layout: MenuTypes.TerminateProcessConfirm,
          widthSize: 'lg',
        }),
      );
    });

    const offTerminateTab = contextMenuIpc.on.terminateTab(value => {
      dispatch(
        contextActions.showLayout({
          key: 'targetID',
          value,
          layout: MenuTypes.TerminateTabConfirm,
          widthSize: 'lg',
        }),
      );
    });

    const offVolume = contextMenuIpc.on.volume(value => {
      dispatch(
        contextActions.showLayout({
          key: 'browserVolume',
          value,
          layout: MenuTypes.Volume,
          widthSize: 'md',
        }),
      );
    });

    const OffDownloads = contextMenuIpc.on.downloads(() => {
      dispatch(
        contextActions.showLayout({
          key: 'activeLayout',
          value: MenuTypes.Downloads,
          widthSize: 'lg',
        }),
      );
    });

    const offPrompt = windowDialogsIpc.promptShow((message: string, defaultValue?: string) => {
      dispatch(
        contextActions.showLayout({
          key: 'promptWindow',
          value: {message, defaultValue},
          layout: MenuTypes.Prompt,
          widthSize: 'lg',
        }),
      );
    });

    const offAlert = windowDialogsIpc.alertShow((message: string) => {
      dispatch(
        contextActions.showLayout({
          key: 'alertWindow',
          value: {message},
          layout: MenuTypes.Alert,
          widthSize: 'lg',
        }),
      );
    });

    const offConfirm = windowDialogsIpc.confirmShow((message: string) => {
      dispatch(
        contextActions.showLayout({
          key: 'confirmWindow',
          value: {message},
          layout: MenuTypes.Confirm,
          widthSize: 'lg',
        }),
      );
    });

    // Download manager IPC listeners
    const offDlStart = downloadManagerIpc.on.dlStart(info => {
      const newItem: DownloadItemInfo = {
        ...info,
        bytesPerSecond: 0,
        etaSecond: 0,
        percent: 0,
        receivedBytes: 0,
        status: 'downloading',
      };
      dispatch(contextActions.addDownload(newItem));
    });

    const offProgress = downloadManagerIpc.on.progress(info => {
      dispatch(contextActions.updateDownloadProgress(info));
    });

    const offDone = downloadManagerIpc.on.done(info => {
      dispatch(
        contextActions.updateDownloadStatus({
          name: info.name,
          status: info.state === 'interrupted' ? 'cancelled' : info.state,
        }),
      );
    });

    return () => {
      offZoom();
      offFind();
      offInitView();
      offCloseApp();
      offTerminateProcess();
      offTerminateTab();
      offVolume();
      OffDownloads();
      offPrompt();
      offAlert();
      offConfirm();
      offDlStart();
      offProgress();
      offDone();
    };
  }, []);
}
