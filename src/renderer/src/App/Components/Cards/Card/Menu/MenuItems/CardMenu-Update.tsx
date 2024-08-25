import {Checkbox, DropdownItemProps, Spinner} from '@nextui-org/react';
import {useCallback, useEffect, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {getIconByName} from '../../../../../../assets/icons/SvgIconsContainer';
import {cardsActions} from '../../../../../Redux/AI/CardsReducer';
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

export const useUpdate = (): DropdownItemProps | undefined => {
  const {id, repoUrl, setMenuIsOpen, title} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);
  const updating = useUpdatingCard(id);
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    if (webUi) {
      dispatch(cardsActions.addUpdatingCard({devName, id, title}));
      setMenuIsOpen(false);
      rendererIpc.git.pull(webUi.dir, id);
    }
  }, [webUi, dispatch, devName, id, title, setMenuIsOpen]);

  return useMemo(
    () =>
      !updateAvailable || autoUpdate
        ? undefined
        : {
            className: 'cursor-default text-success',
            color: 'success',
            endContent: updating ? <Spinner size="sm" color="primary" /> : undefined,
            isDisabled: !!updating,
            key: 'update',
            onPress,
            startContent: getIconByName('Download'),
            title: 'Update',
          },
    [updateAvailable, autoUpdate, onPress, updating],
  );
};

export const useCheckForUpdate = (): DropdownItemProps | undefined => {
  const {id, checkingForUpdate, setCheckingForUpdate} = useCardData();
  const autoUpdate = useIsAutoUpdateCard(id);
  const webUi = useInstalledCard(id);
  const updateAvailable = useUpdateAvailable(id);

  const dispatch = useDispatch<AppDispatch>();

  const onPress = useCallback(() => {
    setCheckingForUpdate(true);
    if (webUi) {
      rendererIpc.git.bCardUpdateAvailable(webUi.dir).then((isAvailable: boolean) => {
        if (isAvailable) dispatch(cardsActions.addUpdateAvailable(id));
        setCheckingForUpdate(false);
      });
    }
  }, [webUi, dispatch, id]);

  return useMemo(
    () =>
      updateAvailable || autoUpdate
        ? undefined
        : {
            className: 'cursor-default',
            endContent: checkingForUpdate ? <Spinner size="sm" color="primary" /> : undefined,
            isDisabled: checkingForUpdate,
            key: 'check-update',
            onPress,
            startContent: getIconByName('Refresh'),
            title: 'Check Now',
          },
    [updateAvailable, autoUpdate, onPress, checkingForUpdate],
  );
};

export const useAutoUpdate = (): DropdownItemProps => {
  const {id, repoUrl, title} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);
  const autoUpdate = useIsAutoUpdateCard(id);
  const updateAvailable = useUpdateAvailable(id);
  const webUi = useInstalledCard(id);

  const dispatch = useDispatch<AppDispatch>();

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
  }, [autoUpdate, updateAvailable, webUi, dispatch, devName, id, title]);

  return useMemo(
    () => ({
      className: 'cursor-default',
      key: 'auto-update',
      onPress,
      textValue: 'Auto Update',
      title: (
        <Checkbox size="sm" isSelected={autoUpdate} onValueChange={onPress} className="cursor-default">
          Auto Update
        </Checkbox>
      ),
    }),
    [onPress, autoUpdate],
  );
};
