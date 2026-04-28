import {formatWebAddress} from '@lynx_common/utils';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import {isEmpty} from 'lodash-es';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {cardsActions} from '../../../../redux/reducers/cards';
import {useTabsState} from '../../../../redux/reducers/tabs';
import {triggerActions} from '../../../../redux/reducers/triggers';
import {AppDispatch} from '../../../../redux/store';
import {RunningCard} from '../../../../types';
import {invalidateHistoryCache} from '../../browser/utils';

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

type UseAddressBarProps = {
  runningCard: RunningCard;
  setCustomAddress?: (address: string) => void;
};

export const useAddressBar = ({runningCard, setCustomAddress}: UseAddressBarProps) => {
  const {id: cardId, tabId, webUIAddress, customAddress, currentAddress, currentView} = runningCard;

  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [historyUrls, setHistoryUrls] = useState<string[]>([]);
  const [autocomplete, setAutocomplete] = useState('');
  const editableRef = useRef<HTMLDivElement>(null);

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const effectiveAddress = useMemo(() => {
    const addr = currentAddress || customAddress || webUIAddress || '';
    // Don't show "about:blank" in the address bar
    return addr === 'about:blank' ? '' : addr;
  }, [currentAddress, customAddress, webUIAddress]);

  useEffect(() => {
    const fetchBrowserData = async () => {
      const {favoriteAddress, historyAddress, recentAddress} = await storageUtilsIpc.invoke.getBrowserHistoryData();
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
    const {favoriteAddress} = await storageUtilsIpc.invoke.getBrowserHistoryData();
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
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(plainText));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event to update state
    editableRef.current?.dispatchEvent(new Event('input', {bubbles: true}));
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
          storageUtilsIpc.send.addBrowserRecent(url);
          // History is now tracked in main process on navigation events
          editableRef.current?.blur();
          // Don't call reload() here - the useEffect in browser/index.tsx will handle loading the URL
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
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = formatWebAddress(effectiveAddress || '');
      if (!url) return;

      const action = isFavorite ? storageUtilsIpc.send.removeBrowserFavorite : storageUtilsIpc.send.addBrowserFavorite;

      invalidateHistoryCache();
      dispatch(triggerActions.trigger('reloadBrowserHomePage'));

      action(url);
      getFavorites();
    },
    [effectiveAddress, isFavorite, getFavorites],
  );

  const isAddress = !!effectiveAddress;
  const displayParts = useMemo(
    () => parseAddressForDisplay(isFocused ? inputValue : effectiveAddress),
    [isFocused, inputValue, effectiveAddress],
  );

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
