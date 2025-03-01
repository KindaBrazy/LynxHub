import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useState} from 'react';
import {useDispatch} from 'react-redux';

import {TooltipStatus} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {settingsActions, useSettingsState} from '../../../../../../Redux/Reducer/SettingsReducer';
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
        const value = keys.values().next().value as TooltipStatus;
        dispatch(settingsActions.setSettingsState({key: 'tooltipLevel', value}));
        rendererIpc.storage.update('app', {tooltipStatus: value});
        setSelectedKey(value);
      }
    },
    [dispatch],
  );

  return (
    <Select
      label="Tooltip Behavior"
      labelPlacement="outside"
      selectedKeys={[selectedKey]}
      onSelectionChange={onChange}
      classNames={{trigger: 'cursor-default !transition !duration-300'}}
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
