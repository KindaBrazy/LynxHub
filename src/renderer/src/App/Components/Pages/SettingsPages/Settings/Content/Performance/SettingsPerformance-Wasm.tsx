import { useCallback, useEffect, useState } from 'react';

import { ShowRestartModal } from '../../../Plugins/Elements';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceWasm() {
    const [enabled, setEnabled] = useState<boolean>(true);

    useEffect(() => {
        rendererIpc.storage.get('performance').then(data => {
            setEnabled(data.enableWebAssemblySimd);
        });
    }, []);

    const onEnabledChange = useCallback((selected: boolean) => {
        rendererIpc.storage.update('performance', { enableWebAssemblySimd: selected });
        setEnabled(selected);
        ShowRestartModal('To apply performance changes, please restart the app.');
    }, []);

    const titleText = 'WebAssembly SIMD';
    const descriptionText = 'Enables SIMD optimizations for WebAssembly applications. Improves WASM performance.';

    return (
        <SettingsFilterItem searchTexts={[titleText, descriptionText, 'webassembly', 'wasm', 'simd', 'performance']}>
            <LynxSwitch
                title={titleText}
                description={descriptionText}
                enabled={enabled}
                onEnabledChange={onEnabledChange}
            />
        </SettingsFilterItem>
    );
}
