import {DropdownItemProps} from '@nextui-org/react';
import {compact} from 'lodash';
import {useMemo} from 'react';

import {DropDownSectionType} from '../../../../Utils/Types';
import {useInfo, useREADME} from './MenuItems/CardMenu-About';
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

  const info = useInfo();
  const readme = useREADME();

  const uninstall = useUninstall();

  const optionItems: DropdownItemProps[] = useMemo(
    () => compact([launchConfig, extensions, pin]),
    [launchConfig, extensions, pin],
  );

  const updateItems: DropdownItemProps[] = useMemo(
    () => compact([update, checkForUpdate, autoUpdate]),
    [update, checkForUpdate, autoUpdate],
  );

  const extraItems: DropdownItemProps[] = useMemo(() => compact([info, readme, uninstall]), [info, readme, uninstall]);

  return [
    {
      key: 'options',
      showDivider: true,
      items: optionItems,
    },
    {
      key: 'update',
      showDivider: true,
      items: updateItems,
    },
    {
      key: 'danger-zone',
      items: extraItems,
    },
  ];
};

export default useCardMenuSections;
