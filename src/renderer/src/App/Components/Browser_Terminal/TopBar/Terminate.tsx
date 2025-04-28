import {Button, Checkbox, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {Typography} from 'antd';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Stop_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../../Redux/Reducer/HotkeysReducer';
import {settingsActions, useSettingsState} from '../../../Redux/Reducer/SettingsReducer';
import {tabsActions, useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';

type Props = {runningCard: RunningCard};

export default function Terminate({runningCard}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const activeTab = useTabsState('activeTab');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const destroyModal = useCallback(() => setIsConfirmOpen(false), [setIsConfirmOpen]);

  const onStop = useCallback(() => {
    if (runningCard.isEmptyRunning) {
      rendererIpc.pty.emptyProcess(runningCard.id, 'stop');
    } else {
      rendererIpc.pty.process(runningCard.id, 'stop', runningCard.id);
    }

    dispatch(tabsActions.setActiveTabLoading(false));
    dispatch(tabsActions.setTabIsTerminal({tabID: activeTab, isTerminal: false}));
    dispatch(cardsActions.stopRunningCard({tabId: activeTab}));
    rendererIpc.win.setDiscordRpAiRunning({running: false});
    destroyModal();
  }, [runningCard.id, dispatch, activeTab]);

  const onShowConfirm = useCallback(
    (enabled: boolean) => {
      rendererIpc.storage.update('app', {terminateAIConfirm: !enabled});
      dispatch(settingsActions.setSettingsState({key: 'terminateAIConfirm', value: !enabled}));
    },
    [dispatch],
  );

  const onRelaunch = useCallback(() => {
    const wasRunning = runningCard;
    onStop();
    setTimeout(() => {
      if (runningCard.isEmptyRunning) {
        rendererIpc.pty.emptyProcess(runningCard.id, 'stop');
        dispatch(cardsActions.addRunningEmpty({tabId: activeTab, type: runningCard.type}));
      } else {
        rendererIpc.pty.process(runningCard.id, 'start', wasRunning.id);
        dispatch(cardsActions.addRunningCard({id: wasRunning.id, tabId: activeTab}));
      }
    }, 500);
  }, [onStop, runningCard, dispatch, activeTab]);

  const stopAi = () => {
    if (runningCard.id) {
      if (isCtrlPressed || !showTerminateConfirm) {
        onStop();
      } else if (!isConfirmOpen) {
        setIsConfirmOpen(true);
      }
    }
  };

  return (
    <>
      <Button size="sm" variant="light" onPress={stopAi} className="cursor-default" isIconOnly>
        <Stop_Icon className="size-4 text-danger" />
      </Button>
      <Popover
        onClick={e => {
          // @ts-expect-error
          if (e.target.dataset.slot === 'backdrop') {
            setIsConfirmOpen(false);
          }
        }}
        offset={25}
        crossOffset={-16}
        backdrop="opaque"
        placement="bottom-end"
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        classNames={{base: 'before:dark:bg-LynxRaisinBlack', backdrop: '!top-10'}}
        showArrow>
        <PopoverTrigger>
          <div />
        </PopoverTrigger>
        <PopoverContent className="py-4 px-8 dark:bg-LynxRaisinBlack">
          <span className="self-start text-medium font-semibold">Terminate AI Execution</span>
          <div className="mt-2 flex flex-col space-y-1">
            <Typography.Text>
              Stopping the AI will end its execution immediately.
              <br /> Unsaved data will be lost. Continue?
            </Typography.Text>
            <Checkbox size="sm" onValueChange={onShowConfirm}>
              Always terminate without confirmation
            </Checkbox>
          </div>
          <div className="mt-2 flex w-full flex-row justify-between">
            <Button
              onPress={() => {
                setIsConfirmOpen(false);
              }}
              size="sm"
              color="success">
              Keep Running
            </Button>
            <div className="space-x-2">
              <Button size="sm" color="warning" onPress={onRelaunch}>
                Relaunch
              </Button>
              <Button size="sm" color="danger" onPress={onStop}>
                Terminate
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
