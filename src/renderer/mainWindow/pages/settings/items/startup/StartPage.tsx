import LynxSwitch from '@lynx/components/LynxSwitch';
import storageIpc from '@lynx_shared/ipc/storage';
import {useEffect, useState} from 'react';

import SettingsFilterItem from '../../SettingsFilterItem';

/**
 * Settings toggle to manage resuming the last session on startup.
 */
export default function StartPage() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    storageIpc.get('app').then(app => {
      if (isMounted) setIsEnabled(app.startupLastActivePage);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEnabledChange = (enabled: boolean) => {
    storageIpc.update('app', {startupLastActivePage: enabled});
    setIsEnabled(enabled);
  };

  return (
    <SettingsFilterItem
      searchTexts={[
        'Resume Last Session',
        'resume last session',
        'last active page',
        'startup page',
        'home page',
        'startup',
      ]}>
      <LynxSwitch
        enabled={isEnabled}
        title="Resume Last Session"
        onEnabledChange={handleEnabledChange}
        description={'Resume the last active page when reopening the app.\nIf disabled, the Home page will be shown.'}
      />
    </SettingsFilterItem>
  );
}
