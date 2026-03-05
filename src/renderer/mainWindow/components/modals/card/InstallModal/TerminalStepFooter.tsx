import {Button, Popover, PopoverContent, PopoverTrigger} from '@heroui/react';
import ptyIpc from '@lynx_shared/ipc/pty';
import {ArrowRight, Restart} from '@solar-icons/react-perf/BoldDuotone';
import {CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {X} from 'lucide-react';
import {RefObject, useEffect, useState} from 'react';

import {XTermAPI} from '../../../useXTerm';

export interface FooterTerminalProps {
  /** A ref containing a function to trigger a terminal restart. */
  restartTerminal: RefObject<(() => void) | null>;
  /** Callback fired when the user successfully confirms the terminal commands finished. */
  onDoneTerminal: () => void;
  cardID: string;
  xtermRef: RefObject<XTermAPI | null>;
}

/**
 * Renders the footer specifically for the terminal step in the installation modal.
 * Includes interactive popovers to verify if commands completed successfully or if a restart is needed.
 *
 * @param {FooterTerminalProps} props - The component props.
 */
export default function FooterTerminal({restartTerminal, onDoneTerminal, cardID, xtermRef}: FooterTerminalProps) {
  const [isRestartOpen, setIsRestartOpen] = useState<boolean>(false);
  const [isNextOpen, setIsNextOpen] = useState<boolean>(false);

  const [isRestartingState, setIsRestartingState] = useState<boolean>(false);

  useEffect(() => {
    const offExit = ptyIpc.onExit(id => {
      if (isRestartingState) {
        setIsRestartingState(false);
      } else if (id === cardID) {
        setIsNextOpen(true);
      }
    });
    return () => offExit();
  }, [cardID, isRestartingState]);

  const handleRestart = () => {
    restartTerminal.current?.();
    if (xtermRef.current) {
      xtermRef.current.terminal.clear();
    }
    setIsRestartingState(true);
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
        <PopoverContent className="max-w-xs gap-y-2 p-4 border border-foreground-100">
          <span className="w-full text-sm font-bold">Confirm Terminal Restart</span>
          <span>Are you sure you want to restart the terminal and run commands again?</span>
          <div className="mt-2 flex w-full flex-row">
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
        <PopoverContent className="border border-foreground-100 gap-y-2 p-4">
          <span className="w-full text-sm font-bold">Installation complete?</span>
          <span>Please confirm that all commands finished successfully without any errors.</span>
          <div className="mt-2 flex w-full flex-row">
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
