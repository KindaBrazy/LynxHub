import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue, getArgumentValues} from '../../../../../../../../../cross/GetArgumentsData';
import {ListCheckDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import {convertArrToObject} from '../../../../../../Utils/UtilFunctions';
import ArgumentItemBase from './Argument-Item-Base';

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
        className="font-JetBrainsMono"
        defaultSelectedKeys={selectedKey}
        classNames={{trigger: 'cursor-default', value: 'text-xs'}}
        items={convertArrToObject(getArgumentValues(argument.name, cardArgument) || [])}>
        {item => (
          <SelectItem key={item.name} classNames={{title: 'text-xs'}} className="cursor-default font-JetBrainsMono">
            {item.name}
          </SelectItem>
        )}
      </Select>
    </ArgumentItemBase>
  );
}
