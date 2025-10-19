import {Select, Selection, SelectItem} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {DarkModeTypes} from '../../../../../../../../../cross/IpcChannelAndTypes';
import {appActions, useAppState} from '../../../../../../Redux/Reducer/AppReducer';
import {AppDispatch} from '../../../../../../Redux/Store';
import rendererIpc from '../../../../../../RendererIpc';
import useModeAnimation, {ThemeAnimationType} from './ThemeSwitchAnimationHook';

/** Manage app theme (Dark, Light, System) */
export default function SettingsGeneralTheme() {
  const dispatch = useDispatch<AppDispatch>();

  const darkMode = useAppState('darkMode');

  const {ref, toggleSwitchTheme} = useModeAnimation({
    animationType: ThemeAnimationType.QR_SCAN,
    isDarkMode: darkMode,
    duration: 1000,
    easing: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',
  });

  const [selectedTheme, setSelectedTheme] = useState<DarkModeTypes>('system');

  useEffect(() => {
    rendererIpc.storage.get('app').then(result => {
      if (result.darkMode) {
        setSelectedTheme(result.darkMode);
      }
    });
  }, []);

  const onThemeChange = useCallback(
    async (keys: Selection) => {
      if (keys === 'all') return;

      const newSelectedTheme = keys.values().next().value as DarkModeTypes;

      let nextEffectiveMode: 'dark' | 'light';
      if (newSelectedTheme === 'system') {
        nextEffectiveMode = await rendererIpc.win.getSystemDarkMode();
      } else {
        nextEffectiveMode = newSelectedTheme;
      }

      const newIsDarkMode = nextEffectiveMode === 'dark';

      const themeIsChanging = newIsDarkMode !== darkMode;

      const applyThemeChanges = () => {
        dispatch(appActions.setAppState({key: 'darkMode', value: newIsDarkMode}));

        rendererIpc.win.setDarkMode(newSelectedTheme);
        setSelectedTheme(newSelectedTheme);
      };

      if (themeIsChanging) {
        await toggleSwitchTheme();
        applyThemeChanges();
      } else {
        applyThemeChanges();
      }
    },
    [dispatch, darkMode, toggleSwitchTheme],
  );

  return (
    <Select
      ref={ref}
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
