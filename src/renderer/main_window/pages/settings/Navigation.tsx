import {Button, Card, CardBody, CardHeader, Input, ScrollShadow} from '@heroui/react';
import {extensionsData} from '@lynx/plugins/extensions/loader';
import {settingsActions, useSettingsState} from '@lynx/redux/reducers/settings';
import {searchInStrings} from '@lynx/utils';
import {ContainersBg} from '@lynx/utils/common_styles';
import {Circle_Icon, Terminal_Icon} from '@lynx_assets/icons';
import {SettingPage_Icon} from '@lynx_assets/icons/pages';
import {
  Card as CardIcon,
  Database,
  Earth,
  Keyboard,
  SpedometerMiddle,
  TrashBin2,
} from '@solar-icons/react-perf/BoldDuotone';
import {Rocket} from '@solar-icons/react-perf/BoldDuotone';
import {AnimatePresence, motion} from 'framer-motion';
import {ReactNode, useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {settingsSectionId} from './Container';
import {SettingsGeneralId} from './items/general';
import SettingsSearchHighlight from './SettingsSearchHighlight';

export type GroupItem = {
  icon: ReactNode;
  title: string;
  color?: 'danger' | 'warning' | 'success';
  elementId: string;
};

export type GroupProps = {
  title: string;
  items: GroupItem[];
  danger?: boolean;
};

const groupSections: GroupProps[] = [
  {
    title: 'Application',
    items: [
      {
        title: 'General',
        icon: <SettingPage_Icon className="size-4 shrink-0 " />,
        elementId: settingsSectionId.SettingsGeneralId,
      },
      {
        title: 'Startup',
        icon: <Rocket className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsStartupId,
      },
      {
        title: 'Performance',
        icon: <SpedometerMiddle className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsPerformanceId,
      },
      {
        title: 'Card',
        icon: <CardIcon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsCardId,
      },
      {
        title: 'Terminal',
        icon: <Terminal_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsTerminalId,
      },
      {
        title: 'Browser',
        icon: <Earth className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsBrowserId,
      },
      {
        title: 'Hotkeys',
        icon: <Keyboard className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsHotkeysId,
      },
    ],
  },
  {
    title: 'Data Management',
    items: [
      {
        title: 'Data',
        icon: <Database className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsDataId,
      },
      {
        title: 'Clear',
        icon: <TrashBin2 className="size-4 shrink-0" />,
        color: 'danger',
        elementId: settingsSectionId.SettingsClearId,
      },
    ],
  },
];

/** Navigation bar group and items */
export const GroupSection = ({title, items, danger = false}: GroupProps) => {
  const dispatch = useDispatch();
  const selectedSection = useSettingsState('selectedSection');
  const setSelectedSection = useCallback((value: string) => {
    dispatch(settingsActions.setSettingsState({key: 'selectedSection', value}));
  }, []);

  const targetSection = selectedSection || SettingsGeneralId;

  return (
    <div className="mt-3 flex flex-col gap-y-2 text-start">
      <span className={`font-semibold text-sm uppercase tracking-tight ${danger ? 'text-danger' : ''}`}>{title}</span>
      <div className="flex flex-col gap-y-1">
        <AnimatePresence>
          {items.map(item => (
            <Button
              size="sm"
              variant="light"
              color={item.color || 'default'}
              key={`${item.title}_settings_section`}
              onPress={() => setSelectedSection(item.elementId)}
              className={`duration-100 overflow-visible ${targetSection === item.elementId && 'cursor-default'}`}
              fullWidth
              disableRipple>
              <div className="z-10 flex justify-start w-full items-center gap-x-1.5 text-[0.82rem] font-medium">
                {item.icon}
                <SettingsSearchHighlight text={item.title} />
              </div>
              {targetSection === item.elementId && (
                <motion.div
                  layoutId="setting_nav_indicator"
                  transition={{duration: 0.4, type: 'spring'}}
                  className="absolute inset-0 z-0 bg-primary/50 rounded-lg"
                />
              )}
            </Button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

/** Settings navigation bar */
type SettingsPageNavProps = {sectionTexts: Map<string, string>};

const SettingsPageNav = ({sectionTexts}: SettingsPageNavProps) => {
  const dispatch = useDispatch();

  const searchValue = useSettingsState('searchValue');
  const setSearchValue = useCallback((value: string) => {
    dispatch(settingsActions.setSearchValue(value));
  }, []);

  const buttons = useMemo(() => extensionsData.customizePages.settings.add.navButton, []);

  const filteredGroups = useMemo(() => {
    if (!searchValue) return groupSections;

    return groupSections
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          searchInStrings(searchValue, [item.title, group.title, sectionTexts.get(item.elementId) ?? '']),
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [searchValue, sectionTexts]);

  const groupsToRender = searchValue ? filteredGroups : groupSections;

  return (
    <Card className={`h-full my-2 text-medium w-48 shrink-0 border-1 border-foreground-100 ${ContainersBg}`}>
      <CardHeader className="justify-center gap-x-2 pt-4">
        <SettingPage_Icon className="size-5" />
        <span>
          <SettingsSearchHighlight text="Settings" />
        </span>
      </CardHeader>
      <CardBody className="pt-0 flex flex-col">
        <Input
          size="sm"
          className="py-1"
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder="Search settings..."
          aria-label="Search settings sections"
          startContent={<Circle_Icon className="size-4" />}
          isClearable
        />

        <ScrollShadow className="flex-1" hideScrollBar>
          {groupsToRender.length === 0 && searchValue && (
            <div className="px-3 text-xs text-foreground-500">No sections match "{searchValue}".</div>
          )}

          {groupsToRender.map(section => (
            <GroupSection key={section.title} {...section} />
          ))}
          {buttons.map((Btn, index) => (
            <Btn key={index} />
          ))}
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

export default SettingsPageNav;
