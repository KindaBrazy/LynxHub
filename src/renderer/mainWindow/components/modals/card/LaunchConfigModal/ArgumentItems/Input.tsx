import {Input} from '@heroui/react';
import {ChosenArgument} from '@lynx_common/types';
import {Text} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useState} from 'react';

import {useGetArgumentsByID} from '../../../../../plugins/modules';
import {getArgumentDefaultValue} from '../../../../../utils/moduleArguments';
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
    <ArgumentItemBase id={id} name={argument.name} removeArg={removeArg} icon={<Text className="size-3.5" />}>
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
