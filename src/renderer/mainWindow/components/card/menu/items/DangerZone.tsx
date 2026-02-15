import {DropdownItem} from '@heroui/react';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {MinusSquare, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';

import {useTabModalManager} from '../../../modals/useTabModalManager';
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
      className="cursor-default text-warning"
      startContent={<MinusSquare className="size-4" />}
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
      className="cursor-default text-danger"
      startContent={<TrashBin2 className="size-4" />}
    />
  );
}
