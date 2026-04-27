import {Button, CloseButton, Tooltip} from '@heroui-v3/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {TabInfo} from '@lynx_common/types';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import AudioIndicator from './AudioIndicator';
import TabIcon from './Icon';
import ProgressBar from './ProgressBar';
import TabTitle from './Title';
import {useIsActiveTab, useRemoveTab} from './utils';

type Props = {
  tab: TabInfo;
  isOrdering: boolean;
};

/**
 * TODO like installer step progress use scroll detection to auto scroll to active tab
 */

/**
 * Component representing a single tab in the tab bar.
 * Handles selection, closing, and drag interactions.
 */
const TabItem = memo(({tab, isOrdering}: Props) => {
  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const isActiveTab = useIsActiveTab(tab.id);
  const runningCards = useCardsState('runningCard');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [isTruncated, setIsTruncated] = useState<boolean>(false);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const closeTabConfirm = useSettingsState('closeTabConfirm');

  const removeTab = useRemoveTab();

  const runningCard = useMemo(() => runningCards.find(card => card.tabId === tab.id), [runningCards, tab.id]);

  const handleRemove = useCallback(
    (isHotkey: boolean) => {
      const tabId = tab.id;

      if (runningCard) {
        if (runningCard.type === 'browser') {
          removeTab({tabId});
        } else {
          if ((isCtrlPressed && !isHotkey) || !closeTabConfirm) {
            removeTab({tabId});
          } else {
            const bounds = closeBtnRef.current?.getBoundingClientRect();
            if (bounds && isHotkey) {
              contextMenuIpc.send.openTerminateTab(tabId, {x: bounds.x, y: bounds.y});
            } else {
              contextMenuIpc.send.openTerminateTab(tabId);
            }
          }
        }
      } else {
        removeTab({tabId});
      }
    },
    [tab.id, runningCard, isCtrlPressed, closeTabConfirm, removeTab],
  );

  const handleAuxClick = useCallback(
    (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        handleRemove(false);
      }
    },
    [handleRemove],
  );

  useHotkeyPress([{name: Hotkey_Names.closeTab, method: isActiveTab ? () => handleRemove(true) : null}]);

  useEffect(() => {
    const btn = btnRef.current;
    if (btn) {
      btn.addEventListener('auxclick', handleAuxClick);
    }

    return () => {
      if (btn) {
        btn.removeEventListener('auxclick', handleAuxClick);
      }
    };
  }, [handleAuxClick]);

  const onPress = useCallback(() => {
    if (!isOrdering) dispatch(tabsActions.setActiveTab(tab.id));
  }, [dispatch, tab.id, isOrdering]);

  return (
    <Tooltip delay={300} isDisabled={!isTruncated}>
      <Tooltip.Content placement="bottom" showArrow>
        <Tooltip.Arrow />
        <p>{tab.title}</p>
      </Tooltip.Content>

      <Button
        className={
          'text-sm pl-2 flex flex-row relative pr-1 ' +
          `cursor-default gap-x-0.5 h-9 overflow-hidden rounded-none rounded-t-xl! ` +
          `${isActiveTab ? 'bg-white dark:bg-[#303033]' : 'hover:bg-surface-secondary'} transition duration-200`
        }
        ref={btnRef}
        variant="ghost"
        onPress={onPress}
        aria-selected={isActiveTab}
        onHoverChange={setIsHovered}
        aria-label={`Tab: ${tab.title}`}>
        <div className="flex gap-x-0.5 flex-row items-center min-w-0 flex-1">
          <TabIcon tab={tab} currentView={runningCard?.currentView} />

          {runningCard && <AudioIndicator tabId={tab.id} id={runningCard.id} />}

          <TabTitle title={tab.title} setIsTruncated={setIsTruncated} />
        </div>

        <CloseButton
          className={
            `scale-85 bg-transparent hover:bg-surface-tertiary ` +
            `${isActiveTab || isHovered ? 'opacity-100' : 'opacity-0'}`
          }
          ref={closeBtnRef}
          aria-label="Close tab"
          onPress={() => handleRemove(false)}
        />

        <ProgressBar progress={tab.progress} />
      </Button>
    </Tooltip>
  );
});

export default TabItem;
