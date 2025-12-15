import {useCallback, useEffect, useState} from 'react';

import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceVsync() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.disableGpuVsync);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {disableGpuVsync: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'Disable GPU VSync';
  const descriptionText = '⚠️ May cause screen tearing but reduces input latency.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'vsync', 'tearing', 'latency', 'input lag', 'gaming']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
