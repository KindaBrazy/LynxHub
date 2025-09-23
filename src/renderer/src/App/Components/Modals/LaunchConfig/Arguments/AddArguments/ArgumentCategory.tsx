import {Card, CardBody, CardHeader, Listbox, ListboxItem, ListboxSection, Selection} from '@heroui/react';
import {cloneDeep, isEmpty} from 'lodash';
import {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';
import Highlighter from 'react-highlight-words';

import {ArgumentItem, ArgumentSection} from '../../../../../../../../cross/plugin/ModuleTypes';
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

// TODO: use heroui card and remove scroll shadow
// TODO: update long list performance

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

  const renderItem = (item: ArgumentItem) => {
    return (
      <ListboxItem key={item.name} className="cursor-default" textValue={`Select ${item.name}`}>
        <Highlighter
          highlightTag="div"
          textToHighlight={item.name}
          className="flex w-full flex-wrap"
          searchWords={searchValue.split(' ')}
          highlightClassName="bg-primary-400/70"
        />
        <Highlighter
          highlightTag="div"
          searchWords={searchValue.split(' ')}
          highlightClassName="bg-primary-400/50"
          textToHighlight={item.description || ''}
          className="flex w-full text-wrap text-xs text-foreground/50"
        />
      </ListboxItem>
    );
  };

  const data = useMemo(() => {
    return cloneDeep(dataBySearch);
  }, [dataBySearch]);

  if (isEmptyData(data)) return null;

  return (
    <Card shadow="none" className="bg-foreground-100">
      <CardHeader className="justify-center text-LynxOrange pt-4">{title}</CardHeader>
      <CardBody>
        {'section' in data[0] ? (
          <Listbox
            variant="flat"
            selectionMode="multiple"
            aria-label="Arguments List"
            selectedKeys={selectedArguments}
            items={data as ArgumentSection[]}
            onSelectionChange={onSelectionChange}>
            {section => (
              <ListboxSection
                key={section.section}
                items={section.items}
                title={section.section}
                classNames={{heading: 'text-warning'}}>
                {item => renderItem(item)}
              </ListboxSection>
            )}
          </Listbox>
        ) : (
          <Listbox
            variant="flat"
            selectionMode="multiple"
            aria-label="Arguments List"
            items={data as ArgumentItem[]}
            selectedKeys={selectedArguments}
            onSelectionChange={onSelectionChange}>
            {item => renderItem(item)}
          </Listbox>
        )}
      </CardBody>
    </Card>
  );
}
