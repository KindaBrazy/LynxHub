import {DropdownItem} from '@heroui-v3/react';
import {Extensions2_Icon, GitHub_Icon} from '@lynx_assets/icons';
import {extractGitUrl} from '@lynx_common/utils';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useMemo} from 'react';

import {useGetInstallType} from '../../../plugins/modules';
import {useInstalledCard} from '../../../utils/hooks';
import {useTabModalManager} from '../../modals/useTabModalManager';
import {useCardStore} from '../store';

/**
 * Menu item to open the launch configuration modal.
 */
export const LaunchConfigMenuItem = () => {
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
    <DropdownItem onPress={onPress} key="launch-config">
      <SettingsMinimalistic className="size-4" />
      Launch Config
    </DropdownItem>
  );
};

/**
 * Menu item to open the extensions modal.
 * Hidden if the card has no extensions directory.
 */
export const ExtensionsMenuItem = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const repoUrl = useCardStore(state => state.repoUrl);
  const extensionsDir = useCardStore(state => state.extensionsDir);
  const title = useCardStore(state => state.title);

  const devName = useMemo(() => extractGitUrl(repoUrl).owner, [repoUrl]);
  const card = useInstalledCard(id);

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    if (card) {
      openModal(
        'cardExtensions',
        {
          dir: `${card.dir}${extensionsDir}`,
          title: `${title} (${devName}) Extensions`,
          id,
        },
        'active',
      );
    }
    setMenuIsOpen(false);
  }, [setMenuIsOpen, card, extensionsDir, title, devName, id, openModal]);

  if (!extensionsDir) return null;

  return (
    <DropdownItem key="extensions" onPress={onPress}>
      <Extensions2_Icon className="size-4" />
      Extensions
    </DropdownItem>
  );
};

/**
 * Menu item to open the repository configuration modal.
 * Hidden if the install type is 'others'.
 */
export const RepoConfigMenuItem = () => {
  const id = useCardStore(state => state.id);
  const setMenuIsOpen = useCardStore(state => state.setMenuIsOpen);
  const title = useCardStore(state => state.title);

  const installType = useGetInstallType(id);
  const webUI = useInstalledCard(id);
  const dir = webUI?.dir;

  const {openModal} = useTabModalManager();

  const onPress = useCallback(() => {
    if (dir) {
      openModal('gitManager', {dir, title: `${title} Repository Settings`}, 'active');
      setMenuIsOpen(false);
    }
  }, [setMenuIsOpen, dir, title, openModal]);

  if (installType === 'others') return null;

  return (
    <DropdownItem key="repoSetting" onPress={onPress}>
      <GitHub_Icon className="ml-0.5 size-3.5" />
      Repository
    </DropdownItem>
  );
};
