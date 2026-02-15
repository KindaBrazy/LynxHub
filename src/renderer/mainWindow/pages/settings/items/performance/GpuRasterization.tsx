import LynxSwitch from '@lynx/components/LynxSwitch';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function GpuRasterization() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    storageIpc.get('performance').then(data => {
      setEnabled(data.enableGpuRasterization);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('performance', {enableGpuRasterization: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'GPU Rasterization';
  const descriptionText = 'Uses GPU for page rendering. Improves scrolling and animation performance.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'gpu', 'rasterization', 'rendering', 'scroll', 'animation']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
