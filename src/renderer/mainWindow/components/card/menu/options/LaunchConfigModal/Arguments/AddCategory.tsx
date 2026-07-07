import {Card, Description, Header, Label, ListBox, Selection} from '@heroui/react';
import {ArgumentItem, ArgumentSection} from '@lynx_common/types/plugins/modules';
import Fuse from 'fuse.js';
import {isEmpty} from 'lodash-es';
import {Dispatch, SetStateAction, useCallback, useMemo} from 'react';
import Highlighter from 'react-highlight-words';

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
    if (data.length === 0) return true;
    if (data.every(item => 'items' in item)) {
      return (data as ArgumentSection[]).every(section => section.items.length === 0);
    }
    return false;
  }
  return false;
};

/**
 * Renders a list of arguments, either grouped by section or as a flat list.
 * Supports filtering by selection status and search term.
 */
export default function ArgumentSelectionList({
  filterArguments,
  listData,
  searchValue,
  selectedArguments,
  setSelectedArguments,
  title,
}: Props) {
  const filteredData = useMemo(() => {
    let result: ArgumentSection[] | ArgumentItem[] = listData;

    // 1. Filter by selection status (All / Selected / Not Selected)
    const filterType = filterArguments.values().next().value;
    if (filterType !== 'all') {
      const shouldInclude = filterType === 'selected';
      const isSection = !isEmpty(result) && 'items' in result[0];

      if (isSection) {
        result = (result as ArgumentSection[])
          .map(section => ({
            ...section,
            items: section.items.filter(item => shouldInclude === selectedArguments.has(item.name)),
          }))
          .filter(section => !isEmpty(section.items));
      } else {
        result = (result as ArgumentItem[]).filter(item => shouldInclude === selectedArguments.has(item.name));
      }
    }

    // 2. Filter by search value
    if (searchValue) {
      const isSection = !isEmpty(result) && 'items' in result[0];

      if (isSection) {
        result = (result as ArgumentSection[])
          .map(section => {
            const fuse = new Fuse(section.items, {
              keys: ['name', 'description'],
              threshold: 0.4,
            });
            return {
              ...section,
              items: fuse.search(searchValue).map(r => r.item),
            };
          })
          .filter(section => !isEmpty(section.items));
      } else {
        const fuse = new Fuse(result as ArgumentItem[], {
          keys: ['name', 'description'],
          threshold: 0.4,
        });
        result = fuse.search(searchValue).map(r => r.item);
      }
    }

    return result;
  }, [listData, filterArguments, selectedArguments, searchValue]);

  const onSelectionChange = useCallback(
    (keys: Selection) => {
      setSelectedArguments(keys as Set<string>);
    },
    [setSelectedArguments],
  );

  const renderItem = useCallback(
    (item: ArgumentItem) => {
      const searchWords = searchValue.split(/\s+/);
      return (
        <ListBox.Item id={item.name} key={item.name} textValue={`Select ${item.name}`}>
          <ListBox.ItemIndicator />
          <div className="flex flex-col">
            <Label>
              <Highlighter
                searchWords={searchWords}
                textToHighlight={item.name}
                className="flex flex-wrap font-medium"
                highlightClassName="bg-warning/40 rounded-sm px-0.5"
                autoEscape
              />
            </Label>
            <Description>
              <Highlighter
                searchWords={searchWords}
                textToHighlight={item.description || ''}
                className="text-wrap text-xs text-muted mt-0.5"
                highlightClassName="bg-warning/40 rounded-sm px-0.5"
                autoEscape
              />
            </Description>
          </div>
        </ListBox.Item>
      );
    },
    [searchValue],
  );

  if (isEmptyData(filteredData)) return null;

  return (
    <Card variant="secondary">
      <Card.Header>
        <Card.Title className="justify-center flex text-LynxOrange font-bold">{title}</Card.Title>
      </Card.Header>
      <Card.Content>
        {!isEmpty(filteredData) && 'items' in filteredData[0] ? (
          <ListBox
            selectionMode="multiple"
            aria-label="Arguments List"
            selectedKeys={selectedArguments}
            key={`${searchValue}_argumentList`}
            onSelectionChange={onSelectionChange}>
            {(filteredData as ArgumentSection[]).map(section =>
              section.items.length > 0 ? (
                <ListBox.Section id={section.section} key={section.section}>
                  <Header>{section.section}</Header>
                  {section.items.map(item => renderItem(item))}
                </ListBox.Section>
              ) : null,
            )}
          </ListBox>
        ) : (
          <ListBox
            selectionMode="multiple"
            aria-label="Arguments List"
            selectedKeys={selectedArguments}
            key={`${searchValue}_argumentList`}
            onSelectionChange={onSelectionChange}
            items={filteredData as ArgumentItem[]}>
            {item => renderItem(item)}
          </ListBox>
        )}
      </Card.Content>
    </Card>
  );
}
