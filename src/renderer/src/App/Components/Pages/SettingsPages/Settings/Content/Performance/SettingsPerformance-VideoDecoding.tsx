import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import {ShowRestartModal} from '../../../Plugins/Elements';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceVideoDecoding() {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.enableAcceleratedVideoDecode);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('performance', {enableAcceleratedVideoDecode: selected});
    setEnabled(selected);
    ShowRestartModal('To apply performance changes, please restart the app.');
  }, []);

  const titleText = 'Hardware Video Decoding';
  const descriptionText = 'Uses GPU for video decoding. Disable if experiencing video playback issues or crashes.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'video', 'decode', 'gpu', 'hardware', 'playback']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
