import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

/** Manage app start minimized */
export default function SettingsStartupStartMaximized() {
  const [isSelected, setIsSelected] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      setIsSelected(app.startMaximized);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {startMaximized: selected});
    setIsSelected(selected);
  }, []);

  return (
    <LynxSwitch
      enabled={isSelected}
      title="Start Maximized"
      onEnabledChange={onEnabledChange}
      description="Launch the app in a maximized state."
    />
  );
}
