import {Select, Selection, SelectItem} from '@heroui/react';
import {ChosenArgument} from '@lynx_common/types';
import {ListDownMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {useGetArgumentsByID} from '../../../../../../plugins/modules';
import {convertArrToObject} from '../../../../../../utils';
import {getArgumentDefaultValue, getArgumentValues} from '../../../../../../utils/moduleArguments';
import ArgumentItemBase from './Base';

type Props = {
  /** The argument data */
  argument: ChosenArgument;
  /** Function to remove the argument */
  removeArg: () => void;
  /** Function to change the argument value */
  changeValue: (value: any) => void;
  /** The ID of the card */
  id: string;
};

/**
 * Renders a Dropdown argument item using a Select component.
 * Allows selecting a single value from a predefined list.
 *
 * @returns {JSX.Element} The rendered DropdownArgItem component.
 */
export default function DropdownArgItem({argument, changeValue, removeArg, id}: Props) {
  const cardArgument = useGetArgumentsByID(id);

  const defaultValue = useMemo(
    () => getArgumentDefaultValue(argument.name, cardArgument),
    [argument.name, cardArgument],
  );

  const [selectedKey, setSelectedKey] = useState<Selection>(
    new Set(argument.value ? [argument.value] : defaultValue ? [defaultValue] : []),
  );

  // Sync state with prop updates
  useEffect(() => {
    if (argument.value) {
      setSelectedKey(new Set([argument.value]));
    } else if (defaultValue) {
      setSelectedKey(new Set([defaultValue]));
    }
  }, [argument.value, defaultValue]);

  const onChange = useCallback(
    (keys: Selection) => {
      // keys is a Set of strings (or 'all', but we don't support multiple selection here likely)
      if (keys !== 'all') {
        const value = Array.from(keys)[0]?.toString();
        setSelectedKey(keys);
        changeValue(value);
      }
    },
    [changeValue],
  );

  const items = useMemo(
    () => convertArrToObject(getArgumentValues(argument.name, cardArgument) || []),
    [argument.name, cardArgument],
  );

  return (
    <ArgumentItemBase
      id={id}
      name={argument.name}
      removeArg={removeArg}
      icon={<ListDownMinimalistic className="size-4.5" />}>
      <Select
        items={items}
        variant="flat"
        selectedKeys={selectedKey}
        aria-label="Select an item"
        onSelectionChange={onChange}
        placeholder="Select an item"
        classNames={{trigger: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird', value: 'text-xs'}}>
        {item => (
          <SelectItem key={item.name} textValue={item.name} classNames={{title: 'text-xs'}}>
            {item.name}
          </SelectItem>
        )}
      </Select>
    </ArgumentItemBase>
  );
}
