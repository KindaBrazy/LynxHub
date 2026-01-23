import {Button, Input, Kbd, Popover, PopoverContent, PopoverTrigger, Tooltip} from '@heroui/react';
import {AltArrow_Icon, Magnifier_Icon} from '@lynx_assets/icons';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {SearchAddon} from '@xterm/addon-search';
import {KeyboardEvent, memo, useCallback, useEffect, useState} from 'react';

import useHotkeyPress from '../../../../hooks/hotkeys';
import {useIsActiveTab} from '../../../../layouts/tabs/utils';
import {useHotkeysState} from '../../../../redux/reducers/hotkeys';
import {formatHotkey} from '../../../../utils';

type Props = {searchAddon: SearchAddon; tabId: string};

const SearchText = memo(({searchAddon, tabId}: Props) => {
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
  }, [isOpen]);

  const onInputKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        searchAddon.findNext(searchText);
      } else if (e.code === 'ArrowUp') {
        searchAddon.findPrevious(searchText);
      }
    },
    [searchText],
  );

  useHotkeyPress([
    {
      name: Hotkey_Names.findInPage,
      method: isActiveTab ? () => setIsOpen(true) : null,
    },
  ]);

  const onInputValueChange = useCallback((value: string) => {
    searchAddon.findNext(value);
    setSearchText(value);
  }, []);

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
            <Button size="sm" variant="light" isIconOnly>
              <Magnifier_Icon className="size-3.5" />
            </Button>
          </PopoverTrigger>
        </div>
      </Tooltip>

      <PopoverContent className="border border-foreground-100 bg-foreground-50/80">
        <div className="flex flex-row px-1 py-2 gap-x-1.5 items-center">
          <Input
            size="sm"
            value={searchText}
            onKeyUp={onInputKeyUp}
            placeholder="Search for..."
            onValueChange={onInputValueChange}
            autoFocus
          />
          <Button size="sm" variant="light" isIconOnly>
            <AltArrow_Icon className="size-3.5" />
          </Button>
          <Button size="sm" variant="light" isIconOnly>
            <AltArrow_Icon className="size-3.5 rotate-180" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default SearchText;
