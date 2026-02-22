import {memo, useMemo} from 'react';

import {RestartModal} from './app/RestartModal';
import UpdateApp from './app/UpdateModal';
import CardExtensionsModal from './card/ExtensionsModal';
import GitManagerModal from './card/GitModal';
import CardInfoModal from './card/InfoModal';
import InstallCardModal from './card/InstallModal';
import LaunchConfigModal from './card/LaunchConfigModal';
import ReadMeModal from './card/ReadmeModal';
import UnassignCardComp from './card/UnassignModal';
import UninstallCardComp from './card/UninstallModal';
import UpdatingNotification from './card/UpdatingModal';
import CustomNotification from './notification/CustomNotification';
import WarningModal from './notification/WarningModal';
import {extensionsData} from '@lynx/plugins/extensions/loader';

/**
 * Main Modals container component.
 * Renders all global modals and handles dynamic modal injection from extensions.
 * Wrapped in `memo` to prevent unnecessary re-renders.
 */
const Modals = memo(() => {
  // Use extension-provided components if available, otherwise fall back to default implementations
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
