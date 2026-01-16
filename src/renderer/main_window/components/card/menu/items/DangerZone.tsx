import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';

import {MinusSquareDuo_Icon, Trash_Icon} from '../../../../../shared/assets/icons';
import AddBreadcrumb_Renderer from '../../../../../shared/sentry/Breadcrumbs';
import {useTabModalManager} from '../../../../layouts/modals/useTabModalManager';
import {useCardStore} from '../../Wrapper';

export function MenuUnAssign() {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Unassign AI: id:${id}`);
    openModal('cardUnassign', {cardId: id}, 'active');
    setMenuIsOpen(false);
  }, [setMenuIsOpen, id, openModal]);

  return (
    <DropdownItem
      key="unassign"
      color="warning"
      title="Unassign"
      onPress={onPress}
      startContent={<MinusSquareDuo_Icon />}
      className="cursor-default text-warning"
    />
  );
}

export function MenuUninstall() {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Uninstall AI: id:${id}`);
    openModal('cardUninstall', {cardId: id}, 'active');
    setMenuIsOpen(false);
  }, [setMenuIsOpen, id, openModal]);

  return (
    <DropdownItem
      color="danger"
      key="uninstall"
      title="Uninstall"
      onPress={onPress}
      startContent={<Trash_Icon />}
      className="cursor-default text-danger"
    />
  );
}
