import {Button, ScrollShadow} from '@nextui-org/react';
import {Card, Typography} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {getIconByName, IconNameType} from '../../../../../assets/icons/SvgIconsContainer';
import {settingsSectionId} from './SettingsContainer';

const {Text} = Typography;

export type GroupItem = {
  icon: IconNameType;
  title: string;
  color?: 'danger' | 'warning' | 'success';
  iconColor?: boolean;
  elementId?: string;
};

export type GroupProps = {
  title: string;
  items: GroupItem[];
  danger?: boolean;
};

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
              {getIconByName(item.icon, {
                className: `size-4 shrink-0 ${!item.iconColor && 'dark:text-white text-black'}`,
              })}
              <Text>{item.title}</Text>
            </>
          </Button>
        ))}
      </div>
    </div>
  );
};

/** Settings navigation bar */
export default function SettingsPageNav() {
  const groupSections: GroupProps[] = useMemo(
    () => [
      {
        title: 'Application',
        items: [
          {title: 'General', icon: 'Tuning', elementId: settingsSectionId.SettingsGeneralId},
          {title: 'Startup', icon: 'Rocket', elementId: settingsSectionId.SettingsStartupId},
          {title: 'Hotkeys', icon: 'Keyboard', elementId: settingsSectionId.SettingsHotkeysId},
          {title: 'Discord Activity', icon: 'Discord', elementId: settingsSectionId.SettingsDiscordId},
        ],
      },
      {
        title: 'Data Management',
        items: [
          {title: 'Data', icon: 'Database', elementId: settingsSectionId.SettingsDataId},
          {
            title: 'Clear',
            icon: 'Trash',
            color: 'danger',
            iconColor: true,
            elementId: settingsSectionId.SettingsClearId,
          },
        ],
      },
    ],
    [],
  );

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
      </ScrollShadow>
    </Card>
  );
}
