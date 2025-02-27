import {Divider} from 'antd';
import {generate} from 'random-words';
import {Fragment, useState} from 'react';

import {Web_Icon} from '../../../assets/icons/SvgIcons/SvgIcons3';
import NewTab from './NewTab';
import TabItem from './TabItem';

export default function TabContainer() {
  const [items, setItems] = useState<string[]>(generate({exactly: 5, wordsPerString: 2}) as string[]);

  const addTab = () => {
    setItems(prevState => {
      const result = [...prevState, ...(generate({exactly: 1, wordsPerString: 2}) as string[])];
      setIsSelected(result.at(-1) || '');
      return result;
    });
  };

  const [isSelected, setIsSelected] = useState<string>('');

  const removeTab = (index: number) => {
    setItems(prevState => {
      prevState.splice(index, 1);

      return [...prevState];
    });
  };

  return (
    <div
      className={
        'h-full items-center pt-1 notDraggable justify-between overflow-hidden flex flex-row pl-1 gap-x-1 relative'
      }>
      <div className="items-center h-full flex flex-row overflow-x-scroll scrollbar-hide">
        {items.map((title, index) => (
          <Fragment key={index}>
            <TabItem
              title={title}
              setIsSelected={setIsSelected}
              isSelected={isSelected === title}
              removeTab={() => removeTab(index)}
              icon={<Web_Icon className="size-full" />}
            />
            {index < items.length - 1 && <Divider type="vertical" className="mx-1" />}
          </Fragment>
        ))}
      </div>

      <NewTab addTab={addTab} />
    </div>
  );
}
