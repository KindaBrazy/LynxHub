import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import {ShowRestartModal} from '../../../Plugins/Elements';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceGpuSelection() {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.forceHighPerformanceGpu);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('performance', {forceHighPerformanceGpu: selected});
    setEnabled(selected);
    ShowRestartModal('To apply performance changes, please restart the app.');
  }, []);

  const titleText = 'Force High-Performance GPU';
  const descriptionText =
    'Uses dedicated GPU instead of integrated graphics. Useful for multi-GPU systems (laptops with discrete graphics).';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'gpu', 'dedicated', 'discrete', 'integrated', 'graphics', 'laptop']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
