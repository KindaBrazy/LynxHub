import {Select, Selection, SelectItem} from '@heroui/react';
import {useGetArgumentsByID} from '@lynx/plugins/modules';
import {convertArrToObject} from '@lynx/utils';
import {getArgumentDefaultValue, getArgumentValues} from '@lynx/utils/module_arguments';
import {ListCheckDuo_Icon} from '@lynx_assets/icons';
import {ChosenArgument} from '@lynx_common/types';
import {useCallback, useState} from 'react';

import ArgumentItemBase from './Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function DropdownArgItem({argument, changeValue, removeArg, id}: Props) {
  const cardArgument = useGetArgumentsByID(id);

  const [defaultValue] = useState<string>(argument.value || getArgumentDefaultValue(argument.name, cardArgument));
  const [selectedKey, setSelectedKey] = useState<string[]>(defaultValue ? [defaultValue] : []);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value?.toString();
        setSelectedKey(value ? [value] : []);
        changeValue(value);
      }
    },
    [changeValue],
  );

  return (
    <ArgumentItemBase
      id={id}
      name={argument.name}
      removeArg={removeArg}
      icon={<ListCheckDuo_Icon className="size-[1.15rem]" />}>
      <Select
        variant="flat"
        aria-label="Select an item"
        onSelectionChange={onChange}
        placeholder="Select an item"
        defaultSelectedKeys={selectedKey}
        items={convertArrToObject(getArgumentValues(argument.name, cardArgument) || [])}
        classNames={{trigger: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird', value: 'text-xs'}}>
        {item => (
          <SelectItem key={item.name} classNames={{title: 'text-xs'}}>
            {item.name}
          </SelectItem>
        )}
      </Select>
    </ArgumentItemBase>
  );
}
