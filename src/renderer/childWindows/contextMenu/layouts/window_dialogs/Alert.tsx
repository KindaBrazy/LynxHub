import {Button} from '@heroui/react';
import {Check, ShieldAlert} from 'lucide-react';
import {memo} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow} from '../Shared';

/**
 * AlertWindow Component
 * Displays an alert message with an OK button.
 */
const AlertWindow = memo(function AlertWindow() {
  const {message} = useContextState('alertWindow');

  return (
    <div className="py-4 px-5 flex flex-col gap-y-3 draggable">
      <div className="flex gap-x-2 mt-2 items-start">
        <ShieldAlert className="size-8 text-danger" aria-hidden="true" />
        <span className="w-full" role="alert">
          {message}
        </span>
      </div>

      <div className="flex justify-end">
        <Button
          variant="flat"
          color="success"
          className="notDraggable"
          onPress={hideContextWindow}
          startContent={<Check className="size-4" />}
          aria-label="OK">
          OK
        </Button>
      </div>
    </div>
  );
});

export default AlertWindow;
