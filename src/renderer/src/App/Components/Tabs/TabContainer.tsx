import {Divider} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {memo, useEffect, useRef} from 'react';

import {useTabsState} from '../../Redux/Reducer/TabsReducer';
import rendererIpc from '../../RendererIpc';
import NewTab from './NewTab';
import {useRemoveTab} from './Tab_Utils';
import TabItem from './TabItem';

const TabContainer = memo(() => {
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

  return (
    <div
      className={
        'h-full items-center pt-1 notDraggable justify-between overflow-hidden flex flex-row pl-1 gap-x-1 relative'
      }>
      <div
        ref={containerRef}
        className="items-center h-full w-full flex flex-row overflow-y-hidden overflow-x-scroll scrollbar-hide">
        <AnimatePresence>
          {tabs.map((tab, index) => (
            <motion.div
              transition={{
                layout: {duration: 0.5, type: 'spring'},
              }}
              key={tab.id}
              layout="position"
              initial={{scale: 0.8, y: 10, x: 20, opacity: 0}}
              className="h-full flex items-center max-w-60 min-w-[6rem]"
              exit={{scale: 0.5, y: 10, x: 20, transition: {duration: 0.07, ease: 'backIn'}}}
              animate={{scale: 1, y: 0, x: 0, opacity: 1, transition: {duration: 0.25, ease: 'backOut'}}}>
              <TabItem tab={tab} key={tab.id} />
              {index < tabs.length - 1 && <Divider type="vertical" className="mx-1" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NewTab />
    </div>
  );
});

export default TabContainer;
