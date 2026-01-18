import {Button} from '@heroui/react';
import contextMenuIpc from '@lynx/ipc/context_menu';
import windowDialogsIpc from '@lynx/ipc/window_dialogs';
import {Check, ShieldAlert} from 'lucide-react';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideContextWindow} from '../Shared';

const AlertWindow = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const offPrompt = windowDialogsIpc.alertShow((_message: string) => {
      setMessage(_message);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.Alert);

      contextMenuIpc.send.showWindow();
    });

    return () => offPrompt();
  }, []);

  if (!show) return null;

  return (
    <div className="py-4 px-5 flex flex-col gap-y-3">
      <div className="flex gap-x-2 items-start">
        <ShieldAlert className="size-6 text-danger" />
        <span className="w-full">{message}</span>
      </div>

      <div className="flex justify-end">
        <Button variant="flat" color="success" onPress={hideContextWindow} startContent={<Check className="size-4" />}>
          OK
        </Button>
      </div>
    </div>
  );
});

export default AlertWindow;
