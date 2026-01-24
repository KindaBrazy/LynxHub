import LynxSwitch from '@lynx/components/LynxSwitch';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';

import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage app start minimized */
export default function StartMinimized() {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    storageIpc.get('app').then(app => {
      setIsSelected(app.startMinimized);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    storageIpc.update('app', {startMinimized: selected});
    setIsSelected(selected);
  }, []);

  return (
    <SettingsFilterItem
      searchTexts={['Start Minimized', 'startup', 'launch minimized', 'minimize', 'system tray', 'taskbar']}>
      <LynxSwitch
        enabled={isSelected}
        title="Start Minimized"
        onEnabledChange={onEnabledChange}
        description="Launch the app in a minimized state."
      />
    </SettingsFilterItem>
  );
}
