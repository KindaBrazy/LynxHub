import {DropdownItem} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Document_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useCardData} from '../../../CardsDataManager';

export const MenuInfo = () => {
  const {id, extensionsDir, repoUrl, setMenuIsOpen, title} = useCardData();
  const {name} = useDevInfo(repoUrl);
  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openCardInfo({cardId: id, devName: name, extensionsDir, title, url: repoUrl}));
    setMenuIsOpen(false);
  }, [dispatch, id, name, extensionsDir, title, repoUrl, setMenuIsOpen]);

  return (
    <DropdownItem
      key="information"
      onPress={onPress}
      title="Information"
      className="cursor-default"
      startContent={<Info_Icon />}
    />
  );
};

export const MenuReadme = () => {
  const {repoUrl, title, setMenuIsOpen} = useCardData();

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openReadme({url: repoUrl, title}));
    setMenuIsOpen(false);
  }, [dispatch, repoUrl, setMenuIsOpen]);

  return (
    <DropdownItem
      key="readme"
      title="ReadMe"
      onPress={onPress}
      className="cursor-default"
      startContent={<Document_Icon />}
    />
  );
};
