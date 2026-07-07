import {DropdownItem} from '@heroui/react';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {MinusSquare, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';

import {useCardStore} from '../../store';
import {CommonProps} from '../about/types';

/**
 * Menu item to unassign the card.
 */
export const UnAssignMenuItem = ({state}: CommonProps) => {
  const setMenuIsOpen = useCardStore(st => st.setMenuIsOpen);
  const title = useCardStore(st => st.title);

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Card Menu Action: Clicked "unassign" on "${title}"`);
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen, title]);

  return (
    <DropdownItem key="unassign" onPress={onPress} className="text-warning">
      <MinusSquare className="size-4" />
      Unassign
    </DropdownItem>
  );
};

/**
 * Menu item to uninstall the card.
 */
export const UninstallMenuItem = ({state}: CommonProps) => {
  const setMenuIsOpen = useCardStore(st => st.setMenuIsOpen);
  const title = useCardStore(st => st.title);

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Card Menu Action: Clicked "uninstall" on "${title}"`);
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen, title]);

  return (
    <DropdownItem key="uninstall" onPress={onPress} className="text-danger">
      <TrashBin2 className="size-4" />
      Uninstall
    </DropdownItem>
  );
};
