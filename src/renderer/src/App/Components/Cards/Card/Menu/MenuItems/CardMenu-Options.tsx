import {DropdownItem} from '@nextui-org/react';
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

export const MenuLaunchConfig = () => {
  console.log('MenuLaunchConfig');
  const dispatch = useDispatch<AppDispatch>();
  const {id, setMenuIsOpen, title, haveArguments} = useCardData();

  const onPress = useCallback(() => {
    dispatch(modalActions.openCardLaunchConfig({id: id, title: `${title} Launch Config`, haveArguments}));
    setMenuIsOpen(false);
  }, []);

  return (
    <DropdownItem
      onPress={onPress}
      key="launch-config"
      title="Launch Config"
      className="cursor-default"
      startContent={<SettingsMinimal_Icon />}
    />
  );
};

export const MenuExtensions = () => {
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

  return extensionsDir ? (
    <DropdownItem
      key="extensions"
      onPress={onPress}
      title="Extensions"
      className="cursor-default"
      startContent={<Extensions2_Icon />}
    />
  ) : (
    <DropdownItem className="hidden" key="extensions-hidden" textValue="extensions_hidden" />
  );
};

export const MenuPin = () => {
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

  return (
    <DropdownItem
      title={title}
      key="pin-unpin"
      onPress={onPress}
      className="cursor-default"
      startContent={startContent}
    />
  );
};
