import {Input} from '@heroui/react';
import {useCallback, useState} from 'react';

import {ChosenArgument} from '../../../../../../../../../cross/CrossTypes';
import {getArgumentDefaultValue} from '../../../../../../../../../cross/GetArgumentsData';
import {TextDuo_Icon} from '../../../../../../../assets/icons/SvgIcons/SvgIcons';
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
  }, [inputValue]);

  const onChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  return (
    <ArgumentItemBase id={id} name={argument.name} removeArg={removeArg} icon={<TextDuo_Icon />}>
      <Input
        onBlur={onBlur}
        spellCheck="false"
        value={inputValue}
        onValueChange={onChange}
        placeholder="Enter argument value here..."
        classNames={{inputWrapper: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird'}}
      />
    </ArgumentItemBase>
  );
}
