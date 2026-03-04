import {Button, Input, Kbd, Popover, PopoverContent, PopoverTrigger, Switch, Tooltip} from '@heroui/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useIsActiveTab} from '@lynx/layouts/tabs/utils';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {formatHotkey} from '@lynx/utils';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {AltArrowDown, AltArrowUp, Magnifier} from '@solar-icons/react-perf/BoldDuotone';
import {ISearchOptions, SearchAddon} from '@xterm/addon-search';
import {AnimatePresence, motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import {X} from 'lucide-react';
import {KeyboardEvent, memo, useCallback, useEffect, useMemo, useState} from 'react';

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

  const [foundAny, setFoundAny] = useState<boolean>(false);

  const [enabledRegex, setEnabledRegex] = useState<boolean>(false);
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [matchWord, setMatchWord] = useState<boolean>(false);

  const searchOptions: ISearchOptions = useMemo(
    () => ({caseSensitive: matchCase, regex: enabledRegex, wholeWord: matchWord}),
    [enabledRegex, matchCase, matchWord],
  );

  useEffect(() => {
    return () => {
      setSearchText('');
      searchAddon.clearDecorations();
      searchAddon.dispose();
    };
  }, [isOpen, searchAddon]);

  const findNext = useCallback(() => {
    const isFound = searchAddon.findNext(searchText, searchOptions);
    setFoundAny(isFound);
  }, [searchAddon, searchText, searchOptions]);
  const findPrev = useCallback(() => {
    const isFound = searchAddon.findPrevious(searchText, searchOptions);
    setFoundAny(isFound);
  }, [searchAddon, searchText, searchOptions]);

  useEffect(() => {
    if (searchText) findNext();
  }, [findNext]);

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
      searchAddon.findNext(value, searchOptions);
      setSearchText(value);
    },
    [searchAddon, searchOptions],
  );

  const clear = () => {
    setSearchText('');
    searchAddon.findNext('');
    searchAddon.clearDecorations();
    setFoundAny(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      className="w-65"
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

      <PopoverContent className="border border-foreground-100 bg-content1/90 p-3 gap-y-4">
        <Input
          spellCheck="false"
          value={searchText}
          onKeyUp={onInputKeyUp}
          placeholder="Search for..."
          onValueChange={onInputValueChange}
          autoFocus
        />

        <AnimatePresence>
          {searchText && !foundAny && (
            <motion.div
              aria-live="polite"
              transition={{duration: 0.1}}
              exit={{translateY: 5, opacity: 0}}
              initial={{translateY: 5, opacity: 0}}
              animate={{translateY: 0, opacity: 1}}
              className="flex items-center justify-center rounded-lg bg-foreground-100 py-2 w-full">
              <span role="alert" className="text-sm text-danger">
                No matches found
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-x-2">
          <Button
            size="sm"
            variant="flat"
            className="w-23"
            onPress={findNext}
            startContent={<AltArrowDown className="size-4 shrink-0" />}>
            Next
          </Button>
          <Button
            size="sm"
            variant="flat"
            className="w-23"
            onPress={findPrev}
            startContent={<AltArrowUp className="size-4 shrink-0" />}>
            Previous
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={clear}
            isDisabled={isEmpty(searchText)}
            aria-label="Clear search (Escape)"
            isIconOnly>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col w-full gap-y-2">
          <Switch size="sm" isSelected={enabledRegex} onValueChange={setEnabledRegex}>
            Regex
          </Switch>
          <Switch size="sm" isSelected={matchCase} onValueChange={setMatchCase}>
            Match Case
          </Switch>
          <Switch size="sm" isSelected={matchWord} onValueChange={setMatchWord}>
            Match whole word
          </Switch>
        </div>
      </PopoverContent>
    </Popover>
  );
});

TerminalSearchText.displayName = 'TerminalSearchText';

export default TerminalSearchText;
