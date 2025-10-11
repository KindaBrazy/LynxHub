import {Divider} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {isEqual} from 'lodash';
import {memo, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import NewTab from './NewTab';
import {useRemoveTab} from './Tab_Utils';
import TabItem from './TabItem';

const TabContainer = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const tabsFromRedux = useTabsState('tabs');
  const removeTab = useRemoveTab();

  const [localTabs, setLocalTabs] = useState(tabsFromRedux);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalTabs(tabsFromRedux);
  }, [tabsFromRedux]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', event => {
        if (event.button === 1) {
          event.preventDefault();
        }
      });
    }
  }, [containerRef]);

  useEffect(() => {
    const offRemoveTab = rendererIpc.contextMenu.onRemoveTab((_, tabID) => {
      removeTab(tabID);
    });

    return () => offRemoveTab();
  }, [removeTab]);

  const onReorder = (reorderedIds: string[]) => {
    const newOrder = reorderedIds
      .map(tabID => localTabs.find(tab => tab.id === tabID))
      .filter((tab): tab is NonNullable<typeof tab> => tab !== undefined);

    if (newOrder.length === localTabs.length) {
      setLocalTabs(newOrder);
    }
  };

  const handleReorderEnd = () => {
    if (!isEqual(tabsFromRedux, localTabs)) {
      dispatch(tabsActions.setTabState({key: 'tabs', value: localTabs}));
    }
  };

  return (
    <div
      className={
        'h-full items-center pt-1 notDraggable justify-between overflow-hidden flex flex-row pl-1 gap-x-1 relative'
      }>
      <AnimatePresence>
        <Reorder.Group
          axis="x"
          as="div"
          ref={containerRef}
          onReorder={onReorder}
          onMouseUp={handleReorderEnd}
          values={localTabs.map(tab => tab.id)}
          className="items-center h-full w-full flex flex-row overflow-y-hidden overflow-x-scroll scrollbar-hide">
          {localTabs.map((tab, index) => (
            <Reorder.Item
              transition={{
                layout: {duration: 0.5, type: 'spring'},
              }}
              as="div"
              key={tab.id}
              value={tab.id}
              layout="position"
              initial={{scale: 0.8, y: 10, x: 20, opacity: 0}}
              className="h-full flex items-center max-w-60 min-w-[6rem]"
              exit={{scale: 0.5, y: 10, x: 20, transition: {duration: 0.07, ease: 'backIn'}}}
              animate={{scale: 1, y: 0, x: 0, opacity: 1, transition: {duration: 0.25, ease: 'backOut'}}}>
              <TabItem tab={tab} key={tab.id} />
              {index < localTabs.length - 1 && <Divider type="vertical" className="mx-1" />}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </AnimatePresence>

      <NewTab />
    </div>
  );
});

export default TabContainer;
