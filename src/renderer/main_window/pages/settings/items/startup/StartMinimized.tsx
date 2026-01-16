import {useCallback, useEffect, useState} from 'react';

import LynxSwitch from '../../../../components/LynxSwitch';
import rendererIpc from '../../../../services/RendererIpc';
import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage app start minimized */
export default function StartMinimized() {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      setIsSelected(app.startMinimized);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {startMinimized: selected});
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
