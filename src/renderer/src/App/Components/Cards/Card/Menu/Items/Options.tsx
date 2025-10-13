import {DropdownItem} from '@heroui/react';
import {useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {Extensions2_Icon, GitHub_Icon, SettingsMinimal_Icon} from '../../../../../../assets/icons/SvgIcons/SvgIcons';
import {useGetInstallType} from '../../../../../Modules/ModuleLoader';
import {modalActions} from '../../../../../Redux/Reducer/ModalsReducer';
import {useTabsState} from '../../../../../Redux/Reducer/TabsReducer';
import {AppDispatch} from '../../../../../Redux/Store';
import {useDevInfo} from '../../../../../Utils/LocalStorage';
import {useInstalledCard} from '../../../../../Utils/UtilHooks';
import {useCardStore} from '../../Wrapper';

export const MenuLaunchConfig = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');

  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const haveArguments = useCardStore(state => state.haveArguments);
  const title = useCardStore(state => state.title);

  const onPress = useCallback(() => {
    dispatch(
      modalActions.openCardLaunchConfig({id: id, title: `${title} Launch Config`, haveArguments, tabID: activeTab}),
    );
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, title, haveArguments, id, activeTab]);

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
  const activeTab = useTabsState('activeTab');

  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const repoUrl = useCardStore(state => state.repoUrl);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const title = useCardStore(state => state.title);

  const {name: devName} = useDevInfo(repoUrl);
  const card = useInstalledCard(id);

  const onPress = useCallback(() => {
    if (card)
      dispatch(
        modalActions.openCardExtensions({
          dir: `${card.dir}${extensionsDir}`,
          title: `${title} (${devName}) Extensions`,
          id,
          tabID: activeTab,
        }),
      );
    setMenuIsOpen(false);
  }, [dispatch, setMenuIsOpen, card, extensionsDir, title, devName, activeTab]);

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

export const MenuRepoConfig = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const title = useCardStore(state => state.title);

  const installType = useGetInstallType(id);
  const dispatch = useDispatch<AppDispatch>();
  const activeTab = useTabsState('activeTab');
  const dir = useInstalledCard(id)?.dir;

  const onPress = useCallback(() => {
    if (dir) {
      dispatch(modalActions.openGitManager({dir, title: `${title} Repository Settings`, tabID: activeTab}));
      setMenuIsOpen(false);
    }
  }, [dispatch, setMenuIsOpen, dir, title]);

  if (installType === 'others')
    return <DropdownItem className="hidden" key="repoSetting-hidden" textValue="repoSetting_hidden" />;

  return (
    <DropdownItem
      key="repoSetting"
      onPress={onPress}
      title="Repository"
      className="cursor-default"
      startContent={<GitHub_Icon className="size-[0.77rem]" />}
    />
  );
};
