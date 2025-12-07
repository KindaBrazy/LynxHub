import { Select, Selection, SelectItem } from '@heroui/react';
import { useCallback, useEffect, useState } from 'react';

import { ShowRestartModal } from '../../../Plugins/Elements';
import rendererIpc from '../../../../../../RendererIpc';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

type AutoplayPolicy = 'default' | 'no-user-gesture-required' | 'user-gesture-required' | 'document-user-activation-required';

export default function SettingsPerformanceAutoplay() {
    const [selectedKey, setSelectedKey] = useState<string>('default');

    useEffect(() => {
        rendererIpc.storage.get('performance').then(data => {
            setSelectedKey(data.autoplayPolicy);
        });
    }, []);

    const onChange = useCallback((keys: Selection) => {
        if (keys !== 'all') {
            const value = keys.values().next().value as AutoplayPolicy;
            rendererIpc.storage.update('performance', { autoplayPolicy: value });
            setSelectedKey(value);
            ShowRestartModal('To apply performance changes, please restart the app.');
        }
    }, []);

    const labelText = 'Media Autoplay Policy';
    const descriptionText = 'Controls autoplay behavior for audio and video elements in web pages.';

    return (
        <SettingsFilterItem searchTexts={[labelText, descriptionText, 'autoplay', 'media', 'video', 'audio']}>
            <Select
                labelPlacement="outside"
                selectedKeys={[selectedKey]}
                onSelectionChange={onChange}
                label={<SettingsSearchHighlight text={labelText} />}
                description={<SettingsSearchHighlight text={descriptionText} />}
                classNames={{ trigger: 'cursor-default !transition !duration-300' }}
                disallowEmptySelection>
                <SelectItem key="default" className="cursor-default" description="Use browser default autoplay behavior.">
                    Default
                </SelectItem>
                <SelectItem key="no-user-gesture-required" className="cursor-default" description="Allow autoplay without user interaction.">
                    Allow Autoplay
                </SelectItem>
                <SelectItem key="user-gesture-required" className="cursor-default" description="Require user click before playback.">
                    Require Gesture
                </SelectItem>
                <SelectItem key="document-user-activation-required" className="cursor-default" description="Require page interaction before playback.">
                    Require Page Activation
                </SelectItem>
            </Select>
        </SettingsFilterItem>
    );
}
