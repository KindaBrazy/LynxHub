import {Button} from '@heroui/react';
import {useContextState} from '@lynx/redux/reducer';
import {Check, ShieldAlert} from 'lucide-react';
import {memo} from 'react';

import {hideContextWindow} from '../Shared';

const AlertWindow = memo(() => {
  const {message} = useContextState('alertWindow');

  return (
    <div className="py-4 px-5 flex flex-col gap-y-3 draggable">
      <div className="flex gap-x-2 mt-2 items-start">
        <ShieldAlert className="size-8 text-danger" />
        <span className="w-full">{message}</span>
      </div>

      <div className="flex justify-end">
        <Button
          variant="flat"
          color="success"
          className="notDraggable"
          onPress={hideContextWindow}
          startContent={<Check className="size-4" />}>
          OK
        </Button>
      </div>
    </div>
  );
});

export default AlertWindow;
