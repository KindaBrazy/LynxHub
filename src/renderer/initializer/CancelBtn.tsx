import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {useCallback, useState} from 'react';
import initializerIpc from './InitializerIpc';

export default function CancelBtn() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const close = useCallback(() => initializerIpc.close(), []);

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      backdrop="opaque"
      className="dark text-white max-w-64 notDraggable"
      radius="sm"
      showArrow>
      <PopoverTrigger>
        <Button color="warning" variant="flat" className="notDraggable cursor-default dark" fullWidth>
          Cancel
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3">
        <span className="font-semibold">Are you sure you want to exit the initial process?</span>
        <div className="flex items-center gap-x-2 pt-4">
          <Button size="sm" variant="flat" color="warning" onPress={close}>
            Yes
          </Button>
          <Button onPress={() => setIsOpen(false)} size="sm" variant="flat" color="success" className="cursor-default">
            No
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
