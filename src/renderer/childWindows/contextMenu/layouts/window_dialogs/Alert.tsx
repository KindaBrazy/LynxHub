import {Button} from '@heroui-v3/react';
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
    <div className="py-4 px-5 flex flex-col gap-y-3 draggable w-100">
      <div className="flex gap-x-2 mt-2 items-start">
        <ShieldAlert aria-hidden="true" className="size-8 text-danger" />
        <span role="alert" className="w-full">
          {message}
        </span>
      </div>

      <div className="flex justify-end">
        <Button aria-label="OK" className="notDraggable" onPress={hideContextWindow}>
          <Check className="size-4" />
          OK
        </Button>
      </div>
    </div>
  );
});

export default AlertWindow;
