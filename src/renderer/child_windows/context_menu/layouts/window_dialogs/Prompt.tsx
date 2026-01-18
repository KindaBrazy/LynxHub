import {Button, Input} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import windowDialogsIpc from '@lynx/ipc/window_dialogs';
import {Check, TextCursorInput, X} from 'lucide-react';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideWindow} from '../Shared';

const PromptWindow = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const done = () => {
    const result: string | null = inputValue === '' || inputValue === undefined ? null : inputValue;

    windowDialogsIpc.promptResult(result);

    hideWindow();
  };

  useEffect(() => {
    const offPrompt = windowDialogsIpc.promptShow((_message: string, _defaultValue?: string) => {
      setMessage(_message);
      setInputValue(_defaultValue);

      setWidthSize('lg');
      setSelectedLayout(MenuTypes.Prompt);

      rendererIpc.contextMenu.showWindow();
    });

    return () => offPrompt();
  }, []);

  if (!show) return null;

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
            hideWindow();
          }
        }}
        value={inputValue}
        className="notDraggable"
        onValueChange={setInputValue}
        autoFocus
      />

      <div className="flex justify-between">
        <Button variant="light" color="warning" onPress={hideWindow} startContent={<X className="size-4" />}>
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
