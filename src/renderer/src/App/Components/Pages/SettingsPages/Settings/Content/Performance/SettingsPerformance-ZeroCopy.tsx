import { useCallback, useEffect, useState } from 'react';

import { ShowRestartModal } from '../../../Plugins/Elements';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceZeroCopy() {
    const [enabled, setEnabled] = useState<boolean>(true);

    useEffect(() => {
        rendererIpc.storage.get('performance').then(data => {
            setEnabled(data.enableZeroCopy);
        });
    }, []);

    const onEnabledChange = useCallback((selected: boolean) => {
        rendererIpc.storage.update('performance', { enableZeroCopy: selected });
        setEnabled(selected);
        ShowRestartModal('To apply performance changes, please restart the app.');
    }, []);

    const titleText = 'Zero-Copy GPU Buffers';
    const descriptionText = 'Optimizes GPU memory transfers. Disable if experiencing rendering artifacts.';

    return (
        <SettingsFilterItem searchTexts={[titleText, descriptionText, 'zero copy', 'gpu', 'memory', 'buffer', 'artifact']}>
            <LynxSwitch
                title={titleText}
                description={descriptionText}
                enabled={enabled}
                onEnabledChange={onEnabledChange}
            />
        </SettingsFilterItem>
    );
}
