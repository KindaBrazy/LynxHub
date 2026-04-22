import {Button, Input} from '@heroui-v3/react';
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
    <div className="py-4 px-5 flex flex-col gap-y-3 w-100">
      <div className="flex gap-x-2 items-center">
        <TextCursorInput aria-hidden="true" className="size-6 shrink-0" />
        <span id="prompt-message" className="line-clamp-2 max-w-100 w-fit">
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
        variant="secondary"
        className="notDraggable"
        aria-labelledby="prompt-message"
        onChange={e => setInputValue(e.target.value)}
        autoFocus
      />

      <div className="flex justify-between">
        <Button aria-label="Cancel" variant="danger-soft" onPress={hideContextWindow}>
          <X className="size-4" />
          Cancel
        </Button>

        <Button onPress={done} aria-label="OK">
          <Check className="size-4" />
          OK
        </Button>
      </div>
    </div>
  );
});

export default PromptWindow;
