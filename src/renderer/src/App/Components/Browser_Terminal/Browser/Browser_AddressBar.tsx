import {cn} from '@heroui/react';
import {motion} from 'framer-motion';
import {isEmpty} from 'lodash';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {formatWebAddress} from '../../../../../../cross/CrossUtils';
import {Star_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';

type Props = {
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
};

const findAutocomplete = (input: string, historyUrls: string[]): string => {
  if (!input || input.length < 2) return '';

  const lowerInput = input.toLowerCase();

  // Find the first URL that starts with the input (case-insensitive)
  for (const url of historyUrls) {
    const lowerUrl = url.toLowerCase();

    // Check if URL starts with input
    if (lowerUrl.startsWith(lowerInput)) {
      return url.slice(input.length);
    }

    // Check without protocol (http://, https://)
    const withoutProtocol = lowerUrl.replace(/^https?:\/\//, '');
    const inputWithoutProtocol = lowerInput.replace(/^https?:\/\//, '');

    if (withoutProtocol.startsWith(inputWithoutProtocol)) {
      const originalWithoutProtocol = url.replace(/^https?:\/\//, '');
      return originalWithoutProtocol.slice(inputWithoutProtocol.length);
    }

    // Check without www.
    const withoutWww = withoutProtocol.replace(/^www\./, '');
    const inputWithoutWww = inputWithoutProtocol.replace(/^www\./, '');

    if (withoutWww.startsWith(inputWithoutWww)) {
      const originalWithoutWww = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
      return originalWithoutWww.slice(inputWithoutWww.length);
    }
  }

  return '';
};

const parseAddressForDisplay = (address: string) => {
  if (!address) {
    return {prefix: '', domain: '', rest: ''};
  }
  const addressRegex = /^(https?:\/\/)?(www\.)?([^/?#]+)(.*)/i;
  const matches = address.match(addressRegex);

  if (!matches) {
    const mainPartRegex = /^[^/]+/i;
    const mainPartMatch = address.match(mainPartRegex);
    const domain = mainPartMatch ? mainPartMatch[0] : address;
    const rest = address.substring(domain.length);
    return {prefix: '', domain, rest};
  }

  const [, protocol = '', www = '', domain = '', rest = ''] = matches;
  const prefix = `${protocol}${www}`;

  return {prefix, domain, rest};
};

const useAddressBar = ({runningCard, setCustomAddress}: Props) => {
  const {id: cardId, tabId, webUIAddress, customAddress, currentAddress, currentView} = runningCard;

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [historyUrls, setHistoryUrls] = useState<string[]>([]);
  const [autocomplete, setAutocomplete] = useState('');
  const editableRef = useRef<HTMLDivElement>(null);

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const effectiveAddress = useMemo(
    () => currentAddress || customAddress || webUIAddress || '',
    [currentAddress, customAddress, webUIAddress],
  );

  useEffect(() => {
    const fetchBrowserData = async () => {
      const {favoriteAddress, historyAddress, recentAddress} = await rendererIpc.storageUtils.getBrowserHistoryData();
      setFavorites(favoriteAddress);
      // Combine and dedupe: recent first, then history, then favorites
      const combined = [...new Set([...recentAddress, ...historyAddress, ...favoriteAddress])];
      setHistoryUrls(combined);
    };
    fetchBrowserData();
  }, []);

  useEffect(() => {
    let displayValue = effectiveAddress;
    if (effectiveAddress.includes('error_page.html?errorCode')) {
      displayValue = 'Error loading target address...';
    }
    setInputValue(displayValue);

    if (editableRef.current && document.activeElement !== editableRef.current) {
      editableRef.current.textContent = displayValue;
    }
  }, [effectiveAddress]);

  useEffect(() => {
    if (tabId === activeTab && currentView === 'browser' && isEmpty(effectiveAddress)) {
      editableRef.current?.focus();
    }
  }, [activeTab, tabId, currentView, effectiveAddress]);

  const getFavorites = useCallback(async () => {
    const {favoriteAddress} = await rendererIpc.storageUtils.getBrowserHistoryData();
    setFavorites(favoriteAddress);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (document.activeElement !== e.currentTarget) {
      e.preventDefault();
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    requestAnimationFrame(() => {
      const element = editableRef.current;
      if (element) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    });
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setAutocomplete('');
    if (inputValue !== effectiveAddress) {
      setInputValue(effectiveAddress);
      if (editableRef.current) {
        editableRef.current.textContent = effectiveAddress;
      }
    }
  }, [inputValue, effectiveAddress]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent || '';
      setInputValue(text);
      setAutocomplete(findAutocomplete(text, historyUrls));
    },
    [historyUrls],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, plainText);
  }, []);

  const acceptAutocomplete = useCallback(() => {
    if (autocomplete && editableRef.current) {
      const newValue = inputValue + autocomplete;
      editableRef.current.textContent = newValue;
      setInputValue(newValue);
      setAutocomplete('');

      // Move cursor to end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [autocomplete, inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Accept autocomplete with Tab or Right Arrow (when at end of input)
      if (autocomplete && (e.key === 'Tab' || e.key === 'ArrowRight')) {
        const selection = window.getSelection();
        const isAtEnd = selection?.focusOffset === inputValue.length;

        if (e.key === 'Tab' || isAtEnd) {
          e.preventDefault();
          acceptAutocomplete();
          return;
        }
      }

      if (e.key === 'Escape') {
        setAutocomplete('');
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const textValue = autocomplete ? inputValue + autocomplete : e.currentTarget.textContent || '';
        setAutocomplete('');
        try {
          const url = formatWebAddress(textValue, true);
          if (setCustomAddress) {
            setCustomAddress(url);
          } else {
            dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: url}));
          }
          rendererIpc.storageUtils.addBrowserRecent(url);
          // History is now tracked in main process on navigation events
          editableRef.current?.blur();
          rendererIpc.browser.reload(cardId);
        } catch (err) {
          console.error(`Invalid URL: ${err}`);
        }
      }
    },
    [setCustomAddress, dispatch, activeTab, cardId, autocomplete, inputValue, acceptAutocomplete],
  );

  const handleContainerClick = useCallback(() => {
    if (document.activeElement !== editableRef.current) {
      editableRef.current?.focus();
    }
  }, []);

  const isFavorite = useMemo(() => {
    if (!effectiveAddress) return false;
    const formattedCurrentAddress = formatWebAddress(effectiveAddress);
    return favorites.some(fav => formatWebAddress(fav) === formattedCurrentAddress);
  }, [favorites, effectiveAddress]);

  const handleFavoriteToggle = useCallback(
    e => {
      e.stopPropagation();
      const url = formatWebAddress(effectiveAddress || '');
      if (!url) return;

      const action = isFavorite
        ? rendererIpc.storageUtils.removeBrowserFavorite
        : rendererIpc.storageUtils.addBrowserFavorite;

      action(url);
      getFavorites();
    },
    [effectiveAddress, isFavorite, getFavorites],
  );

  const isAddress = !!effectiveAddress;
  const displayParts = parseAddressForDisplay(isFocused ? inputValue : effectiveAddress);

  return {
    editableRef,
    isAddress,
    isFocused,
    isFavorite,
    displayParts,
    autocomplete,
    inputValue,
    handleMouseDown,
    handleFocus,
    handleBlur,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFavoriteToggle,
    handleContainerClick,
  };
};

const Browser_AddressBar = memo(({runningCard, setCustomAddress}: Props) => {
  const {
    editableRef,
    isAddress,
    isFocused,
    isFavorite,
    displayParts,
    autocomplete,
    inputValue,
    handleMouseDown,
    handleFocus,
    handleBlur,
    handleInput,
    handleKeyDown,
    handlePaste,
    handleFavoriteToggle,
    handleContainerClick,
  } = useAddressBar({runningCard, setCustomAddress});

  const {prefix, domain, rest} = displayParts;

  return (
    <div
      className={cn(
        'relative flex items-center w-full h-8 mx-2 overflow-hidden rounded-full',
        'bg-[#f1f3f4] dark:bg-[#101010] hover:dark:bg-[#151515] focus-within:dark:bg-[#121212]',
        'transition-colors cursor-text',
      )}
      onClick={handleContainerClick}>
      {/* Layer 1: Styled Display View (Visible when not focused) */}
      <div
        className={cn(
          'absolute inset-0 flex items-center px-4 pointer-events-none transition-opacity duration-200',
          '!right-10',
          isFocused ? 'opacity-0' : 'opacity-100',
        )}>
        {isAddress ? (
          <p className="text-sm truncate">
            <span className="text-gray-500 dark:text-gray-400">{prefix}</span>
            <span className="text-black dark:text-white font-medium">{domain}</span>
            <span className="text-gray-500 dark:text-gray-400">{rest}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Type here to start browsing...</p>
        )}
      </div>

      {/* Layer 2: Editable Input with Autocomplete */}
      <div className="relative size-full">
        <div
          className={cn(
            'size-full px-4 text-sm truncate outline-none bg-transparent',
            'text-black dark:text-white',
            isFocused ? 'opacity-100' : 'opacity-0',
          )}
          ref={editableRef}
          spellCheck="false"
          onBlur={handleBlur}
          onFocus={handleFocus}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          style={{minHeight: '32px', lineHeight: '32px'}}
          contentEditable
        />
        {/* Autocomplete suggestion overlay */}
        {isFocused && autocomplete && (
          <div
            style={{minHeight: '32px', lineHeight: '32px'}}
            className="absolute inset-0 px-4 text-sm pointer-events-none truncate">
            <span className="invisible">{inputValue}</span>
            <span className="text-gray-400 dark:text-gray-500">{autocomplete}</span>
          </div>
        )}
      </div>

      {isAddress && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <motion.button
            whileTap={{scale: 0.9}}
            whileHover={{scale: 1.15}}
            onClick={handleFavoriteToggle}
            className="p-1 rounded-full cursor-pointer"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
            <Star_Icon
              className={cn(
                'transition-colors duration-200 size-5',
                isFavorite
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white',
              )}
            />
          </motion.button>
        </div>
      )}
    </div>
  );
});

export default Browser_AddressBar;
