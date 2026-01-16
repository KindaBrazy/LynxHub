import {Button, Input} from '@heroui/react';
import {useEffect, useState} from 'react';

export default function Dialog() {
  const [title, setTitle] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    window.electron.ipcRenderer.on('dlg-title', (_e, result) => {
      setTitle(result);
      setInputValue('');
    });
  }, [setTitle]);

  const hide = () => {
    window.electron.ipcRenderer.send('dlg-hide');
  };

  const done = () => {
    window.electron.ipcRenderer.send('dlg-result', inputValue);
    hide();
  };

  return (
    <div className="draggable absolute inset-0 overflow-hidden bg-LynxRaisinBlack scrollbar-hide">
      <div className="size-full flex-row space-y-4 px-4 pt-4 text-center">
        <span className="dl-title w-full text-white">{title}</span>

        <Input
          onKeyDown={event => {
            if (event.key === 'Enter') {
              done();
            } else if (event.key === 'Escape') {
              hide();
            }
          }}
          size="sm"
          value={inputValue}
          className="notDraggable"
          onValueChange={setInputValue}
          autoFocus
        />

        <div className="space-x-3 text-end">
          <Button size="sm" onPress={hide} color="warning" className="notDraggable">
            Cancel
          </Button>

          <Button size="sm" onPress={done} color="success" className="notDraggable">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
