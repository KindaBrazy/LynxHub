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
import CardUpdateNotif from './UpdatingCard/UpdatingNotification';
import WarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  const {warning: Warning, updateApp: UApp} = useMemo(() => extensionsData.replaceModals, []);
  // TODO: add props to extensions modals

  const addModal = useMemo(() => extensionsData.addModal, []);

  return (
    <>
      <ReadMeModal />
      <UninstallCardComp />
      <InstallCardModal />
      <CardInfoModal />
      <CardUpdateNotif />
      <CardExtensionsModal />
      <LaunchConfigModal />
      <GitManagerModal />

      {Warning ? <Warning /> : <WarningModal />}
      {UApp ? <UApp /> : <UpdateApp />}

      {addModal.map((Modal, index) => (
        <Modal key={index} />
      ))}
    </>
  );
});

export default Modals;
