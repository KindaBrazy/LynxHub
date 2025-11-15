import {type ComponentType, useMemo} from 'react';

import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
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

type SettingsSectionDefinition = {
  title: string;
  Component: ComponentType<any>;
  elementId: string;
};

type SettingsSectionsProps = {
  searchValue: string;
  sectionTexts: Map<string, string>;
};

export const SettingsSections = ({searchValue, sectionTexts}: SettingsSectionsProps) => {
  const content = useMemo(() => extensionsData.customizePages.settings.add.content, []);
  const normalizedSearch = searchValue.trim();

  const builtInSections = useMemo<SettingsSectionDefinition[]>(
    () => [
      {
        title: 'General',
        elementId: settingsSectionId.SettingsGeneralId,
        Component: SettingsGeneral,
      },
      {
        title: 'Startup',
        elementId: settingsSectionId.SettingsStartupId,
        Component: SettingsStartup,
      },
      {title: 'Card', elementId: settingsSectionId.SettingsCardId, Component: SettingsCard},
      {title: 'Terminal', elementId: settingsSectionId.SettingsTerminalId, Component: SettingsTerminal},
      {
        title: 'Browser',
        elementId: settingsSectionId.SettingsBrowserId,
        Component: SettingsBrowser,
      },
      {
        title: 'Hotkeys',
        elementId: settingsSectionId.SettingsHotkeysId,
        Component: HotkeySettings,
      },
      {title: 'Discord Activity', elementId: settingsSectionId.SettingsDiscordId, Component: SettingsDiscord},
      {title: 'Data', elementId: settingsSectionId.SettingsDataId, Component: SettingsData},
      {title: 'Clear', elementId: settingsSectionId.SettingsClearId, Component: SettingsClear},
    ],
    [],
  );

  const extensionSections = useMemo<SettingsSectionDefinition[]>(
    () =>
      content.map((Content, index) => ({
        title: Content.displayName ?? Content.name ?? `Custom Section ${index + 1}`,
        Component: Content,
        elementId: (Content as any).sectionId ?? (Content as any).settingsSectionId ?? '',
      })),
    [content],
  );

  const sectionsWithVisibility = useMemo(() => {
    const allSections = [...builtInSections, ...extensionSections];

    if (!normalizedSearch) {
      return allSections.map(section => ({...section, visible: true}));
    }

    return allSections.map(section => {
      const dynamicText = section.elementId ? sectionTexts.get(section.elementId) : undefined;
      const visible = searchInStrings(normalizedSearch, [dynamicText, section.title]);
      return {...section, visible};
    });
  }, [builtInSections, extensionSections, normalizedSearch, sectionTexts]);

  const hasVisibleSection = sectionsWithVisibility.some(section => section.visible);

  return (
    <>
      {!hasVisibleSection && normalizedSearch && (
        <div className="py-10 text-center text-sm text-foreground-500">No settings match “{searchValue}”.</div>
      )}
      {sectionsWithVisibility.map(({Component, elementId, title, visible}, index) => (
        <div key={elementId || `${title}_${index}`} className={visible ? 'contents' : 'hidden'}>
          <Component />
        </div>
      ))}
    </>
  );
};
