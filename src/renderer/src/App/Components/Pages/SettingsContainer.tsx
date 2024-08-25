import SettingsGeneral, {SettingsGeneralId} from './SettingsPages/Settings/Content/General/Settings-General';
import SettingsAbout, {SettingsAboutId} from './SettingsPages/Settings/Content/Settings-About';
import SettingsClear, {SettingsClearId} from './SettingsPages/Settings/Content/Settings-Clear';
import SettingsData, {SettingsDataId} from './SettingsPages/Settings/Content/Settings-Data';
import SettingsDiscord, {SettingsDiscordId} from './SettingsPages/Settings/Content/Settings-Discord';
import SettingsHotkeys, {SettingsHotkeysId} from './SettingsPages/Settings/Content/Settings-Hotkeys';
import SettingsReportIssue, {SettingsReportIssueId} from './SettingsPages/Settings/Content/Settings-ReportIssue';
import SettingsStartup, {SettingsStartupId} from './SettingsPages/Settings/Content/Startup/Settings-Startup';

export const settingsSectionId = {
  SettingsGeneralId,
  SettingsStartupId,
  SettingsAboutId,
  SettingsClearId,
  SettingsDataId,
  SettingsDiscordId,
  SettingsHotkeysId,
  SettingsReportIssueId,
};

export const SettingsSections = () => (
  <>
    <SettingsGeneral />
    <SettingsStartup />
    <SettingsHotkeys />
    <SettingsDiscord />

    <SettingsData />
    <SettingsClear />

    <SettingsReportIssue />
    <SettingsAbout />
  </>
);
