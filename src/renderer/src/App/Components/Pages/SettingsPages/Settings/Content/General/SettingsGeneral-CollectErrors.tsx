import {useCallback, useEffect, useState} from 'react';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';

export default function SettingsGeneralCollectErrors() {
  const [collectErrors, setCollectErrors] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setCollectErrors(result.collectErrors);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('app', {collectErrors: selected});
    setCollectErrors(selected);
  }, []);

  return (
    <LynxSwitch
      description={
        <span>
          Allow anonymous error reporting to help me identify issues and improve your experience in future updates
        </span>
      }
      enabled={collectErrors}
      title="Help Improve LynxHub"
      onEnabledChange={onEnabledChange}
    />
  );
}
