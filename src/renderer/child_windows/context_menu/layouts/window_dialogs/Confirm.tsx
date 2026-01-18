import {Button} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import windowDialogsIpc from '@lynx/ipc/window_dialogs';
import {Check, ShieldCheck, X} from 'lucide-react';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideWindow, setElementFocus} from '../Shared';

const ConfirmWindow = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const offPrompt = windowDialogsIpc.confirmShow((_message: string) => {
      setMessage(_message);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.Confirm);

      rendererIpc.contextMenu.showWindow();
    });

    return () => offPrompt();
  }, []);

  const handleResult = (result: boolean) => {
    windowDialogsIpc.confirmResult(result);
    hideWindow();
  };

  if (!show) return null;

  return (
    <div className="py-5 px-5 flex flex-col gap-y-5">
      <div className="flex gap-x-2 items-center">
        <ShieldCheck className="size-6 text-warning" />
        <span className="w-full">{message}</span>
      </div>

      <div className="flex justify-between">
        <Button
          variant="light"
          color="warning"
          onPress={() => handleResult(false)}
          startContent={<X className="size-4" />}>
          Cancel
        </Button>

        <Button
          variant="flat"
          color="success"
          ref={setElementFocus}
          onPress={() => handleResult(true)}
          startContent={<Check className="size-4" />}
          autoFocus>
          OK
        </Button>
      </div>
    </div>
  );
});

export default ConfirmWindow;
