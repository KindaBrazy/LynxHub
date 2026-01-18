import {Button} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Power_Icon} from '@lynx_assets/icons';
import {Forward2} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

const TerminateTab = memo(({setWidthSize, show, setSelectedLayout}: CommonProps) => {
  const [id, setId] = useState<string>('');

  const removeTab = () => {
    rendererIpc.contextMenu.removeTab(id);
    hideWindow();
  };

  useEffect(() => {
    const offTerminateTab = rendererIpc.contextMenu.onTerminateTab((_, webID) => {
      setId(webID);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.TerminateTabConfirm);

      rendererIpc.contextMenu.showWindow();
    });

    return () => offTerminateTab();
  }, []);

  if (!show) return null;

  return (
    <ConfirmElement
      buttons={
        <>
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
        </>
      }
      confirmName="closeTabConfirm"
      title="Confirm Terminate Process"
      enabledTitle="Always terminate without confirmation"
    />
  );
});

export default TerminateTab;
