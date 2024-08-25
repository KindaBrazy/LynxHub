import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {settingsActions, useSettingsState} from '../../../../../../Redux/App/SettingsReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';

/** Manage tooltip behavior */
export default function SettingsGeneralTooltip() {
  const dispatch = useDispatch<AppDispatch>();
  const tooltipStatus = useSettingsState('tooltipLevel');
  const [selectedKey, setSelectedKey] = useState<string>(tooltipStatus);

  const onChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value;
        dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value}));
        rendererIpc.storage.update('app', {tooltipStatus: value});
        setSelectedKey(value);
      }
    },
    [dispatch],
  );

  return (
    <Select
      radius="sm"
      label="Tooltip Behavior"
      labelPlacement="outside"
      selectedKeys={[selectedKey]}
      onSelectionChange={onChange}
      classNames={{trigger: 'cursor-default'}}
      description="Select the level of tooltips when hovering over elements."
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
  );
}
