import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import CardExtensionsModal from './CardExtensions/CardExtensions';
import GitManagerModal from './CardGitManager/CardGitManager_Modal';
import CardInfoModal from './CardInfo/CardInfo-Modal';
import ReadMeModal from './CardReadme_Modal';
import InstallCardModal from './InstallUI/Install-Modal';
import LaunchConfigModal from './LaunchConfig/LaunchConfig';
import UninstallCardComp from './UninstallCard/UninstallCard';
import UpdateApp from './UpdateApp/UpdateApp';
import UpdatingNotification from './UpdatingCard/UpdatingNotification';
import WarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  const {warning: Warning, updateApp: UApp} = useMemo(() => extensionsData.replaceModals, []);

  const addModal = useMemo(() => extensionsData.addModal, []);

  return (
    <>
      <ReadMeModal />
      <UninstallCardComp />
      <InstallCardModal />
      <CardInfoModal />
      <CardExtensionsModal />
      <LaunchConfigModal />
      <GitManagerModal />

      <UpdatingNotification />

      {Warning ? <Warning /> : <WarningModal />}
      {UApp ? <UApp /> : <UpdateApp />}

      {addModal.map((Modal, index) => (
        <Modal key={index} />
      ))}
    </>
  );
});

export default Modals;
