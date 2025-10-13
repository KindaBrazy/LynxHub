import {Checkbox, DropdownItem, Spinner} from '@heroui/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import AddBreadcrumb_Renderer from '../../../../../../../Breadcrumbs';
import {Download_Icon, Refresh_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {getCardMethod, useAllCardMethods} from '../../../../../Modules/ModuleLoader';
import {cardsActions} from '../../../../../Redux/Reducer/CardsReducer';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {
  useInstalledCard,
  useIsAutoUpdateCard,
  useUpdateAvailable,
  useUpdatingCard,
} from '../../../../../Utils/UtilHooks';
import {useCardStore} from '../../LynxCard-Wrapper';

export const MenuUpdate = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);

  const {name: devName} = useDevInfo(repoUrl);
  const updating = useUpdatingCard(id);
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const allMethods = useAllCardMethods();
  const activeTab = useTabsState('activeTab');

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Start Update AI: id:${id}`);
    if (getCardMethod(allMethods, id, 'manager')?.updater.startUpdate) {
      dispatch(modalActions.openInstallUICard({cardId: id, tabID: activeTab, type: 'update', title}));
      setMenuIsOpen(false);
    } else if (webUi && webUi.dir) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      setMenuIsOpen(false);
      rendererIpc.git.pull(webUi.dir, id);
    }
  }, [dispatch, setMenuIsOpen, webUi, devName, id, title, activeTab]);

  if (!updateAvailable || autoUpdate)
    return <DropdownItem className="hidden" key="update-hidden" textValue="update_hidden" />;

  return (
    <DropdownItem
      key="update"
      title="Update"
      color="success"
      onPress={onPress}
      isDisabled={updating}
      startContent={<Download_Icon />}
      endContent={updating && <Spinner size="sm" color="primary" />}
      className={updateAvailable ? 'text-success' : 'cursor-default'}
    />
  );
};

export const MenuCheckForUpdate = () => {
  const id = useCardStore(state => state.id);
  const checkingForUpdate = useCardStore(state => state.checkingForUpdate);
  const setCheckingForUpdate = useCardStore(state => state.setCheckingForUpdate);

  const autoUpdate = useIsAutoUpdateCard(id);
  const card = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const allMethods = useAllCardMethods();

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Check Update AI: id:${id}`);
    setCheckingForUpdate(true);
    if (card) {
      const updateType = allMethods.find(c => c.id === id)?.methods?.['manager']?.updater.updateType;
      rendererIpc.module.cardUpdateAvailable(card, updateType).then((isAvailable: boolean) => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        setCheckingForUpdate(false);
      });
    }
  }, [dispatch, setCheckingForUpdate, card, id, allMethods]);

  if (updateAvailable || autoUpdate)
    return <DropdownItem className="hidden" key="check-update-hidden" textValue="check_update_hidden" />;

  return (
    <DropdownItem
      onPress={onPress}
      key="check-update"
      title="Check For Updates"
      className="cursor-default"
      isDisabled={checkingForUpdate}
      startContent={<Refresh_Icon className="size-[0.77rem]" />}
      endContent={checkingForUpdate && <Spinner size="sm" color="primary" />}
    />
  );
};

export const MenuAutoUpdate = () => {
  const id = useCardStore(state => state.id);
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);

  const {name: devName} = useDevInfo(repoUrl);
  const autoUpdate = useIsAutoUpdateCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const webUi = useInstalledCard(id);
  const [customUpdate, setCustomUpdate] = useState<boolean>(false);
  const allMethods = useAllCardMethods();

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (getCardMethod(allMethods, id, 'manager')?.updater.updateType === 'stepper') {
      setCustomUpdate(true);
    }
  }, [id, allMethods]);

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Toggle AutoUpdate AI: id:${id}, !autoUpdate:${!autoUpdate}`);
    if (autoUpdate) {
      rendererIpc.storageUtils.removeAutoUpdateCard(id);
    } else {
      rendererIpc.storageUtils.addAutoUpdateCard(id);
    }
  }, [autoUpdate, id]);

  useEffect(() => {
    if (autoUpdate && updateAvailable && webUi && webUi.dir) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      rendererIpc.git.pull(webUi.dir, id);
    }
  }, [dispatch, autoUpdate, updateAvailable, webUi, devName, id, title]);

  if (customUpdate) return <DropdownItem className="hidden" key="auto-update-hidden" textValue="auto_update_hidden" />;

  return (
    <DropdownItem key="auto-update" onPress={onPress} textValue="Auto Update" className="cursor-default">
      <Checkbox size="sm" isSelected={autoUpdate} onValueChange={onPress} classNames={{hiddenInput: 'cursor-default'}}>
        Auto Update
      </Checkbox>
    </DropdownItem>
  );
};
