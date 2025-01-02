import {Card} from '@nextui-org/card';
import {Button, Input} from 'antd';
import {ChangeEvent, useCallback, useState} from 'react';

import {Close_Icon} from '../../../../assets/icons/SvgIcons/SvgIcons1';

type Props = {
  index: number;
  defaultText: string;
  onRemove?: (index: number) => void;
  focus?: boolean;
  editCommand?: (index: number, value: string) => void;
};

/** Display card for adding, removing, and editing terminal commands */
export default function TerminalCommandItem({defaultText, editCommand, focus, index, onRemove}: Props) {
  const [inputValue, setInputValue] = useState<string>(defaultText);

  const editHandle = () => {
    editCommand?.(index, inputValue);
  };

  const onBlur = () => {
    editHandle();
  };

  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <Card
      shadow="none"
      className="flex h-[38px] flex-row items-center justify-center !transition-opacity !duration-300 hover:opacity-80">
      <Input
        addonAfter={
          <Button type="text" size="small" onClick={remove} icon={<Close_Icon />} className="cursor-default" danger />
        }
        width={90}
        size="large"
        onBlur={onBlur}
        autoFocus={focus}
        spellCheck={false}
        onChange={onChange}
        variant="borderless"
        addonBefore={index + 1}
        onPressEnter={editHandle}
        defaultValue={defaultText}
        classNames={{input: `font-JetBrainsMono text-sm`}}
      />
    </Card>
  );
}
