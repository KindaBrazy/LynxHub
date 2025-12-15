import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceGpuSelection() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.forceHighPerformanceGpu);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {forceHighPerformanceGpu: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

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
