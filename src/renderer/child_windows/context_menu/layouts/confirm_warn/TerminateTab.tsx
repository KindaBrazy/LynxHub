import {Button} from '@heroui/react';
import contextMenuIpc from '@lynx/ipc/context_menu';
import {Power_Icon} from '@lynx_assets/icons';
import {Forward2} from '@solar-icons/react-perf/BoldDuotone';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideContextWindow, setElementFocus} from '../Shared';
import ConfirmElement from './ConfirmElement';

const TerminateTab = memo(({setWidthSize, show, setSelectedLayout}: CommonProps) => {
  const [id, setId] = useState<string>('');

  const removeTab = () => {
    contextMenuIpc.send.removeTab(id);
    hideContextWindow();
  };

  useEffect(() => {
    const offTerminateTab = contextMenuIpc.on.terminateTab(_id => {
      setId(_id);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.TerminateTabConfirm);

      contextMenuIpc.send.showWindow();
    });

    return () => offTerminateTab();
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
