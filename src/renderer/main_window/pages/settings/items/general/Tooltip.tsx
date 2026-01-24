import {Select, Selection, SelectItem} from '@heroui/react';
import {settingsActions, useSettingsState} from '@lynx/redux/reducers/settings';
import {AppDispatch} from '@lynx/redux/store';
import {TooltipStatus} from '@lynx_common/types/ipc';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/** Manage tooltip behavior */
export default function Tooltip() {
  const dispatch = useDispatch<AppDispatch>();
  const tooltipStatus = useSettingsState('tooltipLevel');
  const [selectedKey, setSelectedKey] = useState<string>(tooltipStatus);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as TooltipStatus;
        dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value}));
        storageIpc.update('app', {tooltipStatus: value});
        setSelectedKey(value);
      }
    },
    [dispatch],
  );

  const labelText = 'Tooltip Behavior';
  const descriptionText = 'Select the level of tooltips when hovering over elements.';

  return (
    <SettingsFilterItem
      searchTexts={[labelText, descriptionText, 'tooltip', 'tooltips', 'hover', 'help', 'hint', 'ui tips']}>
      <Select
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedKey]}
        onSelectionChange={onChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
        disallowEmptySelection>
        <SelectItem key="essential" className="cursor-default" description="Show tooltips for essential elements only.">
          Essential
        </SelectItem>
        <SelectItem
          key="full"
          className="cursor-default"
          description="Show tooltips for all buttons, tabs, and elements.">
          Full
        </SelectItem>
        <SelectItem key="none" className="cursor-default" description="Disable tooltips completely.">
          None
        </SelectItem>
      </Select>
    </SettingsFilterItem>
  );
}
