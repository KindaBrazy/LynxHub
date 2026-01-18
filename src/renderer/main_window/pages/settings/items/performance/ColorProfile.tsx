import {Select, Selection, SelectItem} from '@heroui/react';
import rendererIpc from '@lynx_shared/ipc';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {AppDispatch} from '../../../../redux/store';
import {showRestartModal} from '../../../../utils';
import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

type ColorProfile = 'default' | 'srgb' | 'display-p3' | 'color-spin-gamma24';

export default function ColorProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedKey, setSelectedKey] = useState<string>('default');

  useEffect(() => {
    rendererIpc.storage.get('performance').then(data => {
      setSelectedKey(data.forceColorProfile);
    });
  }, []);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as ColorProfile;
        rendererIpc.storage.update('performance', {forceColorProfile: value});
        setSelectedKey(value);
        showRestartModal(dispatch, 'To apply performance changes, please restart the app.');
      }
    },
    [dispatch],
  );

  const labelText = 'Force Color Profile';
  const descriptionText = 'Forces a specific color output profile. Use sRGB for standard displays.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'color', 'profile', 'srgb', 'display']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
        disallowEmptySelection>
        <SelectItem key="default" className="cursor-default" description="Use system default color profile.">
          Default
        </SelectItem>
        <SelectItem key="srgb" className="cursor-default" description="Standard color profile for most displays.">
          sRGB
        </SelectItem>
        <SelectItem key="display-p3" className="cursor-default" description="Wide color gamut for compatible displays.">
          Display P3
        </SelectItem>
        <SelectItem key="color-spin-gamma24" className="cursor-default" description="Alternative gamma curve.">
          Color Spin (Gamma 2.4)
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
