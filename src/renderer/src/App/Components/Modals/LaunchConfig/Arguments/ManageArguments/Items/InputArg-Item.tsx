import {Input} from 'antd';
import {ChangeEvent, useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {Text_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetArgumentsByID} from '../../../../../../Modules/ModuleLoader';
import ArgumentItemBase from './Argument-Item-Base';

type Props = {argument: ChosenArgument; removeArg: () => void; changeValue: (value: any) => void; id: string};

export default function InputArgItem({argument, changeValue, removeArg, id}: Props) {
  const cardArgument = useGetArgumentsByID(id);
  const [inputValue, setInputValue] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || '',
  );

  const onBlur = useCallback(() => {
    changeValue(inputValue);
  }, [changeValue, inputValue]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <ArgumentItemBase id={id} icon={<Text_Icon />} name={argument.name} removeArg={removeArg}>
      <Input
        onBlur={onBlur}
        spellCheck="false"
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
