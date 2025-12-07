import {Button, Card, CardBody, CardHeader, Input, ScrollShadow} from '@heroui/react';
import {SpedometerMiddle} from '@solar-icons/react-perf/BoldDuotone';
import {Typography} from 'antd';
import {Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useState} from 'react';

import {
  Circle_Icon,
  Database_Icon,
  Discord_Icon,
  EditCard_Icon,
  Keyboard_Icon,
  Rocket_Icon,
  Terminal_Icon,
  Trash_Icon,
  Tuning_Icon,
  Web_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {ContainersBg} from '../../../../Utils/CrossStyle';
import {searchInStrings} from '../../../../Utils/UtilFunctions';
import {settingsSectionId} from './SettingsContainer';
import SettingsSearchHighlight from './SettingsSearchHighlight';

const {Text} = Typography;

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
        icon: <Tuning_Icon className="size-4 shrink-0 " />,
        elementId: settingsSectionId.SettingsGeneralId,
      },
      {
        title: 'Startup',
        icon: <Rocket_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsStartupId,
      },
      {
        title: 'Performance',
        icon: <SpedometerMiddle className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsPerformanceId,
      },
      {
        title: 'Card',
        icon: <EditCard_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsCardId,
      },
      {
        title: 'Terminal',
        icon: <Terminal_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsTerminalId,
      },
      {
        title: 'Browser',
        icon: <Web_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsBrowserId,
      },
      {
        title: 'Hotkeys',
        icon: <Keyboard_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsHotkeysId,
      },
      {
        title: 'Discord Activity',
        icon: <Discord_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsDiscordId,
      },
    ],
  },
  {
    title: 'Data Management',
    items: [
      {
        title: 'Data',
        icon: <Database_Icon className="size-4 shrink-0" />,
        elementId: settingsSectionId.SettingsDataId,
      },
      {
        title: 'Clear',
        icon: <Trash_Icon className="size-4 shrink-0" />,
        color: 'danger',
        elementId: settingsSectionId.SettingsClearId,
      },
    ],
  },
];

/** Navigation bar group and items */
export const GroupSection = ({title, items, danger = false}: GroupProps) => {
  const [isInView, setIsInView] = useState<string[]>([]);

  const onPress = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    items.forEach(item => {
      const elem = document.getElementById(item.elementId);
      if (elem) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setIsInView(prevState => {
              if (entry.isIntersecting) {
                return prevState.includes(item.elementId) ? prevState : [...prevState, item.elementId];
              } else {
                return prevState.filter(inView => inView !== item.elementId);
              }
            });
          },
          {threshold: 0.7},
        );
        observer.observe(elem);
        observers.push(observer);
      }
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, [items]);

  return (
    <div className="mt-3 flex flex-col space-y-3 text-start">
      <Text className={`text-medium font-bold ${danger ? 'text-danger' : ''}`}>{title}</Text>
      <div className="space-y-2">
        {items.map(item => (
          <Button
            className={
              `flex cursor-default justify-start ` + `${isInView.includes(item.elementId) && 'bg-default-200'}`
            }
            size="sm"
            variant="light"
            color={item.color || 'default'}
            key={`${item.title}_settings_section`}
            onPress={() => onPress(item.elementId)}
            fullWidth>
            {item.icon}
            <Text>
              <SettingsSearchHighlight text={item.title} />
            </Text>
          </Button>
        ))}
      </div>
    </div>
  );
};

/** Settings navigation bar */
type SettingsPageNavProps = {
  searchValue: string;
  setSearchValue: Dispatch<SetStateAction<string>>;
  sectionTexts: Map<string, string>;
};

const SettingsPageNav = ({searchValue, setSearchValue, sectionTexts}: SettingsPageNavProps) => {
  const buttons = useMemo(() => extensionsData.customizePages.settings.add.navButton, []);
  const normalizedSearch = searchValue.trim();

  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) return groupSections;

    return groupSections
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          searchInStrings(normalizedSearch, [item.title, group.title, sectionTexts.get(item.elementId) ?? '']),
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [normalizedSearch, sectionTexts]);

  const groupsToRender = normalizedSearch ? filteredGroups : groupSections;

  return (
    <Card className={`h-full text-medium w-48 shrink-0 border-1 border-foreground-100 ${ContainersBg}`}>
      <CardHeader className="justify-center gap-x-2 pt-5">
        <Tuning_Icon className="size-5" />
        <span>
          <SettingsSearchHighlight text="Settings" />
        </span>
      </CardHeader>
      <CardBody className="pt-0 flex flex-col">
        <div className="pb-4 pt-3 border-b border-foreground-100/60">
          <Input
            type="search"
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search settings..."
            aria-label="Search settings sections"
            startContent={<Circle_Icon className="size-4" />}
          />
        </div>

        <ScrollShadow className="flex-1 pt-3" hideScrollBar>
          {groupsToRender.length === 0 && normalizedSearch && (
            <div className="px-3 text-xs text-foreground-500">No sections match “{searchValue}”.</div>
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
