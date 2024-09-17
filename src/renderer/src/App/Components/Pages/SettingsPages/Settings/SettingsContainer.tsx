import SettingsGeneral, {SettingsGeneralId} from './Content/General/Settings-General';
import SettingsClear, {SettingsClearId} from './Content/Settings-Clear';
import SettingsData, {SettingsDataId} from './Content/Settings-Data';
import SettingsDiscord, {SettingsDiscordId} from './Content/Settings-Discord';
import SettingsHotkeys, {SettingsHotkeysId} from './Content/Settings-Hotkeys';
import SettingsStartup, {SettingsStartupId} from './Content/Startup/Settings-Startup';

export const settingsSectionId = {
  SettingsGeneralId,
  SettingsStartupId,
  SettingsClearId,
  SettingsDataId,
  SettingsDiscordId,
  SettingsHotkeysId,
};

export const SettingsSections = () => (
  <>
    <SettingsGeneral />
    <SettingsStartup />
    <SettingsHotkeys />
    <SettingsDiscord />

    <SettingsData />
    <SettingsClear />
  </>
);
