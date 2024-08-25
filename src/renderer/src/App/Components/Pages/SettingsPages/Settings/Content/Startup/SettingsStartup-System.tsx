import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

/** Manage launch app on system startup */
export default function SettingsStartupSystem() {
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
    <LynxSwitch
      enabled={isSelected}
      title="Launch on System Startup"
      onEnabledChange={onEnabledChange}
      description="Automatically start the app when the system boots up."
    />
  );
}
