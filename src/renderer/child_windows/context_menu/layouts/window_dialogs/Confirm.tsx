import {Button} from '@heroui/react';
import windowDialogsIpc from '@lynx_shared/ipc/window_dialogs';
import {Check, ShieldCheck, X} from 'lucide-react';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideContextWindow, setElementFocus, showContextWindow} from '../Shared';

const ConfirmWindow = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const offPrompt = windowDialogsIpc.confirmShow((_message: string) => {
      setMessage(_message);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.Confirm);

      showContextWindow();
    });

    return () => offPrompt();
  }, []);

  const handleResult = (result: boolean) => {
    windowDialogsIpc.confirmResult(result);
    hideContextWindow();
  };

  if (!show) return null;

  return (
    <div className="py-5 px-5 flex flex-col gap-y-5 draggable">
      <div className="flex gap-x-2 items-center">
        <ShieldCheck className="size-8 text-warning" />
        <span className="w-full">{message}</span>
      </div>

      <div className="flex justify-between">
        <Button
          variant="light"
          color="warning"
          className="notDraggable"
          onPress={() => handleResult(false)}
          startContent={<X className="size-4" />}>
          Cancel
        </Button>

        <Button
          variant="flat"
          color="success"
          ref={setElementFocus}
          className="notDraggable"
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
