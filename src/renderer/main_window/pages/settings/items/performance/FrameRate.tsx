import rendererIpc from '@lynx_shared/ipc';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {AppDispatch} from '../../../../redux/store';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function FrameRate() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.disableFrameRateLimit);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {disableFrameRateLimit: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'Disable Frame Rate Limit';
  const descriptionText =
    '⚠️ Removes FPS cap. May increase power consumption and heat generation on less powerful devices.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'fps', 'frame rate', 'limit', 'power', 'heat']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
