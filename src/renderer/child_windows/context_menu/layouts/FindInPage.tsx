import {Button, Input} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import {Circle_Icon} from '@lynx_assets/icons';
import {AltArrowDown, AltArrowUp} from '@solar-icons/react-perf/Linear';
import {isEmpty} from 'lodash';
import {X} from 'lucide-react';
import {type KeyboardEvent, memo, useEffect, useRef, useState} from 'react';

import {MenuTypes} from '../consts';
import {CommonProps} from '../types';

const FindInPage = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchValue) {
      rendererIpc.browser.findInPage(id, searchValue, {findNext: true});
    } else {
      rendererIpc.browser.stopFindInPage(id, 'clearSelection');
    }
  }, [searchValue]);

  const next = () => {
    rendererIpc.browser.findInPage(id, searchValue, {findNext: false, forward: true});
  };
  const back = () => {
    rendererIpc.browser.findInPage(id, searchValue, {findNext: false, forward: false});
  };
  const clear = () => {
    setSearchValue('');
    rendererIpc.browser.stopFindInPage(id, 'clearSelection');
    // Refocus input after clearing
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => inputRef?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isEmpty(searchValue)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      back();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
      rendererIpc.contextMenu.hideWindow();
    }
  };

  // Clear search when window closes
  useEffect(() => {
    const handleWindowBlur = () => {
      setSearchValue(currentValue => {
        if (currentValue) {
          rendererIpc.browser.stopFindInPage(id, 'clearSelection');
        }
        return '';
      });
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [id]);

  useEffect(() => {
    const offFind = rendererIpc.contextMenu.onFind((_, webID) => {
      setId(webID);

      setWidthSize('md');
      setSelectedLayout(MenuTypes.FindInPage);

      rendererIpc.contextMenu.showWindow();
    });

    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      offFind();
    };
  }, []);

  if (!show) return null;

  return (
    <div className="flex w-full flex-row items-end gap-x-2 p-3">
      <Input
        ref={setInputRef}
        value={searchValue}
        onKeyDown={handleKeyDown}
        placeholder="Type to find..."
        startContent={<Circle_Icon />}
        onValueChange={setSearchValue}
        autoFocus
      />
      <div className="mb-1 flex flex-row gap-x-1">
        <Button size="sm" onPress={back} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
          <AltArrowUp className="size-4" />
        </Button>
        <Button size="sm" onPress={next} variant="light" isDisabled={isEmpty(searchValue)} isIconOnly>
          <AltArrowDown className="size-4" />
        </Button>
        <Button size="sm" variant="light" onPress={clear} isDisabled={isEmpty(searchValue)} isIconOnly>
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
});

export default FindInPage;
