import {useCallback, useEffect, useState} from 'react';

import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import {ShowRestartModal} from '../../../Plugins/Elements';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceHighDpi() {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.highDpiSupport);
    });
  }, []);

  const onEnabledChange = useCallback((selected: boolean) => {
    rendererIpc.storage.update('performance', {highDpiSupport: selected});
    setEnabled(selected);
    ShowRestartModal('To apply performance changes, please restart the app.');
  }, []);

  const titleText = 'High DPI Support';
  const descriptionText = 'Enables better scaling on high-resolution displays. Useful for 4K monitors.';

  return (
    <SettingsFilterItem
      searchTexts={[titleText, descriptionText, 'dpi', 'high resolution', '4k', 'scaling', 'display']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
