import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {useCallback, useState} from 'react';

import initializerIpc from './InitializerIpc';

export default function CancelBtn() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const close = useCallback(() => initializerIpc.close(), []);

  return (
    <Popover
      radius="sm"
      isOpen={isOpen}
      backdrop="opaque"
      onOpenChange={setIsOpen}
      className="dark text-white max-w-64 notDraggable"
      showArrow>
      <PopoverTrigger>
        <Button variant="flat" color="warning" className="notDraggable cursor-default dark" fullWidth>
          Cancel
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3">
        <span className="font-semibold">Are you sure you want to exit the initial process?</span>
        <div className="flex items-center gap-x-2 pt-4">
          <Button size="sm" variant="flat" color="warning" onPress={close}>
            Yes
          </Button>
          <Button size="sm" variant="flat" color="success" className="cursor-default" onPress={() => setIsOpen(false)}>
            No
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
