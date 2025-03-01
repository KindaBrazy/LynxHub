import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useCardData} from '../../../CardsDataManager';

export function MenuUninstall() {
  const {id, setMenuIsOpen} = useCardData();

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openUninstallCard(id));
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, id]);

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
