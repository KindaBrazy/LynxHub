import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

/** Manage app start minimized */
export default function SettingsStartupStartMinimized() {
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
    <LynxSwitch
      enabled={isSelected}
      title="Start Minimized"
      onEnabledChange={onEnabledChange}
      description="Launch the app in a minimized state."
    />
  );
}
