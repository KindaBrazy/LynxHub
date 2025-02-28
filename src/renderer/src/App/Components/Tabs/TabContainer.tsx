import {Divider} from 'antd';
import {AnimatePresence, motion} from 'framer-motion';
import {generate} from 'random-words';
import {useEffect, useRef, useState} from 'react';

import {Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import NewTab from './NewTab';
import TabItem from './TabItem';

export default function TabContainer() {
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

  const [items, setItems] = useState<string[]>(generate({exactly: 5, wordsPerString: 2}) as string[]);

  const addTab = () => {
    setItems(prevState => {
      const result = [...prevState, ...(generate({exactly: 1, wordsPerString: 2}) as string[])];
      setIsSelected(result.at(-1) || '');
      return result;
    });
  };

  const [isSelected, setIsSelected] = useState<string>('');

  const removeTab = (title: string) => {
    setItems(prevState => prevState.filter(item => item !== title));
  };

  return (
    <div
      className={
        'h-full items-center pt-1 notDraggable justify-between overflow-hidden flex flex-row pl-1 gap-x-1 relative'
      }>
      <div
        ref={containerRef}
        className="items-center h-full w-full flex flex-row overflow-y-hidden overflow-x-scroll scrollbar-hide">
        <AnimatePresence>
          {items.map((title, index) => (
            <motion.div
              transition={{
                layout: {duration: 0.5, type: 'spring'},
              }}
              key={title}
              layout="position"
              initial={{scale: 0.8, y: 10, x: 20, opacity: 0}}
              className="h-full flex items-center max-w-60 min-w-[6rem]"
              exit={{scale: 0.5, y: 10, x: 20, transition: {duration: 0.07, ease: 'backIn'}}}
              animate={{scale: 1, y: 0, x: 0, opacity: 1, transition: {duration: 0.25, ease: 'backOut'}}}>
              <TabItem
                key={title}
                title={title}
                setIsSelected={setIsSelected}
                isSelected={isSelected === title}
                removeTab={() => removeTab(title)}
                icon={<Web_Icon className="size-full" />}
              />
              {index < items.length - 1 && <Divider type="vertical" className="mx-1" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NewTab addTab={addTab} />
    </div>
  );
}
