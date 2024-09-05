import {DropdownItemProps} from '@nextui-org/react';
import {useMemo} from 'react';

import {DropDownSectionType} from '../../../../Utils/Types';
import {useDocPage, useInfo} from './MenuItems/CardMenu-About';
import {useUninstall} from './MenuItems/CardMenu-Danger';
import {useExtensions, useLaunchConfig, usePin} from './MenuItems/CardMenu-Options';
import {useAutoUpdate, useCheckForUpdate, useUpdate} from './MenuItems/CardMenu-Update';

const useCardMenuSections = (): DropDownSectionType[] => {
  const launchConfig = useLaunchConfig();
  const extensions = useExtensions();
  const pin = usePin();

  const update = useUpdate();
  const checkForUpdate = useCheckForUpdate();
  const autoUpdate = useAutoUpdate();

  const docPage = useDocPage();
  const info = useInfo();

  const uninstall = useUninstall();

  const optionItems: DropdownItemProps[] = useMemo(() => {
    return [launchConfig, extensions, pin].filter(Boolean) as DropdownItemProps[];
  }, [launchConfig, extensions, pin]);

  const updateItems: DropdownItemProps[] = useMemo(() => {
    return [update, checkForUpdate, autoUpdate].filter(Boolean) as DropdownItemProps[];
  }, [update, checkForUpdate, autoUpdate]);

  const aboutItems: DropdownItemProps[] = useMemo(() => {
    return [docPage, info].filter(Boolean) as DropdownItemProps[];
  }, [docPage, info]);

  const dangerItems: DropdownItemProps[] = useMemo(() => {
    return [uninstall].filter(Boolean) as DropdownItemProps[];
  }, [uninstall]);

  return [
    {
      key: 'options',
      title: 'Options',
      showDivider: true,
      items: optionItems,
    },
    {
      key: 'update',
      title: 'Update',
      showDivider: true,
      items: updateItems,
    },
    {
      key: 'about',
      title: 'About',
      items: aboutItems,
    },
    {
      key: 'danger-zone',
      items: dangerItems,
    },
  ];
};

export default useCardMenuSections;
