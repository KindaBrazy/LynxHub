import {DropdownItemProps} from '@nextui-org/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useCardData} from '../../../CardsDataManager';

export const useDocPage = (): DropdownItemProps => {
  const {repoUrl, setMenuIsOpen} = useCardData();

  const onPress = useCallback(() => {
    window.open(repoUrl);
    setMenuIsOpen(false);
  }, [repoUrl, setMenuIsOpen]);

  return useMemo(
    () => ({
      className: 'cursor-default',
      endContent: getIconByName('ExternalLink'),
      key: 'repository-page',
      onPress,
      startContent: getIconByName('Document'),
      title: 'Repository Page',
    }),
    [onPress],
  );
};

export const useInfo = (): DropdownItemProps => {
  const {id, extensionsDir, repoUrl, setMenuIsOpen, title} = useCardData();
  const {name} = useDevInfo(repoUrl);
  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    dispatch(modalActions.openCardInfo({cardId: id, devName: name, extensionsDir, title, url: repoUrl}));
    setMenuIsOpen(false);
  }, [dispatch, id, name, extensionsDir, title, repoUrl, setMenuIsOpen]);

  return useMemo(
    () => ({
      className: 'cursor-default',
      key: 'information',
      onPress,
      showDivider: true,
      startContent: getIconByName('Info'),
      title: 'Information',
    }),
    [onPress],
  );
};
