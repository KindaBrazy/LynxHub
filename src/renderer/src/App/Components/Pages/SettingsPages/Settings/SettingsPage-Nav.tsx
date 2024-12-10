import {Button, ScrollShadow} from '@nextui-org/react';
import {Card, Typography} from 'antd';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';

import {
  Database_Icon,
  Discord_Icon,
  Terminal_Icon,
  Trash_Icon,
  Tuning_Icon,
} from '../../../../../assets/icons/SvgIcons/SvgIcons3';
import {EditCard_Icon, Keyboard_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons4';
import {Rocket_Icon} from '../../../../../assets/icons/SvgIcons/SvgIcons5';
import {extensionsData} from '../../../../Extensions/ExtensionLoader';
import {settingsSectionId} from './SettingsContainer';

const {Text} = Typography;

export type GroupItem = {
  icon: ReactNode;
  title: string;
  color?: 'danger' | 'warning' | 'success';
  elementId?: string;
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
        title: 'Customize Card',
        icon: <EditCard_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsCardId,
      },
      {
        title: 'General',
        icon: <Tuning_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsGeneralId,
      },
      {
        title: 'Terminal',
        icon: <Terminal_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsTerminalId,
      },
      {
        title: 'Startup',
        icon: <Rocket_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsStartupId,
      },
      {
        title: 'Hotkeys',
        icon: <Keyboard_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsHotkeysId,
      },
      {
        title: 'Discord Activity',
        icon: <Discord_Icon className="size-4 shrink-0 dark:text-white text-black" />,
        elementId: settingsSectionId.SettingsDiscordId,
      },
    ],
  },
  {
    title: 'Data Management',
    items: [
      {
        title: 'Data',
        icon: <Database_Icon className="size-4 shrink-0 dark:text-white text-black" />,
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
      const elem = document.getElementById(item.elementId || '');
      if (elem) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            setIsInView(prevState => {
              if (entry.isIntersecting) {
                return prevState.includes(item.elementId || '') ? prevState : [...prevState, item.elementId || ''];
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
            onPress={() => {
              onPress(item.elementId || '');
            }}
            className={
              `flex cursor-default justify-start ` + `${isInView.includes(item.elementId || '') && 'bg-default-200'}`
            }
            size="sm"
            variant="light"
            color={item.color || 'default'}
            key={`${item.title}_settings_section`}
            fullWidth>
            <>
              {item.icon}
              <Text>{item.title}</Text>
            </>
          </Button>
        ))}
      </div>
    </div>
  );
};

/** Settings navigation bar */
const SettingsPageNav = () => {
  const buttons = useMemo(() => extensionsData.customizePages.settings.add.navButton, []);

  return (
    <Card
      className={
        'h-full w-48 shrink-0 border-2 border-foreground/10 text-center' +
        ' dark:border-foreground/5 dark:bg-LynxRaisinBlack'
      }
      bordered={false}
      title="Settings">
      <ScrollShadow className="absolute inset-x-3 bottom-4 top-[3.8rem]" hideScrollBar>
        {groupSections.map((section, index) => (
          <GroupSection key={index} {...section} />
        ))}
        {buttons.map((Btn, index) => (
          <Btn key={index} />
        ))}
      </ScrollShadow>
    </Card>
  );
};

export default SettingsPageNav;
