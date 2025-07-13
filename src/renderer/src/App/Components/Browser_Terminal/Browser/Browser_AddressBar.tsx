import {isEmpty, isNil} from 'lodash';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {formatWebAddress} from '../../../../../../cross/CrossUtils';
import {Star_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons';
import {cardsActions} from '../../../Redux/Reducer/CardsReducer';
import {useTabsState} from '../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../Redux/Store';
import rendererIpc from '../../../RendererIpc';
import {RunningCard} from '../../../Utils/Types';

type Props = {runningCard: RunningCard; setCustomAddress?: (address: string) => void};

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

  const protocol = matches[1] || '';
  const www = matches[2] || '';
  const domain = matches[3] || '';
  const rest = matches[4] || '';

  const prefix = `${protocol}${www}`;

  return {prefix, domain, rest};
};

export default function Browser_AddressBar({runningCard, setCustomAddress}: Props) {
  const [inputValue, setInputValue] = useState('');
  const [isAddress, setIsAddress] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const isProgrammaticSelection = useRef(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const getFavorites = () => {
    rendererIpc.storage.get('browser').then(result => {
      setFavorites(result.favoriteAddress);
    });
  };

  useEffect(() => {
    getFavorites();
  }, []);

  useEffect(() => {
    const {webUIAddress, customAddress, currentAddress} = runningCard;
    setIsAddress(!!webUIAddress || !!customAddress || !!currentAddress);
    const address = currentAddress || customAddress || webUIAddress || '';
    setInputValue(address);
  }, [runningCard]);

  useEffect(() => {
    if (editableRef.current && inputValue !== editableRef.current.textContent) {
      editableRef.current.textContent = inputValue;
    }
  }, [inputValue]);

  useEffect(() => {
    if (runningCard.tabId !== activeTab && runningCard.currentView !== 'browser') return;

    const ref = editableRef.current;
    if (isNil(ref)) return;

    if (isEmpty(inputValue) && isEmpty(runningCard.currentAddress)) ref.focus();
  }, [activeTab, runningCard.currentView]);

  const handleFocus = () => {
    setIsFocused(true);
    isProgrammaticSelection.current = true;

    setTimeout(() => {
      if (document.activeElement === editableRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editableRef.current!);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleMouseDown = () => {
    if (isFocused) {
      isProgrammaticSelection.current = false;
    }
    return true;
  };

  const handleMouseUp = () => {
    if (isProgrammaticSelection.current) {
      isProgrammaticSelection.current = false;
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setInputValue(e.currentTarget.textContent || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      try {
        const url = formatWebAddress(inputValue || '');
        if (setCustomAddress) {
          setCustomAddress(url);
        } else {
          dispatch(cardsActions.setRunningCardCustomAddress({tabId: activeTab, address: url}));
        }
        rendererIpc.storageUtils.addBrowserRecent(url);
        rendererIpc.storageUtils.addBrowserHistory(url);
        editableRef.current?.blur();
      } catch (err) {
        console.error(`Invalid URL: ${err}`);
      }
    }
  };

  const isFavorite = useMemo(() => {
    const {webUIAddress, customAddress, currentAddress} = runningCard;

    const address = currentAddress || customAddress || webUIAddress || '';
    return favorites.some(favorite => formatWebAddress(favorite) === formatWebAddress(address));
  }, [favorites, runningCard]);

  const updateFavorite = () => {
    const url = formatWebAddress(inputValue || '');
    if (isFavorite) {
      rendererIpc.storageUtils.removeBrowserFavorite(url);
    } else {
      rendererIpc.storageUtils.addBrowserFavorite(formatWebAddress(inputValue || ''));
    }
    getFavorites();
  };

  const {prefix, domain, rest} = parseAddressForDisplay(inputValue);

  return (
    <div
      className="relative flex items-center w-full h-8 mx-2 overflow-hidden rounded-full
    bg-[#f1f3f4] dark:bg-[#181818] hover:dark:bg-[#151515] focus-within:dark:bg-[#121212] transition-colors">
      {isAddress && (
        <div onClick={updateFavorite} className="absolute right-3 z-10 cursor-pointer">
          <Star_Icon
            className={`${isFavorite ? 'text-yellow-400' : 'text-foreground-200'} transition-colors duration-500`}
          />
        </div>
      )}
      {/* Styled Display View: Fades out when the input is focused */}
      <div
        className={`absolute flex items-center px-4 pointer-events-none transition-opacity duration-200 ${
          isFocused ? 'opacity-0' : 'opacity-100'
        }  inset-0 !right-4`}>
        {inputValue && (
          <p className="text-sm truncate">
            <span className="text-gray-500 dark:text-gray-400">{prefix}</span>
            <span className="text-black dark:text-white font-medium">{domain}</span>
            <span className="text-gray-500 dark:text-gray-400">{rest}</span>
          </p>
        )}
        {!inputValue && <p className="text-sm text-gray-500 dark:text-gray-400">Type here to start browsing...</p>}
      </div>

      {/* Editable Input Layer */}
      <div
        style={{
          minHeight: '32px',
          lineHeight: '32px',
          verticalAlign: 'middle',
        }}
        className={
          `size-full px-4 flex items-center text-sm truncate outline-none` +
          ` bg-transparent ${isFocused ? 'opacity-100' : 'opacity-0'}`
        }
        ref={editableRef}
        spellCheck="false"
        onBlur={handleBlur}
        onFocus={handleFocus}
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        contentEditable
      />
    </div>
  );
}
