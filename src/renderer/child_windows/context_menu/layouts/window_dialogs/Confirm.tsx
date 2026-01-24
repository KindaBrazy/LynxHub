import {Button} from '@heroui/react';
import windowDialogsIpc from '@lynx_shared/ipc/dialogs_window';
import {Check, ShieldCheck, X} from 'lucide-react';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow, setElementFocus} from '../Shared';

const ConfirmWindow = memo(() => {
  const {message} = useContextState('confirmWindow');

  const handleResult = (result: boolean) => {
    windowDialogsIpc.confirmResult(result);
    hideContextWindow();
  };

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
