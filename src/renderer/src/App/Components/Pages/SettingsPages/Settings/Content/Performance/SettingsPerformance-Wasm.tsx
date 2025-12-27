import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import {showRestartModal} from '../../../../../../Utils/RestartModalUtils';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceWasm() {
  const dispatch = useDispatch<AppDispatch>();
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setEnabled(data.enableWebAssemblySimd);
    });
  }, []);

  const onEnabledChange = useCallback(
    (selected: boolean) => {
      rendererIpc.storage.update('performance', {enableWebAssemblySimd: selected});
      setEnabled(selected);
      showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
    },
    [dispatch],
  );

  const titleText = 'WebAssembly SIMD';
  const descriptionText = 'Enables SIMD optimizations for WebAssembly applications. Improves WASM performance.';

  return (
    <SettingsFilterItem searchTexts={[titleText, descriptionText, 'webassembly', 'wasm', 'simd', 'performance']}>
      <LynxSwitch title={titleText} enabled={enabled} description={descriptionText} onEnabledChange={onEnabledChange} />
    </SettingsFilterItem>
  );
}
