import {Button, Checkbox, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {Typography} from 'antd';
import {useCallback, useState} from 'react';
import {isHotkeyPressed} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {Stop_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import {cardsActions} from '../../Redux/Reducer/CardsReducer';
import {settingsActions, useSettingsState} from '../../Redux/Reducer/SettingsReducer';
import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import {RunningCard} from '../../Utils/Types';
import SmallButton from '../Reusable/SmallButton';

type Props = {runningCard: RunningCard};
export default function RCM_Terminate({runningCard}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const showTerminateConfirm = useSettingsState('terminateAIConfirm');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const destroyModal = useCallback(() => setIsConfirmOpen(false), [setIsConfirmOpen]);

  const onStop = useCallback(() => {
    rendererIpc.pty.process(runningCard.id, 'stop', runningCard.id);
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

  const onRestart = useCallback(() => {
    const wasRunning = runningCard;
    onStop();
    setTimeout(() => {
      rendererIpc.pty.process(runningCard.id, 'start', wasRunning.id);
      dispatch(cardsActions.addRunningCard({id: wasRunning.id, tabId: activeTab}));
    }, 500);
  }, [onStop, runningCard, dispatch, activeTab]);

  const stopAi = useCallback(() => {
    if (runningCard.id) {
      if (isHotkeyPressed('control') || !showTerminateConfirm) {
        onStop();
      } else if (!isConfirmOpen) {
        setIsConfirmOpen(true);
      }
    }
  }, [onRestart, onShowConfirm, onStop, runningCard.id, showTerminateConfirm, isConfirmOpen, setIsConfirmOpen]);

  return (
    <>
      <SmallButton onClick={stopAi} icon={<Stop_Icon className="m-[8px] text-danger" />} />
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
        placement="bottom"
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        classNames={{base: 'before:dark:bg-LynxRaisinBlack', backdrop: '!top-10'}}
        showArrow>
        <PopoverTrigger>
          <a />
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
              <Button size="sm" color="warning" onPress={onRestart}>
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
