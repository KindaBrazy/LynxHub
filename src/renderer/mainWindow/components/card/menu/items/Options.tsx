import {DropdownItem} from '@heroui/react';
import {useGetInstallType} from '@lynx/plugins/modules';
import {useInstalledCard} from '@lynx/utils/hooks';
import {Extensions2_Icon, GitHub_Icon} from '@lynx_assets/icons';
import {extractGitUrl} from '@lynx_common/utils';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useMemo} from 'react';

import {useTabModalManager} from '../../../modals/useTabModalManager';
import {useCardStore} from '../../Wrapper';

export const MenuLaunchConfig = () => {
  const {openModal} = useTabModalManager();

  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const haveArguments = useCardStore(state => state.haveArguments);
  const title = useCardStore(state => state.title);

  const onPress = useCallback(() => {
    openModal('cardLaunchConfig', {id, title: `${title} Launch Config`, haveArguments}, 'active');
    setMenuIsOpen(false);
  }, [setMenuIsOpen, title, haveArguments, id, openModal]);

  return (
    <DropdownItem
      onPress={onPress}
      key="launch-config"
      title="Launch Config"
      className="cursor-default"
      startContent={<SettingsMinimalistic className="size-4" />}
    />
  );
};

export const MenuExtensions = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const repoUrl = useCardStore(state => state.repoUrl);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const title = useCardStore(state => state.title);

  const devName = useMemo(() => extractGitUrl(repoUrl).owner, [repoUrl]);
  const card = useInstalledCard(id);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    if (card)
      openModal(
        'cardExtensions',
        {
          dir: `${card.dir}${extensionsDir}`,
          title: `${title} (${devName}) Extensions`,
          id,
        },
        'active',
      );
    setMenuIsOpen(false);
  }, [setMenuIsOpen, card, extensionsDir, title, devName, id, openModal]);

  return extensionsDir ? (
    <DropdownItem
      key="extensions"
      onPress={onPress}
      title="Extensions"
      className="cursor-default"
      startContent={<Extensions2_Icon className="size-4" />}
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
  const dir = useInstalledCard(id)?.dir;

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    if (dir) {
      openModal('gitManager', {dir, title: `${title} Repository Settings`}, 'active');
      setMenuIsOpen(false);
    }
  }, [setMenuIsOpen, dir, title, openModal]);

  if (installType === 'others')
    return <DropdownItem className="hidden" key="repoSetting-hidden" textValue="repoSetting_hidden" />;

  return (
    <DropdownItem
      key="repoSetting"
      onPress={onPress}
      title="Repository"
      className="cursor-default"
      startContent={<GitHub_Icon className="ml-0.5 size-3.5" />}
    />
  );
};
