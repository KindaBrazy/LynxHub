import {Select, Selection, SelectItem} from '@nextui-org/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DarkModeTypes} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {appActions, useAppState} from '../../../../../../Redux/App/AppReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';

/** Manage app theme (Dark, Light, System) */
export default function SettingsGeneralTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const darkMode = useAppState('darkMode');

  const [selectedTheme, setSelectedTheme] = useState(darkMode ? 'dark' : 'light');

  const onThemeChange = useCallback(
    (keys: Selection) => {
      if (keys !== 'all') {
        const value = keys.values().next().value as DarkModeTypes;
        dispatch(appActions.setAppState({key: 'darkMode', value: value !== 'light'}));
        rendererIpc.win.setDarkMode(value);
        setSelectedTheme(value);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      setSelectedTheme(result.darkMode);
    });
  }, [darkMode]);

  return (
    <Select
      label="Theme"
      labelPlacement="outside"
      selectedKeys={[selectedTheme]}
      onSelectionChange={onThemeChange}
      description="Select the appearance theme."
      classNames={{trigger: 'cursor-default !transition !duration-300'}}
      disallowEmptySelection>
      <SelectItem key="dark" className="cursor-default">
        Dark
      </SelectItem>
      <SelectItem key="light" className="cursor-default">
        Light
      </SelectItem>
      <SelectItem
        key="system"
        className="cursor-default"
        description="Automatically switch theme based on system settings.">
        System Default
      </SelectItem>
    </Select>
  );
}
