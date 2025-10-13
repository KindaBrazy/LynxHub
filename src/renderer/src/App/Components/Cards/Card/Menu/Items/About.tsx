import {DropdownItem} from '@heroui/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {
  Copy_Icon,
  ExternalLink_Icon,
  HomeSmile_Icon,
  Info_Icon,
  OpenFolder_Icon,
} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {duplicateCard, removeDuplicatedCard} from '../../../../../Modules/ModuleLoader';
import {cardsActions, useCardsState} from '../../../../../Redux/Reducer/CardsReducer';
import {useHotkeysState} from '../../../../../Redux/Reducer/HotkeysReducer';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardStore} from '../../Wrapper';

export const MenuInfo = () => {
  const id = useCardStore(state => state.id);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const repoUrl = useCardStore(state => state.repoUrl);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const title = useCardStore(state => state.title);

  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const webUI = useInstalledCard(id);
  const {name} = useDevInfo(repoUrl);
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const showOpenFolder = useMemo(() => {
    return !!webUI?.dir && isCtrlPressed;
  }, [webUI, isCtrlPressed]);

  const onPress = () => {
    if (showOpenFolder) {
      rendererIpc.file.openPath(webUI!.dir!);
      setMenuIsOpen(false);
    } else {
      dispatch(
        modalActions.openCardInfo({cardId: id, devName: name, extensionsDir, title, url: repoUrl, tabID: activeTab}),
      );
      setMenuIsOpen(false);
    }
  };

  return (
    <DropdownItem
      key="information"
      onPress={onPress}
      className={`${!showOpenFolder && 'cursor-default'}`}
      title={showOpenFolder ? 'Open Folder' : 'Information'}
      startContent={showOpenFolder ? <OpenFolder_Icon /> : <Info_Icon />}
    />
  );
};

export const MenuHomePage = () => {
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const isCtrlPressed = useHotkeysState('isCtrlPressed');

  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Open AI HomePage: repoUrl:${repoUrl}, isCtrlPressed:${isCtrlPressed}`);
    if (isCtrlPressed) {
      window.open(repoUrl);
      setMenuIsOpen(false);
    } else {
      dispatch(modalActions.openReadme({url: repoUrl, title, tabID: activeTab}));
      setMenuIsOpen(false);
    }
  }, [dispatch, setMenuIsOpen, repoUrl, title, isCtrlPressed, activeTab]);

  return (
    <DropdownItem
      key="homepage"
      title="HomePage"
      onPress={onPress}
      className={`${!isCtrlPressed && 'cursor-default'}`}
      endContent={isCtrlPressed && <ExternalLink_Icon />}
      startContent={<HomeSmile_Icon className="size-3.5" />}
    />
  );
};

export const MenuDuplicate = () => {
  const id = useCardStore(state => state.id);

  const duplicates = useCardsState('duplicates');
  const isDuplicated = useMemo(() => duplicates.some(card => card.id === id), [duplicates, id]);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Duplicate AI: id:${id}, isDuplicated:${isDuplicated}`);
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
  }, [dispatch, isDuplicated, duplicates, id]);

  return (
    <DropdownItem onPress={onPress} key="duplicate_card" className="cursor-default" startContent={<Copy_Icon />}>
      {isDuplicated ? 'Remove Duplicate' : 'Duplicate'}
    </DropdownItem>
  );
};
