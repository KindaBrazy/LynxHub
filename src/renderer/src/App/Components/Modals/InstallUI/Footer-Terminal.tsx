import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {RefObject, useState} from 'react';

type Props = {restartTerminal: RefObject<(() => void) | null>; onDoneTerminal: () => void};

export default function FooterTerminal({restartTerminal, onDoneTerminal}: Props) {
  const [isRestartOpen, setIsRestartOpen] = useState<boolean>(false);
  const [isNextOpen, setIsNextOpen] = useState<boolean>(false);

  const handleRestart = () => {
    restartTerminal.current?.();
    setIsRestartOpen(false);
  };

  const foundError = () => {
    setIsNextOpen(false);
    setIsRestartOpen(true);
  };

  const next = () => {
    setIsNextOpen(false);
    onDoneTerminal();
  };

  return (
    <>
      <Popover
        size="sm"
        shadow="sm"
        isOpen={isRestartOpen}
        onOpenChange={setIsRestartOpen}
        classNames={{base: 'before:bg-foreground-100'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="warning" className="cursor-default">
            Restart Terminal
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">Confirm Terminal Restart</span>
          <span>Are you sure you want to restart the terminal?</span>
          <div className="flex flex-row w-full mt-2">
            <Button size="sm" variant="flat" className="cursor-default" onPress={() => setIsRestartOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="flat" color="warning" onPress={handleRestart}>
              Restart
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Popover
        size="sm"
        shadow="sm"
        isOpen={isNextOpen}
        className="max-w-80"
        onOpenChange={setIsNextOpen}
        classNames={{base: 'before:bg-foreground-100'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="success" className="cursor-default">
            Next
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">Installation complete?</span>
          <span>Please confirm that all commands finished successfully without any errors.</span>
          <div className="flex flex-row w-full mt-2">
            <Button size="sm" color="danger" variant="flat" onPress={foundError}>
              Found error
            </Button>
            <Button size="sm" variant="flat" onPress={next} color="success">
              All good
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
