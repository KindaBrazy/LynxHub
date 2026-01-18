import {Button} from '@heroui/react';
import {Power_Icon} from '@lynx_assets/icons';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import {Forward2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

const TerminateProcess = memo(({setWidthSize, show, setSelectedLayout}: CommonProps) => {
  const [id, setId] = useState<string>('');

  const onStop = () => {
    contextMenuIpc.send.stopAI(id);
    hideContextWindow();
  };
  const onRelaunch = () => {
    contextMenuIpc.send.relaunchAI(id);
    hideContextWindow();
  };

  useEffect(() => {
    const offTerminateAI = contextMenuIpc.on.terminateProcess(_id => {
      setId(_id);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.TerminateProcessConfirm);

      contextMenuIpc.send.showWindow();
    });

    return () => offTerminateAI();
  }, []);

  if (!show) return null;

  return (
    <ConfirmElement
      buttons={
        <>
          <Button
            size="sm"
            color="success"
            onPress={hideContextWindow}
            startContent={<Forward2 className="rotate-180" />}>
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
        </>
      }
      confirmName="terminateAIConfirm"
      title="Confirm Terminate Process"
      enabledTitle="Always terminate without confirmation"
    />
  );
});

export default TerminateProcess;
