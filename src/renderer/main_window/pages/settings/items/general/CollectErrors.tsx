import LynxSwitch from '@lynx/components/LynxSwitch';
import storageIpc from '@lynx_shared/ipc/storage';
import {onBreadcrumbStateChange} from '@lynx_shared/sentry/Breadcrumbs';
import {useCallback, useEffect, useState} from 'react';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function CollectErrors() {
  const [collectErrors, setCollectErrors] = useState<boolean>(true);
  const [addBreadcrumbs, setAddBreadcrumbs] = useState<boolean>(true);

  useEffect(() => {
    storageIpc.get('app').then(result => {
      setCollectErrors(result.collectErrors);
      setAddBreadcrumbs(result.addBreadcrumbs);
    });
  }, []);

  const onBreadcrumbChange = useCallback((selected: boolean) => {
    storageIpc.update('app', {addBreadcrumbs: selected});
    setAddBreadcrumbs(selected);
    onBreadcrumbStateChange(selected);
  }, []);

  useEffect(() => {
    if (!collectErrors && addBreadcrumbs) {
      onBreadcrumbChange(false);
    }
  }, [addBreadcrumbs, collectErrors]);

  const onErrorChange = useCallback((selected: boolean) => {
    storageIpc.update('app', {collectErrors: selected});
    setCollectErrors(selected);
  }, []);

  return (
    <>
      <SettingsFilterItem
        searchTexts={[
          'Help Improve LynxHub',
          'anonymous error reporting',
          'error reports',
          'improve your experience',
          'collect errors',
        ]}>
        <LynxSwitch
          description={
            <span>
              Allow anonymous error reporting to help me identify issues and improve your experience in future updates
            </span>
          }
          enabled={collectErrors}
          title="Help Improve LynxHub"
          onEnabledChange={onErrorChange}
        />
      </SettingsFilterItem>

      <SettingsFilterItem
        searchTexts={[
          'Include User Interactions',
          'collect minimal UI interactions',
          'user interactions',
          'breadcrumbs',
          'error reports',
        ]}>
        <LynxSwitch
          description={
            <span>
              Collect minimal UI interactions and send them with error reports. This data is anonymous and only sent
              when errors occur, helping to better trace what happened before the error.
            </span>
          }
          enabled={addBreadcrumbs}
          isDisabled={!collectErrors}
          title="Include User Interactions"
          onEnabledChange={onBreadcrumbChange}
        />
      </SettingsFilterItem>
    </>
  );
}
