import {Select, Selection, SelectItem} from '@heroui/react';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

type AutoplayPolicy =
  | 'default'
  | 'no-user-gesture-required'
  | 'user-gesture-required'
  | 'document-user-activation-required';

export default function Autoplay() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedKey, setSelectedKey] = useState<string>('default');

  useEffect(() => {
    storageIpc.get('performance').then(data => {
      setSelectedKey(data.autoplayPolicy);
    });
  }, []);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as AutoplayPolicy;
        storageIpc.update('performance', {autoplayPolicy: value});
        setSelectedKey(value);
        showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
      }
    },
    [dispatch],
  );

  const labelText = 'Media Autoplay Policy';
  const descriptionText = 'Controls autoplay behavior for audio and video elements in web pages.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'autoplay', 'media', 'video', 'audio']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
        disallowEmptySelection>
        <SelectItem key="default" className="cursor-default" description="Use browser default autoplay behavior.">
          Default
        </SelectItem>
        <SelectItem
          className="cursor-default"
          key="no-user-gesture-required"
          description="Allow autoplay without user interaction.">
          Allow Autoplay
        </SelectItem>
        <SelectItem
          className="cursor-default"
          key="user-gesture-required"
          description="Require user click before playback.">
          Require Gesture
        </SelectItem>
        <SelectItem
          className="cursor-default"
          key="document-user-activation-required"
          description="Require page interaction before playback.">
          Require Page Activation
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
