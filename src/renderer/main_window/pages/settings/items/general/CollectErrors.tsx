import {useCallback, useEffect, useState} from 'react';

import {onBreadcrumbStateChange} from '../../../../../shared/sentry/Breadcrumbs';
import LynxSwitch from '../../../../components/LynxSwitch';
import rendererIpc from '../../../../services/RendererIpc';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function CollectErrors() {
  const [collectErrors, setCollectErrors] = useState<boolean>(true);
  const [addBreadcrumbs, setAddBreadcrumbs] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setCollectErrors(result.collectErrors);
      setAddBreadcrumbs(result.addBreadcrumbs);
    });
  }, []);

  const onBreadcrumbChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {addBreadcrumbs: selected});
    setAddBreadcrumbs(selected);
    onBreadcrumbStateChange(selected);
  }, []);

  useEffect(() => {
    if (!collectErrors && addBreadcrumbs) {
      onBreadcrumbChange(false);
    }
  }, [addBreadcrumbs, collectErrors]);

  const onErrorChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {collectErrors: selected});
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
