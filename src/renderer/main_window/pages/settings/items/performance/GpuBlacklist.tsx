import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import {AppDispatch} from '../../../../redux/store';
import rendererIpc from '../../../../services/RendererIpc';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function GpuBlacklist() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.ignoreGpuBlacklist);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {ignoreGpuBlacklist: selected});
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
