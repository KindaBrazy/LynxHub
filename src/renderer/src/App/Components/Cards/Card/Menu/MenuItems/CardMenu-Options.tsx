import {DropdownItemProps} from '@nextui-org/react';
import {useCallback, useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {Extensions2_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {Pin_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons2';
import {SettingsMinimal_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import rendererIpc from '../../../../../RendererIpc';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useInstalledCard, useIsPinnedCard} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export const useLaunchConfig = (): DropdownItemProps => {
  const dispatch = useDispatch<AppDispatch>();
  const {id, setMenuIsOpen, title, repoUrl, haveArguments} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);

  const onPress = useCallback(() => {
    dispatch(modalActions.openCardLaunchConfig({id: id, title: `${title} (${devName}) Launch Config`, haveArguments}));
    setMenuIsOpen(false);
  }, [dispatch, id, title, devName, haveArguments, setMenuIsOpen]);

  return useMemo(
    () => ({
      className: 'cursor-default',
      key: 'launch-config',
      onPress,
      startContent: <SettingsMinimal_Icon />,
      title: 'Launch Config',
    }),
    [onPress],
  );
};

export const useExtensions = (): DropdownItemProps | undefined => {
  const dispatch = useDispatch<AppDispatch>();
  const {id, repoUrl, extensionsDir, setMenuIsOpen, title} = useCardData();
  const {name: devName} = useDevInfo(repoUrl);
  const card = useInstalledCard(id);

  const onPress = useCallback(() => {
    if (card)
      dispatch(
        modalActions.openCardExtensions({
          dir: `${card.dir}${extensionsDir}`,
          title: `${title} (${devName}) Extensions`,
          id,
        }),
      );
    setMenuIsOpen(false);
  }, [card, dispatch, extensionsDir, title, devName, setMenuIsOpen]);

  return useMemo(
    () =>
      extensionsDir
        ? {
            className: 'cursor-default',
            key: 'extensions',
            onPress,
            startContent: <Extensions2_Icon />,
            title: 'Extensions',
          }
        : undefined,
    [onPress],
  );
};

export const usePin = (): DropdownItemProps => {
  const {id} = useCardData();
  const isPinned = useIsPinnedCard(id);

  const onPress = useCallback(
    () => rendererIpc.storageUtils.pinnedCards(isPinned ? 'remove' : 'add', id),
    [isPinned, id],
  );

  const title = useMemo(() => (isPinned ? 'Unpin' : 'Pin'), [isPinned]);
  const startContent = useMemo(
    () => <Pin_Icon className={`${isPinned ? 'rotate-45' : 'rotate-0'} transition duration-500`} />,
    [isPinned],
  );

  return useMemo(
    () => ({
      className: 'cursor-default',
      key: 'pin-unpin',
      onPress,
      startContent,
      title,
    }),
    [onPress, title, startContent],
  );
};
