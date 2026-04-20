import {DropdownItem} from '@heroui-v3/react';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {MinusSquare, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';

import {useTabModalManager} from '../../../modals/useTabModalManager';
import {useCardStore} from '../../store';

/**
 * Menu item to unassign the card.
 */
export const UnAssignMenuItem = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Unassign AI: id:${id}`);
    openModal('cardUnassign', {cardId: id}, 'active');
    setMenuIsOpen(false);
  }, [setMenuIsOpen, id, openModal]);

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
export const UninstallMenuItem = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Uninstall AI: id:${id}`);
    openModal('cardUninstall', {cardId: id}, 'active');
    setMenuIsOpen(false);
  }, [setMenuIsOpen, id, openModal]);

  return (
    <DropdownItem key="uninstall" onPress={onPress} className="text-danger">
      <TrashBin2 className="size-4" />
      Uninstall
    </DropdownItem>
  );
};
