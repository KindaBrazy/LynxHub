import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import LynxSwitch from '../../../../components/LynxSwitch';
import rendererIpc from '../../../../ipc';
import {AppDispatch} from '../../../../redux/store';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function Wasm() {
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
