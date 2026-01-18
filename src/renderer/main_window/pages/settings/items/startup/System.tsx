import rendererIpc from '@lynx_shared/ipc';
import {useCallback, useEffect, useState} from 'react';

import LynxSwitch from '../../../../components/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage launch app on system startup */
export default function System() {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      setIsSelected(app.systemStartup);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storageUtils.setSystemStartup(selected);
    setIsSelected(selected);
  }, []);

  return (
    <SettingsFilterItem
      searchTexts={[
        'Launch on System Startup',
        'system startup',
        'launch on startup',
        'auto start',
        'boot',
        'startup',
      ]}>
      <LynxSwitch
        enabled={isSelected}
        title="Launch on System Startup"
        onEnabledChange={onEnabledChange}
        description="Automatically start the app when the system boots up."
      />
    </SettingsFilterItem>
  );
}
