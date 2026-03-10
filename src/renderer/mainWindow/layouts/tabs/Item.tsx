import {Button, Tooltip} from '@heroui/react';
import useHotkeyPress from '@lynx/hooks/hotkeys';
import {useCardsState} from '@lynx/redux/reducers/cards';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {useSettingsState} from '@lynx/redux/reducers/settings';
import {tabsActions} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {Hotkey_Names} from '@lynx_common/consts/hotkeys';
import {TabInfo} from '@lynx_common/types';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {motion} from 'framer-motion';
import {X} from 'lucide-react';
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
    <Tooltip
      delay={300}
      radius="sm"
      offset={-2}
      placement="bottom"
      content={tab.title}
      isDisabled={!isTruncated}
      classNames={{content: 'dark:bg-foreground-100', base: 'before:dark:bg-foreground-100'}}
      showArrow>
      <Button
        className={
          'pr-0 text-small pl-2 flex data-[hover=true]:bg-foreground-100 flex-row relative ' +
          `cursor-default gap-x-0 h-9 overflow-visible rounded-t-lg!`
        }
        ref={btnRef}
        radius="none"
        variant="light"
        onPress={onPress}
        aria-selected={isActiveTab}
        aria-label={`Tab: ${tab.title}`}
        disableRipple>
        <div className="flex gap-x-0.5 flex-row items-center min-w-0 flex-1">
          <TabIcon tab={tab} currentView={runningCard?.currentView} />

          {runningCard && <AudioIndicator tabId={tab.id} id={runningCard.id} />}

          <TabTitle title={tab.title} setIsTruncated={setIsTruncated} />
        </div>

        <Button
          className={`cursor-default opacity-100 scale-75 ${
            isActiveTab ? ' opacity-100 scale-75 ' : ' opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-75'
          }`}
          as="span"
          size="sm"
          variant="light"
          ref={closeBtnRef}
          aria-label="Close tab"
          onPress={() => handleRemove(false)}
          isIconOnly>
          <X size={18} />
        </Button>

        <ProgressBar progress={tab.progress} />

        {isActiveTab && (
          <motion.div
            layoutId="active_tab_indicator"
            transition={{duration: 0.3, type: 'spring'}}
            className="absolute inset-0 -z-1 bg-white dark:bg-[#303033] rounded-t-lg"
          />
        )}
      </Button>
    </Tooltip>
  );
});

export default TabItem;
