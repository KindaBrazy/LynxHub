import {DropdownItem} from '@nextui-org/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Copy_Icon, ExternalLink_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {HomeSmile_Icon, Info_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {OpenFolder_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons4';
import {duplicateCard, removeDuplicatedCard} from '../../../../../Modules/ModuleLoader';
import {cardsActions, useCardsState} from '../../../../../Redux/AI/CardsReducer';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useCtrlPressed, useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export const MenuInfo = () => {
  const {id, extensionsDir, repoUrl, setMenuIsOpen, title} = useCardData();
  const webUI = useInstalledCard(id);
  const {name} = useDevInfo(repoUrl);

  const dispatch = useDispatch<AppDispatch>();

  const {isCtrlPressed, setIsCtrlPressed} = useCtrlPressed();

  const showOpenFolder = useMemo(() => {
    return !!webUI?.dir && isCtrlPressed;
  }, [webUI, isCtrlPressed]);

  const onPress = () => {
    if (showOpenFolder) {
      rendererIpc.file.openPath(webUI!.dir!);
      setIsCtrlPressed(false);
    } else {
      dispatch(modalActions.openCardInfo({cardId: id, devName: name, extensionsDir, title, url: repoUrl}));
      setMenuIsOpen(false);
    }
  };

  return (
    <DropdownItem
      key="information"
      onPress={onPress}
      className="cursor-default"
      title={showOpenFolder ? 'Open Folder' : 'Information'}
      startContent={showOpenFolder ? <OpenFolder_Icon /> : <Info_Icon />}
    />
  );
};

export const MenuHomePage = () => {
  const {repoUrl, title, setMenuIsOpen} = useCardData();

  const {isCtrlPressed, setIsCtrlPressed} = useCtrlPressed();

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    if (isCtrlPressed) {
      window.open(repoUrl);
      setIsCtrlPressed(false);
    } else {
      dispatch(modalActions.openReadme({url: repoUrl, title}));
      setMenuIsOpen(false);
    }
  }, [dispatch, setMenuIsOpen, repoUrl, title, isCtrlPressed]);

  return (
    <DropdownItem
      key="homepage"
      title="HomePage"
      onPress={onPress}
      className="cursor-default"
      endContent={isCtrlPressed && <ExternalLink_Icon />}
      startContent={<HomeSmile_Icon className="size-3.5" />}
    />
  );
};

export const MenuDuplicate = () => {
  const {id} = useCardData();
  const duplicates = useCardsState('duplicates');
  const isDuplicated = useMemo(() => duplicates.some(card => card.id === id), [duplicates, id]);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    if (isDuplicated) {
      const removedDuplicate = duplicates.filter(d => d.id !== id);
      rendererIpc.storage.update('cards', {duplicated: removedDuplicate});
      dispatch(cardsActions.setDuplicates(removedDuplicate));
      removeDuplicatedCard(id);
    } else {
      const duplicatedCard = duplicateCard(id);
      if (duplicatedCard) {
        const addedDuplicate = [...duplicates, {...duplicatedCard, ogID: id}];
        rendererIpc.storage.update('cards', {duplicated: addedDuplicate});
        dispatch(cardsActions.setDuplicates(addedDuplicate));
      }
    }
  }, [isDuplicated]);

  return (
    <DropdownItem onPress={onPress} key="duplicate_card" className="cursor-default" startContent={<Copy_Icon />}>
      {isDuplicated ? 'Remove Duplicate' : 'Duplicate'}
    </DropdownItem>
  );
};
