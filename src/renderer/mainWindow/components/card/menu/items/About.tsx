import {DropdownItem} from '@heroui-v3/react';
import {duplicateCard, removeDuplicatedCard} from '@lynx/plugins/modules';
import {cardsActions, useCardsState} from '@lynx/redux/reducers/cards';
import {useHotkeysState} from '@lynx/redux/reducers/hotkeys';
import {modalActions} from '@lynx/redux/reducers/modals';
import {useTabsState} from '@lynx/redux/reducers/tabs';
import {AppDispatch} from '@lynx/redux/store';
import {useInstalledCard} from '@lynx/utils/hooks';
import {extractGitUrl} from '@lynx_common/utils';
import filesIpc from '@lynx_shared/ipc/files';
import storageIpc from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {Copy, FolderOpen, HomeAngle2, InfoSquare, SquareTopDown} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {useTabModalManager} from '../../../modals/useTabModalManager';
import {useCardStore} from '../../store';

/**
 * Menu item to show card information or open its folder.
 * Displays 'Open Folder' if Ctrl is pressed and directory exists.
 */
export const AboutMenuItem = () => {
  const id = useCardStore(state => state.id);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const repoUrl = useCardStore(state => state.repoUrl);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const title = useCardStore(state => state.title);

  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const webUI = useInstalledCard(id);
  const activeTab = useTabsState('activeTab');
  const dispatch = useDispatch<AppDispatch>();

  const showOpenFolder = useMemo(() => {
    return !!webUI?.dir && isCtrlPressed;
  }, [webUI?.dir, isCtrlPressed]);

  const onPress = useCallback(() => {
    if (showOpenFolder && webUI?.dir) {
      filesIpc.openPath(webUI.dir);
      setMenuIsOpen(false);
    } else {
      dispatch(
        modalActions.openCardInfo({
          cardId: id,
          devName: extractGitUrl(repoUrl).owner,
          extensionsDir,
          title,
          url: repoUrl,
          tabID: activeTab,
        }),
      );
      setMenuIsOpen(false);
    }
  }, [showOpenFolder, webUI?.dir, setMenuIsOpen, dispatch, id, repoUrl, extensionsDir, title, activeTab]);

  return (
    <DropdownItem key="information" onPress={onPress}>
      {showOpenFolder ? <FolderOpen className="size-4" /> : <InfoSquare className="size-4" />}
      {showOpenFolder ? 'Open Folder' : 'Information'}
    </DropdownItem>
  );
};

/**
 * Menu item to open the card's homepage (repo URL) or readme.
 * Opens in browser if Ctrl is pressed.
 */
export const HomePageMenuItem = () => {
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);

  const isCtrlPressed = useHotkeysState('isCtrlPressed');
  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Open AI HomePage: repoUrl:${repoUrl}, isCtrlPressed:${isCtrlPressed}`);
    if (isCtrlPressed) {
      window.open(repoUrl);
      setMenuIsOpen(false);
    } else {
      openModal('readme', {url: repoUrl, title}, 'active');
      setMenuIsOpen(false);
    }
  }, [setMenuIsOpen, repoUrl, title, isCtrlPressed, openModal]);

  return (
    <DropdownItem key="homepage" onPress={onPress}>
      <HomeAngle2 className="size-4" />
      HomePage
      {isCtrlPressed && <SquareTopDown className="size-3.5" />}
    </DropdownItem>
  );
};

/**
 * Menu item to duplicate or remove a duplicate of the card.
 */
export const DuplicateMenuItem = () => {
  const id = useCardStore(state => state.id);

  const duplicates = useCardsState('duplicates');
  const isDuplicated = useMemo(() => duplicates.some(card => card.id === id), [duplicates, id]);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Duplicate AI: id:${id}, isDuplicated:${isDuplicated}`);
    if (isDuplicated) {
      const removedDuplicate = duplicates.filter(d => d.id !== id);
      storageIpc.update('cards', {duplicated: removedDuplicate});
      dispatch(cardsActions.setDuplicates(removedDuplicate));
      removeDuplicatedCard(id);
    } else {
      const duplicatedCard = duplicateCard(id);
      if (duplicatedCard) {
        const addedDuplicate = [...duplicates, {...duplicatedCard, ogID: id}];
        storageIpc.update('cards', {duplicated: addedDuplicate});
        dispatch(cardsActions.setDuplicates(addedDuplicate));
      }
    }
  }, [dispatch, isDuplicated, duplicates, id]);

  return (
    <DropdownItem onPress={onPress} key="duplicate_card">
      <Copy className="size-4" />
      {isDuplicated ? 'Remove Duplicate' : 'Duplicate'}
    </DropdownItem>
  );
};
