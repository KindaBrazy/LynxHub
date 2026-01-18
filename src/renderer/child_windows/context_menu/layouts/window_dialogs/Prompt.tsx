import {Button, Input} from '@heroui/react';
import rendererIpc from '@lynx/ipc';
import promptIpc from '@lynx/ipc/prompt_window';
import {memo, useEffect, useState} from 'react';

import {MenuTypes} from '../../consts';
import {CommonProps} from '../../types';
import {hideWindow} from '../Shared';

const PromptWindow = memo(({setSelectedLayout, setWidthSize, show}: CommonProps) => {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  const done = () => {
    const result: string | null = inputValue === '' || inputValue === undefined ? null : inputValue;

    promptIpc.result(result);

    hideWindow();
  };

  const cancel = () => {
    promptIpc.cancel();

    hideWindow();
  };

  useEffect(() => {
    const offPrompt = promptIpc.onShow((_message: string, _defaultValue?: string) => {
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
    <div className="py-4 px-5">
      <div className="size-full flex-row space-y-4 px-4 pt-4 text-center">
        <span className="dl-title w-full">{message}</span>

        <Input
          onKeyDown={event => {
            if (event.key === 'Enter') {
              done();
            } else if (event.key === 'Escape') {
              cancel();
            }
          }}
          size="sm"
          value={inputValue}
          className="notDraggable"
          onValueChange={setInputValue}
          autoFocus
        />

        <div className="space-x-3 text-end">
          <Button size="sm" color="warning" onPress={cancel} className="notDraggable">
            Cancel
          </Button>

          <Button size="sm" onPress={done} color="success" className="notDraggable">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
});

export default PromptWindow;
