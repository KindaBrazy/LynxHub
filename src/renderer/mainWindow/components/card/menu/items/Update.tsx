import {Checkbox, DropdownItem, Spinner} from '@heroui/react';
import {getCardMethod, useAllCardMethods} from '@lynx/plugins/modules';
import {cardsActions} from '@lynx/redux/reducers/cards';
import {AppDispatch} from '@lynx/redux/store';
import {useInstalledCard, useIsAutoUpdateCard, useUpdateAvailable, useUpdatingCard} from '@lynx/utils/hooks';
import {extractGitUrl} from '@lynx_common/utils';
import gitIpc from '@lynx_shared/ipc/git';
import moduleIpc from '@lynx_shared/ipc/plugins/module';
import {storageUtilsIpc} from '@lynx_shared/ipc/storage';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {DownloadMinimalistic, Refresh} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';

import {useTabModalManager} from '../../../modals/useTabModalManager';
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
      gitIpc.pull(webUi.dir, id);
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
      startContent={<DownloadMinimalistic className="size-4" />}
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
      moduleIpc.cardUpdateAvailable(card, updateType).then(isAvailable => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        setCheckingForUpdate(false);
      });
    }
  }, [dispatch, setCheckingForUpdate, card, id, allMethods]);

  if (updateAvailable || autoUpdate)
    return <DropdownItem className="hidden" key="check-update-hidden" textValue="check_update_hidden" />;

  return (
    <DropdownItem
      startContent={
        checkingForUpdate ? (
          <Spinner size="sm" color="primary" variant="gradient" className="scale-95" />
        ) : (
          <Refresh className="size-4" />
        )
      }
      onPress={onPress}
      key="check-update"
      title="Check For Updates"
      className="cursor-default"
      isDisabled={checkingForUpdate}
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
      storageUtilsIpc.send.removeAutoUpdateCard(id);
    } else {
      storageUtilsIpc.send.addAutoUpdateCard(id);
    }
  }, [autoUpdate, id]);

  useEffect(() => {
    if (autoUpdate && updateAvailable && webUi && webUi.dir) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      gitIpc.pull(webUi.dir, id);
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
