import {extensionsData} from '@lynx/plugins/extensions/loader';
import {memo, useMemo} from 'react';

import {RestartModal} from './app_restart';
import UpdateApp from './app_update';
import CardExtensionsModal from './card_extensions';
import GitManagerModal from './card_git';
import CardInfoModal from './card_info';
import InstallCardModal from './card_install';
import LaunchConfigModal from './card_launch_config';
import ReadMeModal from './card_readme';
import UnassignCardComp from './card_unassign';
import UninstallCardComp from './card_uninstall';
import UpdatingNotification from './card_updating';
import CustomNotification from './custom_notification';
import WarningModal from './warning';

const Modals = memo(() => {
  const {warning: Warning, updateApp: UApp} = useMemo(() => extensionsData.replaceModals, []);

  const addModal = useMemo(() => extensionsData.addModal, []);

  return (
    <>
      <ReadMeModal />
      <UninstallCardComp />
      <UnassignCardComp />
      <InstallCardModal />
      <CardInfoModal />
      <CardExtensionsModal />
      <LaunchConfigModal />
      <GitManagerModal />
      <RestartModal />

      <UpdatingNotification />
      <CustomNotification />

      {Warning ? <Warning /> : <WarningModal />}
      {UApp ? <UApp /> : <UpdateApp />}

      {addModal.map((Modal, index) => (
        <Modal key={index} />
      ))}
    </>
  );
});

export default Modals;
