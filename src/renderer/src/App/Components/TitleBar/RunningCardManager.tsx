import {Button, Checkbox} from '@nextui-org/react';
import {Divider, Modal, Typography} from 'antd';
import {isEmpty} from 'lodash';
import {useCallback, useMemo, useState} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {cardsActions, useCardsState} from '../../Redux/AI/CardsReducer';
import {settingsActions, useSettingsState} from '../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import LynxTooltip from '../Reusable/LynxTooltip';
import SmallButton from '../Reusable/SmallButton';
import WebviewZoomFactor from './Webview-ZoomFactor';

const RunningCardManager = () => {
  const runningCard = useCardsState('runningCard');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');
  const dispatch = useDispatch<AppDispatch>();

  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);

  const onShowConfirm = useCallback(
    (enabled: boolean) => {
      rendererIpc.storage.update('app', {terminateAIConfirm: !enabled});
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: !enabled}));
    },
    [dispatch],
  );

  const destroyModal = useCallback(() => {
    Modal.destroyAll();
    setIsConfirmVisible(false);
  }, [setIsConfirmVisible]);

  const onStop = useCallback(() => {
    rendererIpc.pty.process('stop', runningCard.id);
    dispatch(cardsActions.stopRunningCard());
    rendererIpc.win.setDiscordRpAiRunning({running: false});
    destroyModal();
  }, [runningCard.id, dispatch]);

  const onRestart = useCallback(() => {
    const wasRunning = runningCard;
    onStop();
    setTimeout(() => {
      rendererIpc.pty.process('start', wasRunning.id);
      dispatch(cardsActions.startRunningCard(wasRunning.id));
    }, 500);
  }, [onStop, runningCard, dispatch]);

  const stopAi = useCallback(() => {
    if (runningCard.id) {
      if (isHotkeyPressed('control') || !showTerminateConfirm) {
        onStop();
      } else if (!isConfirmVisible) {
        setIsConfirmVisible(true);
        Modal.error({
          title: 'Terminate AI Execution',
          content: (
            <div className="mt-2 flex flex-col space-y-1">
              <Typography.Text>
                Stopping the AI will end its execution immediately. Unsaved data will be lost. Continue?
              </Typography.Text>
              <Checkbox size="sm" onValueChange={onShowConfirm}>
                Always terminate without confirmation
              </Checkbox>
            </div>
          ),
          footer: (
            <div className="mt-2 flex w-full flex-row justify-between">
              <Button size="sm" color="success" onPress={destroyModal}>
                Keep Running
              </Button>
              <div className="space-x-2">
                <Button size="sm" color="warning" onPress={onRestart}>
                  Relaunch
                </Button>
                <Button size="sm" color="danger" onPress={onStop}>
                  Terminate Process
                </Button>
              </div>
            </div>
          ),
          onCancel: () => {
            setIsConfirmVisible(false);
          },
          centered: true,
          maskClosable: true,
          rootClassName: 'scrollbar-hide',
          styles: {mask: {top: '2.5rem'}},
          wrapClassName: 'mt-10',
        });
      }
    }
  }, [onRestart, onShowConfirm, onStop, runningCard.id, showTerminateConfirm, isConfirmVisible, setIsConfirmVisible]);

  const changeAiView = useCallback(() => {
    if (runningCard.id) {
      dispatch(cardsActions.setRunningCardView(runningCard.currentView === 'terminal' ? 'browser' : 'terminal'));
    }
  }, [runningCard.id, runningCard.currentView, dispatch]);

  const refresh = useCallback(() => {
    const iframe = document.getElementById(runningCard.browserId) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = runningCard.address;
    }
  }, [runningCard.browserId, runningCard.address]);

  const copyToClipboard = useCallback(() => {
    if (isHotkeyPressed('control')) {
      window.open(runningCard.address);
    } else {
      navigator.clipboard.writeText(runningCard.address);
    }
  }, [runningCard.address]);

  const isBrowserView = useMemo(() => {
    return runningCard.currentView === 'browser';
  }, [runningCard.currentView]);

  const renderButtons = useMemo(
    () => (
      <>
        <LynxTooltip content="Terminate Process" isEssential>
          <div>
            <SmallButton icon="Stop" onClick={stopAi} iconClassName="m-[8px] text-danger" />
          </div>
        </LynxTooltip>

        {!isEmpty(runningCard.address) && (
          <>
            <Divider type="vertical" className="mr-0" />
            <LynxTooltip content={`Switch to ${isBrowserView ? 'Terminal' : 'Browser View'}`} isEssential>
              <div>
                <SmallButton
                  onClick={changeAiView}
                  icon={isBrowserView ? 'Terminal' : 'Web'}
                  iconClassName={isBrowserView ? 'm-[8px]' : 'm-[7px]'}
                />
              </div>
            </LynxTooltip>
          </>
        )}
        {isBrowserView && (
          <>
            <Divider type="vertical" className="mr-4" />
            <LynxTooltip
              content={
                <div className="flex flex-col content-center items-center space-y-1 py-1">
                  <span>Copy to Clipboard</span>
                  <div className="space-x-1">
                    <Typography.Text keyboard>CTRL + Click</Typography.Text>
                    <span>Open in Browser</span>
                  </div>
                </div>
              }
              delay={500}
              isEssential>
              <div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={copyToClipboard}
                  className="notDraggable animate-appearance-in font-JetBrainsMono text-[0.8rem]">
                  {runningCard.address}
                </Button>
              </div>
            </LynxTooltip>
          </>
        )}
        {!isEmpty(runningCard.address) && isBrowserView && (
          <>
            <Divider type="vertical" className="ml-4 mr-0" />
            <LynxTooltip content="Refresh Browser View" isEssential>
              <div>
                <SmallButton icon="Refresh3" onClick={refresh} iconClassName="m-[8px]" />
              </div>
            </LynxTooltip>

            <Divider type="vertical" className="ml-4 mr-0" />
            <WebviewZoomFactor />
          </>
        )}
      </>
    ),
    [runningCard, stopAi, changeAiView, copyToClipboard, refresh],
  );

  return <div className="flex flex-row items-center justify-center">{renderButtons}</div>;
};

export default RunningCardManager;
