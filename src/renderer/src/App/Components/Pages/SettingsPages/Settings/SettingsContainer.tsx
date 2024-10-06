import SettingsCard, {SettingsCardId} from './Content/Card/Settings-Card';
import SettingsGeneral, {SettingsGeneralId} from './Content/General/Settings-General';
import SettingsClear, {SettingsClearId} from './Content/Settings-Clear';
import SettingsData, {SettingsDataId} from './Content/Settings-Data';
import SettingsDiscord, {SettingsDiscordId} from './Content/Settings-Discord';
import SettingsHotkeys, {SettingsHotkeysId} from './Content/Settings-Hotkeys';
import SettingsStartup, {SettingsStartupId} from './Content/Startup/Settings-Startup';

export const settingsSectionId = {
  SettingsCardId,
  SettingsGeneralId,
  SettingsStartupId,
  SettingsClearId,
  SettingsDataId,
  SettingsDiscordId,
  SettingsHotkeysId,
};

export const SettingsSections = () => (
  <>
    <SettingsCard />
    <SettingsGeneral />
    <SettingsStartup />
    <SettingsHotkeys />
    <SettingsDiscord />

    <SettingsData />
    <SettingsClear />
  </>
);
