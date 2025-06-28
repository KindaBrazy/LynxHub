import React, {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {formatWebAddress} from '../../../../../../cross/CrossUtils';
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
  const [isFocused, setIsFocused] = useState(false);
  const editableRef = useRef<HTMLDivElement>(null);
  const isProgrammaticSelection = useRef(false);

  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const {webUIAddress, customAddress, currentAddress} = runningCard;
    const address = currentAddress || customAddress || webUIAddress || '';
    setInputValue(address);
  }, [runningCard]);

  useEffect(() => {
    if (editableRef.current && inputValue !== editableRef.current.textContent) {
      editableRef.current.textContent = inputValue;
    }
  }, [inputValue]);

  useEffect(() => {
    const shouldAutoFocus = !inputValue && editableRef.current;

    if (shouldAutoFocus) {
      setTimeout(() => {
        editableRef.current?.focus();
      }, 0);
    }
  }, [inputValue]);

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
        rendererIpc.storageUtils.addBrowserRecent({url, favIcon: ''});
        editableRef.current?.blur();
      } catch (err) {
        console.error(`Invalid URL: ${err}`);
      }
    }
  };

  const {prefix, domain, rest} = parseAddressForDisplay(inputValue);

  return (
    <div
      className="relative flex items-center w-full h-8 mx-2 overflow-hidden rounded-full
    bg-[#f1f3f4] dark:bg-[#181818] hover:dark:bg-[#151515] focus-within:dark:bg-[#121212] transition-colors">
      {/* Styled Display View: Fades out when the input is focused */}
      <div
        className={`absolute inset-0 flex items-center px-4 pointer-events-none transition-opacity duration-200 ${
          isFocused ? 'opacity-0' : 'opacity-100'
        }`}>
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
