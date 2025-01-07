import {DropdownItem} from '@nextui-org/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Extensions2_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons1';
import {SettingsMinimal_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons3';
import {modalActions} from '../../../../../Redux/AI/ModalsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardData} from '../../../CardsDataManager';

export const MenuLaunchConfig = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {id, setMenuIsOpen, title, haveArguments} = useCardData();

  const onPress = useCallback(() => {
    dispatch(modalActions.openCardLaunchConfig({id: id, title: `${title} Launch Config`, haveArguments}));
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, title, haveArguments, id]);

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
  }, [dispatch, setMenuIsOpen, card, extensionsDir, title, devName]);

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
