import {Button} from '@heroui/react';
import windowDialogsIpc from '@lynx_shared/ipc/dialogsWindow';
import {Check, ShieldCheck, X} from 'lucide-react';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow, useFocus} from '../Shared';

/**
 * ConfirmWindow Component
 * Displays a confirmation dialog with OK and Cancel buttons.
 */
const ConfirmWindow = memo(function ConfirmWindow() {
  const {message} = useContextState('confirmWindow');

  const handleResult = (result: boolean) => {
    windowDialogsIpc.confirmResult(result);
    hideContextWindow();
  };

  const focusRef = useFocus();

  return (
    <div className="py-5 px-5 flex flex-col gap-y-5 draggable w-100">
      <div className="flex gap-x-2 items-center">
        <ShieldCheck aria-hidden="true" className="size-8 text-warning" />
        <span role="alert" className="w-full">
          {message}
        </span>
      </div>

      <div className="flex justify-between">
        <Button aria-label="Cancel" variant="danger-soft" className="notDraggable" onPress={() => handleResult(false)}>
          <X className="size-4" />
          Cancel
        </Button>

        <Button ref={focusRef} aria-label="Confirm" className="notDraggable" onPress={() => handleResult(true)}>
          <Check className="size-4" />
          OK
        </Button>
      </div>
    </div>
  );
});

export default ConfirmWindow;
