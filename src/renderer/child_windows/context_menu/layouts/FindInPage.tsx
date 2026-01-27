import {Button, Chip, Input} from '@heroui/react';
import {Circle_Icon} from '@lynx_assets/icons';
import browserIpc from '@lynx_shared/ipc/browser';
import {AltArrowDown, AltArrowUp, MinimalisticMagnifer} from '@solar-icons/react-perf/BoldDuotone';
import {isEmpty} from 'lodash';
import {X} from 'lucide-react';
import {type KeyboardEvent, memo, useEffect, useRef, useState} from 'react';

import {useContextState} from '../redux/reducer';
import {hideContextWindow} from './Shared';

type FindResult = {
  activeMatchOrdinal: number;
  matches: number;
  finalUpdate: boolean;
};

const FindInPage = memo(() => {
  const id = useContextState('targetID');
  const selectedText = useContextState('selectedText');
  const [searchValue, setSearchValue] = useState<string>('');
  const [result, setResult] = useState<FindResult | null>(null);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial search value from selected text
  useEffect(() => {
    if (selectedText) {
      setSearchValue(selectedText);
    }
  }, [selectedText]);

  useEffect(() => {
    if (searchValue) {
      browserIpc.send.findInPage(id, searchValue, {findNext: true});
    } else {
      browserIpc.send.stopFindInPage(id, 'clearSelection');
      setResult(null);
    }

    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => inputRef?.focus(), 0);
  }, [searchValue, id]);

  // Listen for find results from main process
  useEffect(() => {
    const unsubscribe = browserIpc.on.foundInPage(findResult => {
      if (findResult.finalUpdate) {
        setResult(findResult);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const next = () => {
    browserIpc.send.findInPage(id, searchValue, {findNext: false, forward: true});
  };

  const back = () => {
    browserIpc.send.findInPage(id, searchValue, {findNext: false, forward: false});
  };

  const clear = () => {
    setSearchValue('');
    setResult(null);
    browserIpc.send.stopFindInPage(id, 'clearSelection');
    // Refocus input after clearing
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => inputRef?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isEmpty(searchValue)) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        back();
      } else {
        next();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      back();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
      hideContextWindow();
    }
  };

  // Clear search when window closes
  useEffect(() => {
    const handleWindowBlur = () => {
      setSearchValue(currentValue => {
        if (currentValue) {
          browserIpc.send.stopFindInPage(id, 'clearSelection');
        }
        return '';
      });
      setResult(null);
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [id]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  const hasResults = result && result.matches > 0;
  const noResults = searchValue && result && result.matches === 0;

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MinimalisticMagnifer className="size-5 text-primary" />
          <span className="text-sm font-semibold text-foreground-800">Find in Page</span>
        </div>
        {hasResults && (
          <Chip size="sm" variant="flat" color="primary">
            {result.activeMatchOrdinal} of {result.matches}
          </Chip>
        )}
      </div>

      {/* Search Input */}
      <Input
        classNames={{
          input: 'text-sm',
          inputWrapper: noResults ? 'border-danger' : '',
        }}
        ref={setInputRef}
        value={searchValue}
        onKeyDown={handleKeyDown}
        onValueChange={setSearchValue}
        placeholder="Type to search..."
        startContent={<Circle_Icon className="text-foreground-500" />}
        autoFocus
      />

      {/* Status Message */}
      {searchValue && (
        <div className="flex items-center justify-center rounded-lg bg-foreground-100 py-2">
          {noResults ? (
            <span className="text-sm text-danger">No matches found</span>
          ) : hasResults ? (
            <span className="text-sm text-foreground-700">
              Match {result.activeMatchOrdinal} of {result.matches}
            </span>
          ) : (
            <span className="text-sm text-foreground-500">Searching...</span>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          onPress={back}
          className="flex-1"
          isDisabled={isEmpty(searchValue) || !hasResults}
          startContent={<AltArrowUp className="size-4" />}
          aria-label="Previous match (Shift+Enter or Up Arrow)">
          Previous
        </Button>
        <Button
          size="sm"
          variant="flat"
          onPress={next}
          className="flex-1"
          aria-label="Next match (Enter or Down Arrow)"
          isDisabled={isEmpty(searchValue) || !hasResults}
          startContent={<AltArrowDown className="size-4" />}>
          Next
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="danger"
          onPress={clear}
          isDisabled={isEmpty(searchValue)}
          aria-label="Clear search (Escape)"
          isIconOnly>
          <X className="size-4" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="flex flex-col gap-1 rounded-lg bg-foreground-50 p-2 text-tiny text-foreground-500">
        <div className="flex justify-between">
          <span>Next match:</span>
          <span className="font-medium text-foreground-700">Enter or ↓</span>
        </div>
        <div className="flex justify-between">
          <span>Previous match:</span>
          <span className="font-medium text-foreground-700">Shift+Enter or ↑</span>
        </div>
        <div className="flex justify-between">
          <span>Close:</span>
          <span className="font-medium text-foreground-700">Esc</span>
        </div>
      </div>
    </div>
  );
});

export default FindInPage;
