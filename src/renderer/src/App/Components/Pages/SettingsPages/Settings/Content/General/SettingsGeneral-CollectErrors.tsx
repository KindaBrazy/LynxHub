import {useCallback, useEffect, useState} from 'react';

import {onBreadcrumbStateChange} from '../../../../../../../../Breadcrumbs';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsGeneralCollectErrors() {
  const [collectErrors, setCollectErrors] = useState<boolean>(true);
  const [addBreadcrumbs, setAddBreadcrumbs] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setCollectErrors(result.collectErrors);
      setAddBreadcrumbs(result.addBreadcrumbs);
    });
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

  const onBreadcrumbChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {addBreadcrumbs: selected});
    setAddBreadcrumbs(selected);
    onBreadcrumbStateChange(selected);
  }, []);

  return (
    <>
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

      <LynxSwitch
        description={
          <span>
            Collect minimal UI interactions and send them with error reports. This data is anonymous and only sent when
            errors occur, helping to better trace what happened before the error.
          </span>
        }
        enabled={addBreadcrumbs}
        isDisabled={!collectErrors}
        title="Include User Interactions"
        onEnabledChange={onBreadcrumbChange}
      />
    </>
  );
}
