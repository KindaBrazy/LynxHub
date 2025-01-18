import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export function MenuUninstall() {
  const {id, setMenuIsOpen} = useCardData();
  const card = useInstalledCard(id);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openUninstallCard(id));
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, id]);

  if (!card?.dir) return <DropdownItem className="hidden" key="uninstall-hidden" textValue="uninstall_hidden" />;

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
