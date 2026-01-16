import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {AppDispatch} from '../../../../redux/store';
import rendererIpc from '../../../../services/RendererIpc';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function GpuRasterization() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.enableGpuRasterization);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {enableGpuRasterization: selected});
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
