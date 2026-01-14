import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';

import {TaskbarStatus} from '../../../../../../../../../cross/IpcChannelAndTypes';
import rendererIpc from '../../../../../../RendererIpc';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/** App taskbar and tray behavior */
export default function SettingsGeneralTaskbar() {
  const [selectedKey, setSelectedKey] = useState<TaskbarStatus>('taskbar-tray');

  const onChange = useCallback((keys: Selection) => {
    if (keys !== 'all') {
      const value = keys.values().next().value as TaskbarStatus;
      rendererIpc.win.setTaskBarStatus(value);
      setSelectedKey(value);
    }
  }, []);

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setSelectedKey(result.taskbarStatus);
    });
  }, []);

  const isDarwin = window.osPlatform === 'darwin';
  const isLinux = window.osPlatform === 'linux';
  const labelText = isDarwin ? 'Dock Options' : 'Taskbar Options';
  const descriptionText = isDarwin
    ? 'Select how the app should appear in the dock and system tray.'
    : 'Select how the app should appear in the taskbar and system tray.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'taskbar', 'dock', 'tray']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
        disallowEmptySelection>
        <SelectItem key="taskbar-tray" className="cursor-default">
          {isDarwin ? 'Dock & Tray' : 'Taskbar & Tray'}
        </SelectItem>
        <SelectItem key="taskbar" className="cursor-default">
          {isDarwin ? 'Dock Only' : 'Taskbar Only'}
        </SelectItem>
        {isLinux ? (
          <SelectItem key="!" className="hidden" textValue="Nothing" />
        ) : (
          <SelectItem key="tray" className="cursor-default">
            {isDarwin ? 'Tray Only' : 'Tray Only'}
          </SelectItem>
        )}
        <SelectItem
          description={
            isDarwin
              ? 'Show in the dock when focused, move to tray when minimized.'
              : 'Show in the taskbar when focused, move to tray when minimized.'
          }
          key="tray-minimized"
          className="cursor-default">
          {isDarwin ? 'Dock when focused, Tray when minimized' : 'Taskbar when focused, Tray when minimized'}
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
