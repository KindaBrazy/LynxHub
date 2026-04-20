import {Separator} from '@heroui-v3/react';
import {tabsActions, useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {TabInfo} from '@lynx_common/types';
import contextMenuIpc from '@lynx_shared/ipc/contextMenu';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEqual} from 'lodash';
import {memo, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useAppState} from '../../redux/reducers/app';
import TabItem from './Item';
import NewTab from './New';
import {useRemoveTab} from './utils';

/**
 * Container component for the tabs list.
 * Handles drag-and-drop reordering, context menu interactions, and rendering of individual tabs.
 */
const TabsList = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const tabsFromRedux = useTabsState('tabs');
  const removeTab = useRemoveTab();
  const onFocus = useAppState('onFocus');

  const [localTabs, setLocalTabs] = useState<TabInfo[]>(tabsFromRedux);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isOrdering, setIsOrdering] = useState<boolean>(false);

  // Sync local state with Redux when Redux state changes (e.g. new tab added from elsewhere)
  useEffect(() => {
    setLocalTabs(tabsFromRedux);
  }, [tabsFromRedux]);

  // Prevent default middle-click scrolling behavior on the tab container
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
          event.preventDefault();
        }
      };
      container.addEventListener('mousedown', handleMouseDown);
      return () => container.removeEventListener('mousedown', handleMouseDown);
    }
    return undefined;
  }, []);

  // Listen for remove tab events from context menu
  useEffect(() => {
    const offRemoveTab = contextMenuIpc.on.removeTab(tabId => {
      removeTab({tabId});
    });

    return () => offRemoveTab();
  }, [removeTab]);

  const onReorder = useCallback((reorderedIds: string[]) => {
    setIsOrdering(true);
    setLocalTabs(prevTabs => {
      const newOrder = reorderedIds
        .map(tabID => prevTabs.find(tab => tab.id === tabID))
        .filter((tab): tab is TabInfo => tab !== undefined);

      return newOrder.length === prevTabs.length ? newOrder : prevTabs;
    });
  }, []);

  const handleReorderEnd = useCallback(() => {
    setTimeout(() => setIsOrdering(false), 100);
    if (!isEqual(tabsFromRedux, localTabs)) {
      dispatch(tabsActions.setTabState({key: 'tabs', value: localTabs}));
    }
  }, [tabsFromRedux, localTabs, dispatch]);

  return (
    <div
      className={
        'h-full items-center pt-1 notDraggable justify-between overflow-hidden flex flex-row pl-1 gap-x-1 relative'
      }>
      <Reorder.Group
        axis="x"
        as="div"
        ref={containerRef}
        onReorder={onReorder}
        onMouseUp={handleReorderEnd}
        values={localTabs.map(tab => tab.id)}
        className="items-center h-full w-full flex flex-row overflow-y-hidden overflow-x-scroll scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {localTabs.map((tab, index) => (
            <Reorder.Item
              transition={{
                layout: {duration: 0.2, type: 'spring', bounce: 0, visualDuration: 0.2},
              }}
              as="div"
              key={tab.id}
              value={tab.id}
              layout="position"
              initial={{scale: 0.8, y: 10, x: 20, opacity: 0}}
              className="h-full flex items-center max-w-60 min-w-24"
              exit={{scale: 0.5, y: 10, x: 20, transition: {duration: 0.07, ease: 'backIn'}}}
              animate={{scale: 1, y: 0, x: 0, opacity: 1, transition: {duration: 0.25, ease: 'backOut'}}}>
              <TabItem tab={tab} isOrdering={isOrdering} />
              {index < localTabs.length - 1 && (
                <Separator
                  orientation="vertical"
                  className={`mx-1 my-3 ${onFocus ? 'bg-foreground-400/30' : 'bg-foreground-400/10'}`}
                />
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <NewTab />
    </div>
  );
});

export default TabsList;
