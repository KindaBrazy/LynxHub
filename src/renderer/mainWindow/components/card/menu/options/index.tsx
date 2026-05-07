import {DropdownItem} from '@heroui/react';
import {Extensions2_Icon, GitHub_Icon} from '@lynx_assets/icons';
import {SettingsMinimalistic} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback} from 'react';

import {useGetInstallType} from '../../../../plugins/modules';
import {useCardStore} from '../../store';
import {CommonProps} from '../about/types';

/**
 * Menu item to open the launch configuration modal.
 */
export const LaunchConfigMenuItem = ({state}: CommonProps) => {
  const setMenuIsOpen = useCardStore(st => st.setMenuIsOpen);

  const onPress = useCallback(() => {
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen]);

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
export const ExtensionsMenuItem = ({state}: CommonProps) => {
  const setMenuIsOpen = useCardStore(st => st.setMenuIsOpen);
  const extensionsDir = useCardStore(st => st.extensionsDir);

  const onPress = useCallback(() => {
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen, state]);

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
export const RepoConfigMenuItem = ({state}: CommonProps) => {
  const id = useCardStore(st => st.id);
  const setMenuIsOpen = useCardStore(st => st.setMenuIsOpen);

  const installType = useGetInstallType(id);

  const onPress = useCallback(() => {
    state.open();
    setMenuIsOpen(false);
  }, [setMenuIsOpen]);

  if (installType === 'others') return null;

  return (
    <DropdownItem key="repoSetting" onPress={onPress}>
      <GitHub_Icon className="ml-0.5 size-3.5" />
      Repository
    </DropdownItem>
  );
};
