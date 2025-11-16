import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';

import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {MinusSquareDuo_Icon, Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useTabModalManager} from '../../../../Modals/useTabModalManager';
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
