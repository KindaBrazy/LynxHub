import {Button, Input} from '@heroui/react';
import windowDialogsIpc from '@lynx_shared/ipc/window_dialogs';
import {Check, TextCursorInput, X} from 'lucide-react';
import {memo, useEffect, useState} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow} from '../Shared';

const PromptWindow = memo(() => {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const {message, defaultValue} = useContextState('promptWindow');

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const done = () => {
    const result: string | null = inputValue === '' || inputValue === undefined ? null : inputValue;

    windowDialogsIpc.promptResult(result);

    hideContextWindow();
  };

  return (
    <div className="py-4 px-5 flex flex-col gap-y-3">
      <div className="flex gap-x-2 items-center">
        <TextCursorInput className="size-6" />
        <span className="w-full line-clamp-2">{message}</span>
      </div>

      <Input
        onKeyDown={event => {
          if (event.key === 'Enter') {
            done();
          } else if (event.key === 'Escape') {
            hideContextWindow();
          }
        }}
        value={inputValue}
        className="notDraggable"
        onValueChange={setInputValue}
        autoFocus
      />

      <div className="flex justify-between">
        <Button variant="light" color="warning" onPress={hideContextWindow} startContent={<X className="size-4" />}>
          Cancel
        </Button>

        <Button onPress={done} variant="flat" color="success" startContent={<Check className="size-4" />}>
          OK
        </Button>
      </div>
    </div>
  );
});

export default PromptWindow;
