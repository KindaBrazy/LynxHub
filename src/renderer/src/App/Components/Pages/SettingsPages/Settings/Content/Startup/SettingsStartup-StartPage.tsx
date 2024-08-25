import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

/** Manage app reopen page */
export default function SettingsStartupStartPage() {
  const [isSelected, setIsSelected] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('app').then(app => {
      setIsSelected(app.startupLastActivePage);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {startupLastActivePage: selected});
    setIsSelected(selected);
  }, []);

  return (
    <LynxSwitch
      enabled={isSelected}
      title="Resume Last Session"
      onEnabledChange={onEnabledChange}
      description={'Resume the last active page when reopening the app.\nIf disabled, the Home page will be shown.'}
    />
  );
}
