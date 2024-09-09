import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback, useEffect, useState} from 'react';

import {TaskbarStatus} from '../../../../../../../../../cross/IpcChannelAndTypes';
import rendererIpc from '../../../../../../RendererIpc';

/** App taskbar and tray behavior */
export default function SettingsGeneralTaskbar() {
  const [selectedKey, setSelectedKey] = useState<TaskbarStatus>('taskbar-tray');

  const onChange = useCallback((keys: Selection) => {
    if (keys !== 'all') {
      const value = keys.values().next().value;
      rendererIpc.win.setTaskBarStatus(value);
      setSelectedKey(value);
    }
  }, []);

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setSelectedKey(result.taskbarStatus);
    });
  }, []);

  return (
    <Select
      description={
        window.osPlatform === 'darwin'
          ? 'Select how the app should appear in the dock and system tray.'
          : 'Select how the app should appear in the taskbar and system tray.'
      }
      radius="sm"
      labelPlacement="outside"
      selectedKeys={[selectedKey]}
      onSelectionChange={onChange}
      classNames={{trigger: 'cursor-default'}}
      label={window.osPlatform === 'darwin' ? 'Dock Options' : 'Taskbar Options'}
      disallowEmptySelection>
      <SelectItem key="taskbar-tray" className="cursor-default">
        {window.osPlatform === 'darwin' ? 'Dock & Tray' : 'Taskbar & Tray'}
      </SelectItem>
      <SelectItem key="taskbar" className="cursor-default">
        {window.osPlatform === 'darwin' ? 'Dock Only' : 'Taskbar Only'}
      </SelectItem>
      {window.osPlatform === 'linux' ? (
        <SelectItem key="!" className="hidden" textValue="Nothing" />
      ) : (
        <SelectItem key="tray" className="cursor-default">
          {window.osPlatform === 'darwin' ? 'Tray Only' : 'Tray Only'}
        </SelectItem>
      )}
      <SelectItem
        description={
          window.osPlatform === 'darwin'
            ? 'Show in the dock when focused, move to tray when minimized.'
            : 'Show in the taskbar when focused, move to tray when minimized.'
        }
        key="tray-minimized"
        className="cursor-default">
        {window.osPlatform === 'darwin'
          ? 'Dock when focused, Tray when minimized'
          : 'Taskbar when focused, Tray when minimized'}
      </SelectItem>
    </Select>
  );
}
