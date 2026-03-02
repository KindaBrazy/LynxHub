import {Button, Input, Kbd, Popover, PopoverContent, PopoverTrigger, Tooltip} from '@heroui/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useIsActiveTab} from '@lynx/layouts/tabs/utils';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {formatHotkey} from '@lynx/utils';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Bold';
import {Magnifier} from '@solar-icons/react-perf/BoldDuotone';
import {SearchAddon} from '@xterm/addon-search';
import {KeyboardEvent, memo, useCallback, useEffect, useState} from 'react';

type Props = {
  /**
   * The search addon for xterm.js.
   */
  searchAddon: SearchAddon;
  /**
   * The ID of the tab.
   */
  tabId: string;
};

/**
 * A search input for the terminal.
 */
const TerminalSearchText = memo(({searchAddon, tabId}: Props) => {
  const [searchText, setSearchText] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const hotkeys = useHotkeysState('hotkeys');
  const isActiveTab = useIsActiveTab(tabId);

  const findInPageHotkey = hotkeys.find(item => item.name === Hotkey_Names.findInPage) ?? null;
  const hotkeyLabel = formatHotkey(findInPageHotkey ?? null);
  const hasHotkey = hotkeyLabel !== 'Not Set';

  useEffect(() => {
    return () => {
      setSearchText('');
      searchAddon.clearActiveDecoration();
    };
  }, [isOpen, searchAddon]);

  const findNext = useCallback(() => {
    searchAddon.findNext(searchText);
  }, [searchAddon, searchText]);
  const findPrev = useCallback(() => {
    searchAddon.findPrevious(searchText);
  }, [searchAddon, searchText]);

  const onInputKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        findNext();
      } else if (e.code === 'ArrowUp') {
        findPrev();
      }
    },
    [findNext, findPrev],
  );

  useHotkeyPress([
    {
      name: Hotkey_Names.findInPage,
      method: isActiveTab ? () => setIsOpen(true) : null,
    },
  ]);

  const onInputValueChange = useCallback(
    (value: string) => {
      searchAddon.findNext(value);
      setSearchText(value);
    },
    [searchAddon],
  );

  return (
    <Popover
      isOpen={isOpen}
      placement="bottom-start"
      onOpenChange={setIsOpen}
      classNames={{base: 'before:bg-foreground-100'}}
      showArrow>
      <Tooltip
        content={
          hasHotkey ? (
            <div className="flex flex-row items-center gap-x-1">
              <span>Search for text</span>
              <Kbd className="text-[10px]">{hotkeyLabel}</Kbd>
            </div>
          ) : (
            'Search for text'
          )
        }
        delay={500}>
        <div className="max-w-fit">
          <PopoverTrigger>
            <Button size="sm" variant="light" aria-label="Search for text" isIconOnly>
              <Magnifier className="size-3.5" />
            </Button>
          </PopoverTrigger>
        </div>
      </Tooltip>

      <PopoverContent className="border border-foreground-100 bg-foreground-50/95">
        <div className="flex flex-row px-1 py-2 gap-x-1.5 items-center">
          <Input
            size="sm"
            spellCheck="false"
            value={searchText}
            onKeyUp={onInputKeyUp}
            placeholder="Search for..."
            onValueChange={onInputValueChange}
            autoFocus
            isClearable
          />
          <Button size="sm" variant="light" onPress={findNext} isIconOnly>
            <AltArrowDown className="size-3.5" />
          </Button>
          <Button size="sm" variant="light" onPress={findPrev} isIconOnly>
            <AltArrowUp className="size-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

TerminalSearchText.displayName = 'TerminalSearchText';

export default TerminalSearchText;
