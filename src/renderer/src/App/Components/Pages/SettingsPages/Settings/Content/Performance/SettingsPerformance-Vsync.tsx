import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import {ShowRestartModal} from '../../../Plugins/Elements';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceVsync() {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.disableGpuVsync);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('performance', {disableGpuVsync: selected});
    setEnabled(selected);
    ShowRestartModal('To apply performance changes, please restart the app.');
  }, []);

  const titleText = 'Disable GPU VSync';
  const descriptionText = '⚠️ May cause screen tearing but reduces input latency.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'vsync', 'tearing', 'latency', 'input lag', 'gaming']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
