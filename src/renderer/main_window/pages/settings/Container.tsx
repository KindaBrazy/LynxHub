import {compact} from 'lodash';
import {type ComponentType, useMemo} from 'react';

import {extensionsData} from '../../plugins/extensions/loader';
import {useSettingsState} from '../../redux/reducers/settings';
import {searchInStrings} from '../../utils';
import SettingsBrowser, {SettingsBrowserId} from './items/browser';
import SettingsCard, {SettingsCardId} from './items/card';
import SettingsClear, {SettingsClearId} from './items/clear';
import SettingsData, {SettingsDataId} from './items/data';
import SettingsGeneral, {SettingsGeneralId} from './items/general';
import {HotkeySettings, SettingsHotkeysId} from './items/hotkeys';
import SettingsPerformance, {SettingsPerformanceId} from './items/performance';
import SettingsStartup, {SettingsStartupId} from './items/startup';
import SettingsTerminal, {SettingsTerminalId} from './items/terminal';

export const settingsSectionId = {
  SettingsCardId,
  SettingsGeneralId,
  SettingsTerminalId,
  SettingsBrowserId,
  SettingsStartupId,
  SettingsClearId,
  SettingsDataId,
  SettingsHotkeysId,
  SettingsPerformanceId,
};

type SettingsSectionDefinition = {
  title: string;
  Component: ComponentType<any>;
  elementId: string;
};

type SettingsSectionsProps = {
  sectionTexts: Map<string, string>;
};

export const SettingsSections = ({sectionTexts}: SettingsSectionsProps) => {
  const content = useMemo(() => extensionsData.customizePages.settings.add.content, []);
  const searchValue = useSettingsState('searchValue');
  const selectedSection = useSettingsState('selectedSection');

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
      {
        title: 'Performance',
        elementId: settingsSectionId.SettingsPerformanceId,
        Component: SettingsPerformance,
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

    if (!searchValue) {
      const targetSection = selectedSection || SettingsGeneralId;

      return compact(
        allSections.map(section => (section.elementId === targetSection ? {...section, visible: true} : null)),
      );
    }

    return allSections.map(section => {
      const dynamicText = section.elementId ? sectionTexts.get(section.elementId) : undefined;
      const visible = searchInStrings(searchValue, [dynamicText, section.title]);
      return {...section, visible};
    });
  }, [builtInSections, extensionSections, searchValue, sectionTexts, selectedSection]);

  const hasVisibleSection = sectionsWithVisibility.some(section => section.visible);

  return (
    <>
      {!hasVisibleSection && searchValue && (
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
