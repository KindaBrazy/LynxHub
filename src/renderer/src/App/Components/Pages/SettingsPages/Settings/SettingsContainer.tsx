import {useMemo} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import SettingsCard, {SettingsCardId} from './Content/Card/Settings-Card';
import SettingsGeneral, {SettingsGeneralId} from './Content/General/Settings-General';
import SettingsClear, {SettingsClearId} from './Content/Settings-Clear';
import SettingsData, {SettingsDataId} from './Content/Settings-Data';
import SettingsDiscord, {SettingsDiscordId} from './Content/Settings-Discord';
import SettingsHotkeys, {SettingsHotkeysId} from './Content/Settings-Hotkeys';
import SettingsStartup, {SettingsStartupId} from './Content/Startup/Settings-Startup';
import SettingsTerminal, {SettingsTerminalId} from './Content/Terminal/Settings-Terminal';

export const settingsSectionId = {
  SettingsCardId,
  SettingsGeneralId,
  SettingsTerminalId,
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
      <SettingsCard />
      <SettingsGeneral />
      <SettingsTerminal />
      <SettingsStartup />
      <SettingsHotkeys />
      <SettingsDiscord />

      <SettingsData />
      <SettingsClear />

      {content.map((Content, index) => (
        <Content key={index} />
      ))}
    </>
  );
};
