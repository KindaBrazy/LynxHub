import rendererIpc from '@lynx_shared/ipc';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {AppDispatch} from '../../../../redux/store';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function VideoDecoding() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.enableAcceleratedVideoDecode);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {enableAcceleratedVideoDecode: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'Hardware Video Decoding';
  const descriptionText = 'Uses GPU for video decoding. Disable if experiencing video playback issues or crashes.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'video', 'decode', 'gpu', 'hardware', 'playback']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
