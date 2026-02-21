import {Button, Input} from '@heroui/react';
import windowDialogsIpc from '@lynx_shared/ipc/dialogsWindow';
import {Check, TextCursorInput, X} from 'lucide-react';
import {memo, useCallback, useEffect, useState} from 'react';

import {useContextState} from '../../redux/reducer';
import {hideContextWindow} from '../Shared';

/**
 * PromptWindow Component
 * Displays a prompt dialog with an input field, OK, and Cancel buttons.
 */
const PromptWindow = memo(function PromptWindow() {
  const [inputValue, setInputValue] = useState<string>('');

  const {message, defaultValue} = useContextState('promptWindow');

  useEffect(() => {
    if (defaultValue !== undefined) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  const done = useCallback(() => {
    const result: string | null = inputValue === '' ? null : inputValue;

    windowDialogsIpc.promptResult(result);

    hideContextWindow();
  }, [inputValue]);

  return (
    <div className="py-4 px-5 flex flex-col gap-y-3">
      <div className="flex gap-x-2 items-center">
        <TextCursorInput className="size-6" aria-hidden="true" />
        <span className="w-full line-clamp-2" id="prompt-message">
          {message}
        </span>
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
        aria-labelledby="prompt-message"
      />

      <div className="flex justify-between">
        <Button
          variant="light"
          color="warning"
          onPress={hideContextWindow}
          startContent={<X className="size-4" />}
          aria-label="Cancel">
          Cancel
        </Button>

        <Button
          onPress={done}
          variant="flat"
          color="success"
          startContent={<Check className="size-4" />}
          aria-label="OK">
          OK
        </Button>
      </div>
    </div>
  );
});

export default PromptWindow;
