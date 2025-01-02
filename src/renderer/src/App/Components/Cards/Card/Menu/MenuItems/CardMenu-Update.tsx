import {Checkbox, DropdownItem, Spinner} from '@nextui-org/react';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {Download_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Refresh_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {getMethod} from '../../../../../Modules/ModuleLoader';
import {cardsActions} from '../../../../../Redux/AI/CardsReducer';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {
  useInstalledCard,
  useIsAutoUpdateCard,
  useUpdateAvailable,
  useUpdatingCard,
} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export const MenuUpdate = () => {
  const {id, repoUrl, setMenuIsOpen, title} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);
  const updating = useUpdatingCard(id);
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const [customUpdate, setCustomUpdate] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (getMethod(id, 'manager')?.updater.updateType === 'stepper') {
      setCustomUpdate(true);
    }
  }, [id]);

  const onPress = useCallback(() => {
    if (getMethod(id, 'manager')?.updater.startUpdate) {
      dispatch(modalActions.openInstallUICard({id, type: 'update', title}));
      setMenuIsOpen(false);
    } else if (webUi) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      setMenuIsOpen(false);
      rendererIpc.git.pull(webUi.dir, id);
    }
  }, [dispatch, setMenuIsOpen, webUi, devName, id, title]);

  if (!customUpdate && (!updateAvailable || autoUpdate))
    return <DropdownItem className="hidden" key="update-hidden" textValue="update_hidden" />;

  return (
    <DropdownItem
      key="update"
      title="Update"
      onPress={onPress}
      isDisabled={!!updating}
      startContent={<Download_Icon />}
      color={customUpdate ? 'default' : 'success'}
      endContent={updating && <Spinner size="sm" color="primary" />}
      className={`cursor-default ${!customUpdate && 'text-success'}`}
    />
  );
};

export const MenuCheckForUpdate = () => {
  const {id, checkingForUpdate, setCheckingForUpdate} = useCardData();
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const [customUpdate, setCustomUpdate] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (getMethod(id, 'manager')?.updater.updateType === 'stepper') {
      setCustomUpdate(true);
    }
  }, [setCustomUpdate, id]);

  const onPress = useCallback(() => {
    setCheckingForUpdate(true);
    if (webUi) {
      rendererIpc.git.bCardUpdateAvailable(webUi.dir).then((isAvailable: boolean) => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        setCheckingForUpdate(false);
      });
    }
  }, [dispatch, setCheckingForUpdate, webUi, id]);

  if (updateAvailable || autoUpdate || customUpdate)
    return <DropdownItem className="hidden" key="check-update-hidden" textValue="check_update_hidden" />;

  return (
    <DropdownItem
      title="Check Now"
      onPress={onPress}
      key="check-update"
      className="cursor-default"
      isDisabled={checkingForUpdate}
      startContent={<Refresh_Icon />}
      endContent={checkingForUpdate && <Spinner size="sm" color="primary" />}
    />
  );
};

export const MenuAutoUpdate = () => {
  const {id, repoUrl, title} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);
  const autoUpdate = useIsAutoUpdateCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const webUi = useInstalledCard(id);
  const [customUpdate, setCustomUpdate] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (getMethod(id, 'manager')?.updater.updateType === 'stepper') {
      setCustomUpdate(true);
    }
  }, [id]);

  const onPress = useCallback(
    () =>
      autoUpdate ? rendererIpc.storageUtils.removeAutoUpdateCard(id) : rendererIpc.storageUtils.addAutoUpdateCard(id),
    [autoUpdate, id],
  );

  useEffect(() => {
    if (autoUpdate && updateAvailable && webUi) {
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
