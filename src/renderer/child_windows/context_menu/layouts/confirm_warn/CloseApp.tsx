import {Button} from '@heroui/react';
import {isLinuxPortable} from '@lynx/hooks/utils';
import {Power_Icon} from '@lynx_assets/icons';
import rendererIpc from '@lynx_shared/ipc';
import contextMenuIpc from '@lynx_shared/ipc/context_menu';
import {Forward2, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

const CloseApp = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const onRestart = () => rendererIpc.win.changeWinState('restart');
  const onClose = () => rendererIpc.win.changeWinState('close');

  useEffect(() => {
    const offCloseApp = contextMenuIpc.on.closeApp(() => {
      setWidthSize('lg');
      setSelectedLayout(MenuTypes.CloseAppConfirm);
      contextMenuIpc.send.showWindow();
    });

    return () => offCloseApp();
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
        </>
      }
      title="Confirm Exit"
      confirmName="closeConfirm"
      enabledTitle="Always exit without confirmation"
    />
  );
});

export default CloseApp;
