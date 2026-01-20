import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';

import LynxSwitch from '../../../../components/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

/** Manage app reopen page */
export default function StartPage() {
  const [isSelected, setIsSelected] = useState<boolean>(true);

  useEffect(() => {
    storageIpc.get('app').then(app => {
      setIsSelected(app.startupLastActivePage);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    storageIpc.update('app', {startupLastActivePage: selected});
    setIsSelected(selected);
  }, []);

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
        enabled={isSelected}
        title="Resume Last Session"
        onEnabledChange={onEnabledChange}
        description={'Resume the last active page when reopening the app.\nIf disabled, the Home page will be shown.'}
      />
    </SettingsFilterItem>
  );
}
