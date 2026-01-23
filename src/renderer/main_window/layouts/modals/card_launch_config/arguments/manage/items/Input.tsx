import {Input} from '@heroui/react';
import {getArgumentDefaultValue} from '@lynx/utils/module_arguments';
import {ChosenArgument} from '@lynx_common/types';
import {useCallback, useState} from 'react';

import {TextDuo_Icon} from '../../../../../../../shared/assets/icons';
import {useGetArgumentsByID} from '../../../../../../plugins/modules';
import ArgumentItemBase from './Base';

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
