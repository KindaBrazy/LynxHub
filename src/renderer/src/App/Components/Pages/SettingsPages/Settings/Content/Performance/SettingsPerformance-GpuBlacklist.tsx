import { useCallback, useEffect, useState } from 'react';

import { ShowRestartModal } from '../../../Plugins/Elements';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceGpuBlacklist() {
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        rendererIpc.storage.get('performance').then(data => {
            setEnabled(data.ignoreGpuBlacklist);
        });
    }, []);

    const onEnabledChange = useCallback((selected: boolean) => {
        rendererIpc.storage.update('performance', { ignoreGpuBlacklist: selected });
        setEnabled(selected);
        ShowRestartModal('To apply performance changes, please restart the app.');
    }, []);

    const titleText = 'Ignore GPU Blacklist';
    const descriptionText = '⚠️ Overrides GPU driver compatibility checks. May cause crashes or visual artifacts on older or unsupported hardware.';

    return (
        <SettingsFilterItem searchTexts={[titleText, descriptionText, 'gpu', 'blacklist', 'driver', 'compatibility', 'crash']}>
            <LynxSwitch
                title={titleText}
                description={descriptionText}
                enabled={enabled}
                onEnabledChange={onEnabledChange}
            />
        </SettingsFilterItem>
    );
}
