import {Button, Checkbox} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Power_Icon} from '@lynx_assets/icons';
import {Forward2, Restart, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../consts';
import {CommonProps} from '../types';
import {hideWindow, setElementFocus} from './Shared';

const TerminateProcessConfirm = memo(({setWidthSize, show, setSelectedLayout}: CommonProps) => {
  const [id, setId] = useState<string>('');
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('terminateAIConfirm', !enabled);
    setShowConfirmValue(enabled);
  };
  const onStop = () => {
    rendererIpc.contextMenu.stopAI(id);
    hideWindow();
  };
  const onRelaunch = () => {
    rendererIpc.contextMenu.relaunchAI(id);
    hideWindow();
  };

  useEffect(() => {
    const offTerminateAI = rendererIpc.contextMenu.onTerminateAI((_, targetID) => {
      setId(targetID);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.TerminateProcessConfirm);

      rendererIpc.contextMenu.showWindow();
      rendererIpc.storage.get('app').then(({terminateAIConfirm}) => {
        setShowConfirmValue(!terminateAIConfirm);
      });
    });

    return () => offTerminateAI();
  }, []);

  if (!show) return null;

  return (
    <>
      <div className="py-4 px-5" key="terminate_ai_confirm">
        <div className="flex flex-row items-center justify-start gap-x-2">
          <ShieldWarning className="text-warning size-7" />
          <span className="text-medium font-semibold">Confirm Terminate Process</span>
        </div>

        <Checkbox size="sm" className="my-1" isSelected={showConfirmValue} onValueChange={onShowConfirm}>
          Always terminate without confirmation
        </Checkbox>

        <div className="flex w-full flex-row justify-between">
          <Button size="sm" color="success" onPress={hideWindow} startContent={<Forward2 className="rotate-180" />}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button size="sm" color="warning" onPress={onRelaunch} startContent={<Restart />}>
              Relaunch
            </Button>
            <Button
              size="sm"
              color="danger"
              onPress={onStop}
              ref={setElementFocus}
              startContent={<Power_Icon />}
              autoFocus>
              Terminate
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

export default TerminateProcessConfirm;
