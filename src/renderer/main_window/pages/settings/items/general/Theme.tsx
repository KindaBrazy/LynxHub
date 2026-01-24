import {Select, Selection, SelectItem} from '@heroui/react';
import {appActions, useAppState} from '@lynx/redux/reducers/app';
import {AppDispatch} from '@lynx/redux/store';
import {DarkModeTypes} from '@lynx_common/types/ipc';
import applicationIpc from '@lynx_shared/ipc/application';
import storageIpc from '@lynx_shared/ipc/storage';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';
import useModeAnimation, {ThemeAnimationType} from './theme_switch';

/** Manage app theme (Dark, Light, System) */
export default function Theme() {
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
    storageIpc.get('app').then(({darkMode}) => {
      setSelectedTheme(darkMode);
    });
  }, []);

  const onThemeChange = useCallback(
    async (keys: Selection) => {
      if (keys === 'all') return;

      const newSelectedTheme = keys.values().next().value as DarkModeTypes;

      let nextEffectiveMode: 'dark' | 'light';
      if (newSelectedTheme === 'system') {
        nextEffectiveMode = await applicationIpc.invoke.getSystemDarkMode();
      } else {
        nextEffectiveMode = newSelectedTheme;
      }

      const newIsDarkMode = nextEffectiveMode === 'dark';

      const themeIsChanging = newIsDarkMode !== darkMode;

      const applyThemeChanges = () => {
        dispatch(appActions.setAppState({key: 'darkMode', value: newIsDarkMode}));

        applicationIpc.send.setDarkMode(newSelectedTheme);
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

  const labelText = 'Theme';
  const descriptionText = 'Select the appearance theme.';

  return (
    <SettingsFilterItem searchTexts={[labelText, descriptionText, 'theme', 'dark', 'light', 'system']}>
      <Select
        ref={ref}
        className="my-0!"
        labelPlacement="outside"
        selectedKeys={[selectedTheme]}
        onSelectionChange={onThemeChange}
        label={<SettingsSearchHighlight text={labelText} />}
        description={<SettingsSearchHighlight text={descriptionText} />}
        classNames={{trigger: 'cursor-default transition! duration-300!'}}
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
    </SettingsFilterItem>
  );
}
