import {Button, Input, Textarea, Tooltip} from '@heroui/react';
import {ChosenArgument} from '@lynx_common/types/plugins/modules';
import {Restart, Text} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useState} from 'react';

import {useGetArgumentsByID} from '../../../../../../plugins/modules';
import {getArgumentDefaultValue} from '../../../../../../utils/moduleArguments';
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
 * Renders an Input argument item for free-form text entry.
 * Updates the value on blur to minimize re-renders in parent.
 *
 * @returns {JSX.Element} The rendered InputArgItem component.
 */
export default function InputArgItem({argument, changeValue, removeArg, id}: Props) {
  const cardArgument = useGetArgumentsByID(id);

  const [isInputBox, setIsInputBox] = useState<boolean>(false);
  const [rotateEffect, setRotateEffect] = useState<boolean>(false);

  const [inputValue, setInputValue] = useState<string>(
    argument.value || getArgumentDefaultValue(argument.name, cardArgument) || '',
  );

  // Sync state with prop updates
  useEffect(() => {
    if (argument.value !== undefined) {
      setInputValue(argument.value.toString());
    }
  }, [argument.value]);

  const onBlur = useCallback(() => {
    changeValue(inputValue);
  }, [inputValue, changeValue]);

  const onChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const toggleInput = () => setIsInputBox(prev => !prev);

  return (
    <ArgumentItemBase
      extra={
        <Tooltip delay={800} content={`Change to ${isInputBox ? 'One line' : 'Multiline'}`} showArrow>
          <Button size="sm" variant="light" onPress={toggleInput} aria-label="Toggle path type" isIconOnly>
            <Restart
              onAnimationEnd={() => setRotateEffect(false)}
              className={`${rotateEffect && 'animate-[spin_0.5s]'}`}
            />
          </Button>
        </Tooltip>
      }
      id={id}
      name={argument.name}
      removeArg={removeArg}
      icon={<Text className="size-3.5" />}>
      {isInputBox ? (
        <Textarea
          onBlur={onBlur}
          value={inputValue}
          spellCheck="false"
          onValueChange={onChange}
          placeholder="Enter argument value here..."
          classNames={{inputWrapper: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird'}}
        />
      ) : (
        <Input
          onBlur={onBlur}
          spellCheck="false"
          value={inputValue}
          onValueChange={onChange}
          placeholder="Enter argument value here..."
          classNames={{inputWrapper: 'dark:bg-LynxRaisinBlack bg-LynxWhiteThird'}}
        />
      )}
    </ArgumentItemBase>
  );
}
