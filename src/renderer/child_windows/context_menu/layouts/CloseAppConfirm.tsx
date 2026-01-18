import {Button, Checkbox} from '@heroui/react';
import {isLinuxPortable} from '@lynx/hooks/utils';
import rendererIpc from '@lynx/ipc';
import {Power_Icon} from '@lynx_assets/icons';
import {Forward2, Restart, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../consts';
import {CommonProps} from '../types';
import {hideWindow, setElementFocus} from './Shared';

const CloseAppConfirm = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('closeConfirm', !enabled);
    setShowConfirmValue(enabled);
  };
  const onRestart = () => rendererIpc.win.changeWinState('restart');
  const onClose = () => rendererIpc.win.changeWinState('close');

  useEffect(() => {
    const offCloseApp = rendererIpc.contextMenu.onCloseApp(() => {
      setWidthSize('lg');
      setSelectedLayout(MenuTypes.CloseAppConfirm);
      rendererIpc.contextMenu.showWindow();
      rendererIpc.storage.get('app').then(({closeConfirm}) => {
        setShowConfirmValue(!closeConfirm);
      });
    });

    return () => offCloseApp();
  }, []);

  if (!show) return null;

  return (
    <div className="py-4 px-8">
      <div className="flex flex-row items-center justify-start gap-x-2">
        <ShieldWarning className="text-warning size-7" />
        <span className="text-medium font-semibold">Confirm Exit</span>
      </div>
      <Checkbox size="sm" className="my-1" isSelected={showConfirmValue} onValueChange={onShowConfirm}>
        Always exit without confirmation
      </Checkbox>
      <div className="flex w-full flex-row justify-between">
        <Button size="sm" color="success" onPress={hideWindow} startContent={<Forward2 className="rotate-180" />}>
          Stay
        </Button>
        <div className="space-x-2">
          {!isLinuxPortable && (
            <Button size="sm" color="warning" onPress={onRestart} startContent={<Restart />}>
              Restart
            </Button>
          )}
          <Button
            size="sm"
            color="danger"
            onPress={onClose}
            ref={setElementFocus}
            startContent={<Power_Icon />}
            autoFocus>
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
});

export default CloseAppConfirm;
