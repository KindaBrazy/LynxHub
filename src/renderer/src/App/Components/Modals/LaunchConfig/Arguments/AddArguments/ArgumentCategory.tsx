import {Listbox, ListboxItem, ListboxSection, ScrollShadow, Selection} from '@nextui-org/react';
import {Card, Empty} from 'antd';
import {isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react';

import {ArgumentItem, ArgumentSection} from '../../../../../Modules/types';
import {searchInStrings} from '../../../../../Utils/UtilFunctions';

type Props = {
  listData: ArgumentSection[] | ArgumentItem[];
  title: string;
  selectedArguments: Set<string>;
  setSelectedArguments: Dispatch<SetStateAction<Set<string>>>;

  filterArguments: Set<string>;
  searchValue: string;
};

const isEmptyData = (data: ArgumentSection[] | ArgumentItem[]) => {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return true; // Empty array
    }

    if (data.every(item => Object.prototype.hasOwnProperty.call(item, 'items'))) {
      // Check if all ArgumentSection items have an empty 'items' array
      return (data as ArgumentSection[]).every(section => section.items.length === 0);
    } else {
      // Data is an array of ArgumentItem
      return false; // Non-empty array of ArgumentItem
    }
  }

  return false; // Invalid input data
};

export default function ArgumentCategory({
  filterArguments,
  listData,
  searchValue,
  selectedArguments,
  setSelectedArguments,
  title,
}: Props) {
  const [dataBySearch, setDataBySearch] = useState<ArgumentSection[] | ArgumentItem[]>(listData);

  useEffect(() => {
    let resultByFilter: ArgumentSection[] | ArgumentItem[];
    // -----------------------------------------------> By Filter
    const filterType = filterArguments.values().next().value;

    let isSection: boolean = false;

    if (!isEmpty(listData)) {
      isSection = 'section' in listData[0];
    }

    if (filterType === 'all') {
      resultByFilter = listData;
    } else {
      const shouldInclude = filterType === 'selected';
      resultByFilter = isSection
        ? (listData as ArgumentSection[]).map(section => ({
            ...section,
            items: section.items.filter(item => shouldInclude === selectedArguments.has(item.name)),
          }))
        : (listData as ArgumentItem[]).filter(item => shouldInclude === selectedArguments.has(item.name));
    }

    if (!isEmpty(resultByFilter) && 'section' in resultByFilter[0]) {
      resultByFilter = (resultByFilter as ArgumentSection[]).filter(state => !isEmpty(state.items));
    }
    setDataBySearch(resultByFilter);

    // -----------------------------------------------> By search
    const filterItem = () => (argument: {name: string; description?: string}) => {
      const {description = '', name} = argument;
      return searchInStrings(searchValue, [description, name]);
    };

    if (searchValue && !isEmpty(resultByFilter)) {
      const isSection = 'section' in resultByFilter[0];

      let newFilteredData = isSection
        ? ([...resultByFilter] as ArgumentSection[]).map(section => ({
            ...section,
            items: section.items.filter(filterItem()),
          }))
        : ([...resultByFilter] as ArgumentItem[]).filter(filterItem());

      if (!isEmpty(newFilteredData) && 'section' in newFilteredData[0]) {
        newFilteredData = (newFilteredData as ArgumentSection[]).filter(state => !isEmpty(state.items));
      }
      setDataBySearch(newFilteredData);
    }
  }, [filterArguments, searchValue, selectedArguments]);

  const onSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedArguments(keys as Set<string>);
    },
    [setSelectedArguments],
  );

  return (
    <Card title={title} bordered={false} className="cursor-default" hoverable>
      <ScrollShadow>
        {isEmptyData(dataBySearch) ? (
          <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <>
            {'section' in dataBySearch[0] ? (
              <ScrollShadow className="scrollbar-hide">
                <Listbox
                  variant="faded"
                  selectionMode="multiple"
                  aria-label="Arguments List"
                  selectedKeys={selectedArguments}
                  onSelectionChange={onSelectionChange}
                  items={dataBySearch as ArgumentSection[]}>
                  {section => {
                    return (
                      <ListboxSection
                        showDivider={
                          (dataBySearch[dataBySearch.length - 1] as ArgumentSection).section !== section.section
                        }
                        key={section.section}
                        items={section.items}
                        title={section.section}>
                        {item => (
                          <ListboxItem key={item.name} className="cursor-default" textValue={`Select ${item.name}`}>
                            <span className="flex w-full flex-wrap">{item.name}</span>
                            <span className="flex w-full text-wrap text-xs text-foreground/50">{item.description}</span>
                          </ListboxItem>
                        )}
                      </ListboxSection>
                    );
                  }}
                </Listbox>
              </ScrollShadow>
            ) : (
              <ScrollShadow className="scrollbar-hide">
                <Listbox
                  variant="faded"
                  selectionMode="multiple"
                  aria-label="Arguments List"
                  selectedKeys={selectedArguments}
                  onSelectionChange={onSelectionChange}
                  items={dataBySearch as ArgumentItem[]}>
                  {item => (
                    <ListboxItem key={item.name} className="cursor-default" textValue={`Select ${item.name}`}>
                      <span className="flex w-full flex-wrap">{item.name}</span>
                      <span className="flex w-full text-wrap text-xs text-foreground/50">{item.description}</span>
                    </ListboxItem>
                  )}
                </Listbox>
              </ScrollShadow>
            )}
          </>
        )}
      </ScrollShadow>
    </Card>
  );
}
