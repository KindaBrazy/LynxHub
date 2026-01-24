import LynxSwitch from '@lynx/components/LynxSwitch';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';

export default function GpuBlacklist() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    storageIpc.get('performance').then(data => {
      setEnabled(data.ignoreGpuBlacklist);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      storageIpc.update('performance', {ignoreGpuBlacklist: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'Ignore GPU Blacklist';
  const descriptionText =
    '⚠️ Overrides GPU driver compatibility checks. May cause crashes or visual' +
    ' artifacts on older or unsupported hardware.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'gpu', 'blacklist', 'driver', 'compatibility', 'crash']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
