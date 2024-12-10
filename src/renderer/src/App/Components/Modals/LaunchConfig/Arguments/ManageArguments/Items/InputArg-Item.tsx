import {Input} from 'antd';
import {ChangeEvent, useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {Text_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {useModules} from '../../../../../../Modules/ModulesContext';
import {useModalsState} from '../../../../../../Redux/AI/ModalsReducer';
import ArgumentItemBase from './Argument-Item-Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void};

export default function InputArgItem({argument, changeValue, removeArg}: Props) {
  const {id} = useModalsState('cardLaunchConfig');
  const {getArgumentsByID} = useModules();
  const [inputValue, setInputValue] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, getArgumentsByID(id)) || '',
  );

  const onBlur = useCallback(() => {
    changeValue(inputValue);
  }, [changeValue, inputValue]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <ArgumentItemBase icon={<Text_Icon />} name={argument.name} removeArg={removeArg}>
      <Input
        onBlur={onBlur}
        spellCheck={false}
        onChange={onChange}
        variant="borderless"
        defaultValue={inputValue}
        placeholder="Enter argument value here..."
        classNames={{input: '!font-JetBrainsMono !text-xs'}}
        allowClear
      />
    </ArgumentItemBase>
  );
}
