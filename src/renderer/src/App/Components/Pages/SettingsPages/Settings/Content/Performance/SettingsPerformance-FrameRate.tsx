import { useCallback, useEffect, useState } from 'react';

import { ShowRestartModal } from '../../../Plugins/Elements';
import rendererIpc from '../../../../../../RendererIpc';
import LynxSwitch from '../../../../../Reusable/LynxSwitch';
import SettingsFilterItem from '../../SettingsFilterItem';

export default function SettingsPerformanceFrameRate() {
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        rendererIpc.storage.get('performance').then(data => {
            setEnabled(data.disableFrameRateLimit);
        });
    }, []);

    const onEnabledChange = useCallback((selected: boolean) => {
        rendererIpc.storage.update('performance', { disableFrameRateLimit: selected });
        setEnabled(selected);
        ShowRestartModal('To apply performance changes, please restart the app.');
    }, []);

    const titleText = 'Disable Frame Rate Limit';
    const descriptionText = '⚠️ Removes FPS cap. May increase power consumption and heat generation on less powerful devices.';

    return (
        <SettingsFilterItem searchTexts={[titleText, descriptionText, 'fps', 'frame rate', 'limit', 'power', 'heat']}>
            <LynxSwitch
                title={titleText}
                description={descriptionText}
                enabled={enabled}
                onEnabledChange={onEnabledChange}
            />
        </SettingsFilterItem>
    );
}
