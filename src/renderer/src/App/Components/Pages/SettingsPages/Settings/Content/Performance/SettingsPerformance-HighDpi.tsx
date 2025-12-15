import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceHighDpi() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.highDpiSupport);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {highDpiSupport: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'High DPI Support';
  const descriptionText = 'Enables better scaling on high-resolution displays. Useful for 4K monitors.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'dpi', 'high resolution', '4k', 'scaling', 'display']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
