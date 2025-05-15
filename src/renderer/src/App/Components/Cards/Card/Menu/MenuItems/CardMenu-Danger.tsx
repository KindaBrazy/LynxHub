import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Trash_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useCardData} from '../../../CardsDataManager';

export function MenuUninstall() {
  const {id, setMenuIsOpen} = useCardData();

  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const onPress = useCallback(() => {
    dispatch(modalActions.openUninstallCard({cardId: id, tabID: activeTab}));
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, id, activeTab]);

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
