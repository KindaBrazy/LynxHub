import {Checkbox, DropdownItem, Spinner} from '@heroui/react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {extractGitUrl} from '../../../../../../cross/CrossUtils';
import {Download_Icon, Refresh_Icon} from '../../../../../shared/assets/icons';
import AddBreadcrumb_Renderer from '../../../../../shared/sentry/Breadcrumbs';
import {useInstalledCard, useIsAutoUpdateCard, useUpdateAvailable, useUpdatingCard} from '../../../../hooks/utils';
import {useTabModalManager} from '../../../../layouts/modals/useTabModalManager';
import {getCardMethod, useAllCardMethods} from '../../../../plugins/modules';
import {cardsActions} from '../../../../redux/reducers/cards';
import {AppDispatch} from '../../../../redux/store';
import rendererIpc from '../../../../services/RendererIpc';
import {useCardStore} from '../../Wrapper';

export const MenuUpdate = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const repoUrl = useCardStore(state => state.repoUrl);
  const title = useCardStore(state => state.title);

  const devName = useMemo(() => extractGitUrl(repoUrl).owner, [repoUrl]);
  const updating = useUpdatingCard(id);
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const allMethods = useAllCardMethods();

  const dispatch = useDispatch<AppDispatch>();

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    AddBreadcrumb_Renderer(`Start Update AI: id:${id}`);
    if (getCardMethod(allMethods, id, 'manager')?.updater.startUpdate) {
      openModal('installUI', {cardId: id, type: 'update', title}, 'active');
      setMenuIsOpen(false);
    } else if (webUi && webUi.dir) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      setMenuIsOpen(false);
      rendererIpc.git.pull(webUi.dir, id);
    }
  }, [dispatch, setMenuIsOpen, webUi, devName, id, title, openModal]);

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

  const devName = useMemo(() => extractGitUrl(repoUrl).owner, [repoUrl]);
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
