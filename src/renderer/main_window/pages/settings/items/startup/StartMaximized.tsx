import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';

import LynxSwitch from '../../../../components/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage app start minimized */
export default function StartMaximized() {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    storageIpc.get('app').then(app => {
      setIsSelected(app.startMaximized);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    storageIpc.update('app', {startMaximized: selected});
    setIsSelected(selected);
  }, []);

  return (
    <SettingsFilterItem
      searchTexts={['Start Maximized', 'startup', 'launch maximized', 'maximize window', 'window size']}>
      <LynxSwitch
        enabled={isSelected}
        title="Start Maximized"
        onEnabledChange={onEnabledChange}
        description="Launch the app in a maximized state."
      />
    </SettingsFilterItem>
  );
}
