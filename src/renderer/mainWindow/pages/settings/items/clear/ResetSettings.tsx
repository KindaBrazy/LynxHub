import {Button, ButtonGroup, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import storageIpc from '@lynx_shared/ipc/storage';
import {Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {useState} from 'react';

import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export default function ResetSettings() {
  const [isClearSettingsOpen, setIsClearSettingsOpen] = useState<boolean>(false);

  const reset = () => {
    storageIpc.clear();
    setIsClearSettingsOpen(false);
  };

  const cancel = () => {
    setIsClearSettingsOpen(false);
  };

  return (
    <Popover
      size="sm"
      shadow="sm"
      isOpen={isClearSettingsOpen}
      onOpenChange={setIsClearSettingsOpen}
      classNames={{base: 'before:bg-foreground-100'}}
      showArrow>
      <PopoverTrigger>
        <Button variant="flat" color="danger" startContent={<Refresh />} fullWidth>
          <SettingsSearchHighlight text="Reset Settings (Restart Required)" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
        <span className="font-bold w-full text-sm">
          <SettingsSearchHighlight text="Reset Settings" />
        </span>
        <span>
          <SettingsSearchHighlight text="Are you sure you want to reset all app settings and restart?" />
        </span>
        <ButtonGroup className="flex flex-row w-full mt-2" fullWidth>
          <Button size="sm" color="danger" onPress={reset} startContent={<Refresh />}>
            Reset & Restart
          </Button>
          <Button size="sm" onPress={cancel} className="cursor-default">
            Cancel
          </Button>
        </ButtonGroup>
      </PopoverContent>
    </Popover>
  );
}
