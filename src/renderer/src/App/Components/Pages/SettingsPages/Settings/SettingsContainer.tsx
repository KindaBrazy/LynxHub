import {useMemo} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import SettingsBrowser, {SettingsBrowserId} from './Content/Browser/SettingsBrowser';
import SettingsCard, {SettingsCardId} from './Content/Card/Settings-Card';
import SettingsGeneral, {SettingsGeneralId} from './Content/General/Settings-General';
import {HotkeySettings, SettingsHotkeysId} from './Content/HotkeySettings';
import SettingsClear, {SettingsClearId} from './Content/Settings-Clear';
import SettingsData, {SettingsDataId} from './Content/Settings-Data';
import SettingsDiscord, {SettingsDiscordId} from './Content/Settings-Discord';
import SettingsStartup, {SettingsStartupId} from './Content/Startup/Settings-Startup';
import SettingsTerminal, {SettingsTerminalId} from './Content/Terminal/Settings-Terminal';

export const settingsSectionId = {
  SettingsCardId,
  SettingsGeneralId,
  SettingsTerminalId,
  SettingsBrowserId,
  SettingsStartupId,
  SettingsClearId,
  SettingsDataId,
  SettingsDiscordId,
  SettingsHotkeysId,
};

export const SettingsSections = () => {
  const content = useMemo(() => extensionsData.customizePages.settings.add.content, []);

  return (
    <>
      <SettingsGeneral />
      <SettingsStartup />
      <SettingsCard />
      <SettingsTerminal />
      <SettingsBrowser />
      <HotkeySettings />
      <SettingsDiscord />

      <SettingsData />
      <SettingsClear />

      {content.map((Content, index) => (
        <Content key={index} />
      ))}
    </>
  );
};
