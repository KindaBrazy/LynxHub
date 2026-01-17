import {Button, Checkbox} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Power_Icon} from '@lynx_assets/icons';
import {Forward2, ShieldWarning} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect, useRef, useState} from 'react';

import {MenuTypes} from '../consts';
import {CommonProps} from '../types';
import {hideWindow, setElementFocus} from './Shared';

export default function TerminateTabConfirm({setWidthSize, show, setSelectedLayout}: CommonProps) {
  const [id, setId] = useState<string>('');
  const [showConfirmValue, setShowConfirmValue] = useState<boolean>(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onShowConfirm = (enabled: boolean) => {
    rendererIpc.storageUtils.setShowConfirm('closeTabConfirm', !enabled);
    setShowConfirmValue(enabled);
  };
  const removeTab = () => {
    rendererIpc.contextMenu.removeTab(id);
    hideWindow();
  };

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab((_, webID) => {
      setId(webID);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.TerminateTabConfirm);

      rendererIpc.contextMenu.showWindow();
      rendererIpc.storage.get('app').then(({closeTabConfirm}) => {
        setShowConfirmValue(!closeTabConfirm);
      });
    });

    return () => offTerminateTab();
  }, []);

  if (!show) return null;

  return (
    <div key={'terminate_tab'} className="py-4 px-5">
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
        <Button
          size="sm"
          color="danger"
          onPress={removeTab}
          ref={setElementFocus}
          startContent={<Power_Icon />}
          autoFocus>
          Terminate
        </Button>
      </div>
    </div>
  );
}
