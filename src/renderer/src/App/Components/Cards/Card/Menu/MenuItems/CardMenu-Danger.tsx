import {DropdownItemProps} from '@nextui-org/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useCardData} from '../../../CardsDataManager';

export const useUninstall = (): DropdownItemProps => {
  const {id, setMenuIsOpen} = useCardData();
  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openUninstallCard(id));
    setMenuIsOpen(false);
  }, [dispatch, id, setMenuIsOpen]);

  return useMemo(
    () => ({
      className: 'cursor-default text-danger',
      color: 'danger',
      key: 'uninstall',
      onPress,
      startContent: getIconByName('Trash'),
      title: 'Uninstall',
    }),
    [onPress],
  );
};
