import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import {ArrowRight, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {X} from 'lucide-react';
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
          <Button variant="flat" color="warning" startContent={<Restart className="size-4" />}>
            Restart Terminal
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 max-w-xs bg-foreground-100">
          <span className="font-bold w-full text-sm">Confirm Terminal Restart</span>
          <span>Are you sure you want to restart the terminal and run commands again?</span>
          <div className="flex flex-row w-full mt-2">
            <Button
              size="sm"
              variant="flat"
              onPress={() => setIsRestartOpen(false)}
              startContent={<X className="size-3.5" />}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="warning"
              onPress={handleRestart}
              startContent={<Restart className="size-3.5" />}>
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
          <Button variant="flat" color="success" endContent={<ArrowRight className="size-4" />}>
            Next
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">Installation complete?</span>
          <span>Please confirm that all commands finished successfully without any errors.</span>
          <div className="flex flex-row w-full mt-2">
            <Button
              size="sm"
              color="danger"
              variant="flat"
              onPress={foundError}
              startContent={<X className="size-3.5" />}>
              Found error
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={next}
              color="success"
              startContent={<CheckRead className="size-4" />}>
              All good
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
