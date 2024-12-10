import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue, getArgumentValues} from '../../../../../../../../../cross/GetArgumentsData';
import {ListCheck_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {useModules} from '../../../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';
import {convertArrToObject} from '../../../../../../Utils/UtilFunctions';
import ArgumentItemBase from './Argument-Item-Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void};

export default function DropdownArgItem({argument, changeValue, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const {getArgumentsByID} = useModules();
  const [defaultValue] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, getArgumentsByID(id)),
  );
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
    <ArgumentItemBase name={argument.name} removeArg={removeArg} icon={<ListCheck_Icon />}>
      <Select
        variant="flat"
        aria-label="Select an item"
        onSelectionChange={onChange}
        placeholder="Select an item"
        className="font-JetBrainsMono"
        defaultSelectedKeys={selectedKey}
        classNames={{trigger: 'cursor-default', value: 'text-xs'}}
        items={convertArrToObject(getArgumentValues(argument.name, getArgumentsByID(id)) || [])}>
        {item => (
          <SelectItem key={item.name} classNames={{title: 'text-xs'}} className="cursor-default font-JetBrainsMono">
            {item.name}
          </SelectItem>
        )}
      </Select>
    </ArgumentItemBase>
  );
}
