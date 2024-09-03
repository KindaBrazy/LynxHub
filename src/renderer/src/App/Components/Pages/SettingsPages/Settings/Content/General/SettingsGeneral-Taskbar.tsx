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
      radius="sm"
      label="Taskbar Options"
      labelPlacement="outside"
      selectedKeys={[selectedKey]}
      onSelectionChange={onChange}
      classNames={{trigger: 'cursor-default'}}
      description="Select how the app should appear in the taskbar or system tray."
      disallowEmptySelection>
      <SelectItem key="taskbar-tray" className="cursor-default">
        Taskbar & Tray
      </SelectItem>
      <SelectItem key="taskbar" className="cursor-default">
        Taskbar Only
      </SelectItem>
      {window.osPlatform === 'linux' ? (
        <SelectItem key="!" className="hidden" textValue="Nothing" />
      ) : (
        <SelectItem key="tray" className="cursor-default">
          System Tray Only
        </SelectItem>
      )}
      <SelectItem
        key="tray-minimized"
        className="cursor-default"
        description="Show in the taskbar when focused, move to system tray when minimized.">
        Taskbar when focused, Tray when minimized
      </SelectItem>
    </Select>
  );
}
