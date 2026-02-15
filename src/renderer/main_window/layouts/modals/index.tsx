import {extensionsData} from '@lynx/plugins/extensions/loader';
import {memo, useMemo} from 'react';

import {RestartModal} from './appRestart';
import UpdateApp from './appUpdate';
import CardExtensionsModal from './cardExtensions';
import GitManagerModal from './cardGit';
import CardInfoModal from './cardInfo';
import InstallCardModal from './cardInstall';
import LaunchConfigModal from './cardLaunchConfig';
import ReadMeModal from './cardReadme';
import UnassignCardComp from './cardUnassign';
import UninstallCardComp from './cardUninstall';
import UpdatingNotification from './cardUpdating';
import CustomNotification from './customNotification';
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
