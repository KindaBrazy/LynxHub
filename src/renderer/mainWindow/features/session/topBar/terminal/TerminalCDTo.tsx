import {Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Tooltip} from '@heroui/react';
import {terminalLineEnding} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import ptyIpc from '@lynx_shared/ipc/pty';
import storageIpc from '@lynx_shared/ipc/storage';
import {Broom, FolderOpen, MoveToFolder, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {memo, useCallback, useEffect, useState} from 'react';

import {topToast} from '../../../../layouts/ToastProviders';

type Props = {
  /**
   * The ID of the terminal/card.
   */
  id: string;
};

/**
 * A button to change the terminal directory (cd).
 */
const TerminalCDTo = memo(({id}: Props) => {
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const cdTo = useCallback(
    (dir: string) => {
      setIsOpen(false);
      const newHistory = [dir, ...history.filter(item => item !== dir)];

      storageIpc.update('terminal', {cdHistory: newHistory});
      setHistory(newHistory);

      ptyIpc.write(id, `cd "${dir}"${terminalLineEnding}`);
    },
    [history, id],
  );

  const removeFromHistory = useCallback(
    (dir: string) => {
      const newHistory = history.filter(item => item !== dir);

      storageIpc.update('terminal', {cdHistory: newHistory});
      setHistory(newHistory);
    },
    [history],
  );

  const clearHistory = useCallback(() => {
    storageIpc.update('terminal', {cdHistory: []});
    setHistory([]);
  }, []);

  const selectDir = useCallback(() => {
    setIsOpen(false);
    filesIpc
      .openDlg({properties: ['openDirectory']})
      .then(dir => {
        if (dir) {
          cdTo(dir);
        } else {
          topToast.warning('No directory selected');
        }
      })
      .catch(e => {
        console.error(e);
        topToast.danger('Error opening directory');
      });
  }, [id, cdTo]);

  useEffect(() => {
    storageIpc.get('terminal').then(({cdHistory}) => {
      if (!isEmpty(cdHistory)) setHistory(cdHistory);
    });
  }, []);

  return (
    <Popover
      classNames={{
        base: 'before:bg-foreground-100',
        content: 'p-0 bg-foreground-50',
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-start"
      showArrow>
      <Tooltip delay={500} content="Change terminal directory (cd)">
        <div className="max-w-fit">
          <PopoverTrigger>
            <Button size="sm" variant="light" aria-label="Change Directory" isIconOnly>
              <MoveToFolder className="size-3.5" />
            </Button>
          </PopoverTrigger>
        </div>
      </Tooltip>
      <PopoverContent className="w-[320px]">
        <div className="flex w-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold text-foreground-700">Change Directory</h3>
            {!isEmpty(history) && (
              <Button size="sm" variant="light" onPress={clearHistory} className="text-danger" isIconOnly>
                <Broom className="size-3" />
              </Button>
            )}
          </div>

          {/* Choose folder button */}
          <Button
            radius="none"
            variant="flat"
            onPress={selectDir}
            className="justify-start"
            startContent={<FolderOpen className="size-3.5" />}>
            Choose folder…
          </Button>

          {/* History list */}
          {isEmpty(history) ? (
            <div className="flex flex-col items-center gap-1.5 py-6 text-center">
              <MoveToFolder className="size-6 text-foreground-400" />
              <p className="text-xs text-foreground-500">No recent directories</p>
            </div>
          ) : (
            <ScrollShadow className="max-h-50">
              <div className="flex flex-col p-1.5">
                {history.map(item => (
                  <Button
                    key={item}
                    variant="light"
                    className="group"
                    onPress={() => cdTo(item)}
                    startContent={<MoveToFolder className="size-3.5 shrink-0 text-foreground-500" />}>
                    <div
                      className={
                        'min-w-0 flex-1 truncate text-left text-xs text-foreground-700 hover:text-foreground-900'
                      }>
                      {item}
                    </div>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => removeFromHistory(item)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      isIconOnly>
                      <TrashBin2 className="size-3" />
                    </Button>
                  </Button>
                ))}
              </div>
            </ScrollShadow>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

TerminalCDTo.displayName = 'TerminalCDTo';

export default TerminalCDTo;
