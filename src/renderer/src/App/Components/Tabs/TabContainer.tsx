import {Divider} from 'antd';
import {AnimatePresence, Reorder} from 'framer-motion';
import {memo, useEffect, useRef} from 'react';
import {useDispatch} from 'react-redux';

import {tabsActions, useTabsState} from '../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../Redux/Store';
import rendererIpc from '../../RendererIpc';
import NewTab from './NewTab';
import {useRemoveTab} from './Tab_Utils';
import TabItem from './TabItem';

const TabContainer = memo(() => {
  const dispatch = useDispatch<AppDispatch>();

  const tabs = useTabsState('tabs');
  const removeTab = useRemoveTab();

  const containerRef = useRef<HTMLDivElement | null>(null);

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
    rendererIpc.contextMenu.offRemoveTab();
    rendererIpc.contextMenu.onRemoveTab((_, tabID) => {
      removeTab(tabID);
    });

    return () => rendererIpc.contextMenu.offRemoveTab();
  }, [removeTab]);

  const onReorder = (items: string[]) => {
    const newOrder = items.map(tabID => tabs.find(tab => tab.id === tabID));
    if (newOrder.every(item => item !== undefined)) {
      dispatch(tabsActions.setTabState({key: 'tabs', value: newOrder}));
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
          values={tabs.map(tab => tab.id)}
          className="items-center h-full w-full flex flex-row overflow-y-hidden overflow-x-scroll scrollbar-hide">
          {tabs.map((tab, index) => (
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
              {index < tabs.length - 1 && <Divider type="vertical" className="mx-1" />}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </AnimatePresence>

      <NewTab />
    </div>
  );
});

export default TabContainer;
