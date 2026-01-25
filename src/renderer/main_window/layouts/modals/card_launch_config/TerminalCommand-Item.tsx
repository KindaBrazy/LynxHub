import {Button, Input} from '@heroui/react';
import {TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {Reorder} from 'framer-motion';
import {isEmpty} from 'lodash';
import {GripVertical} from 'lucide-react';
import {KeyboardEvent, useCallback, useState} from 'react';

type Props = {
  index: number;
  defaultText: string;
  onRemove?: (index: number) => void;
  editCommand?: (index: number, value: string) => void;
  onDoneReorder?: () => void;
};

/** Display card for adding, removing, and editing terminal commands */
export default function TerminalCommandItem({defaultText, editCommand, index, onRemove, onDoneReorder}: Props) {
  const [inputValue, setInputValue] = useState<string>(defaultText);

  const onEdit = () => {
    editCommand?.(index, inputValue);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Enter') onEdit();
  };

  const onBlur = () => {
    onEdit();
  };

  const remove = useCallback(() => onRemove?.(index), [onRemove, index]);

  const onChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  return (
    <Reorder.Item
      value={defaultText}
      animate={{opacity: 1}}
      initial={{opacity: 0}}
      onPointerUp={onDoneReorder}
      className={'rounded-medium bg-foreground-50 cursor-grab active:cursor-grabbing flex items-center gap-x-2 p-2'}>
      <GripVertical className="text-foreground-500 size-4" />
      <span className="text-sm">{index + 1}</span>
      <Input
        size="sm"
        variant="flat"
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        spellCheck="false"
        onValueChange={onChange}
        defaultValue={defaultText}
        autoFocus={isEmpty(defaultText)}
        classNames={{input: `font-JetBrainsMono! text-xs!`, inputWrapper: 'bg-LynxWhiteThird dark:bg-LynxRaisinBlack'}}
      />
      <Button size="sm" color="danger" variant="light" onPress={remove} isIconOnly>
        <TrashBin2 className="size-3.5" />
      </Button>
    </Reorder.Item>
  );
}
