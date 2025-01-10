import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import CardExtensions from './CardExtensions/CardExtensions';
import CardGitManager_Modal from './CardGitManager/CardGitManager_Modal';
import CardInfoModal from './CardInfo/CardInfo-Modal';
import CardReadmeModal from './CardReadme_Modal';
import InstallModal from './Install/InstallModal';
import InstallUIModal from './InstallUI/InstallUI-Modal';
import LaunchConfig from './LaunchConfig/LaunchConfig';
import UninstallCard from './UninstallCard/UninstallCard';
import UpdateApp from './UpdateApp/UpdateApp';
import UpdatingNotification from './UpdatingCard/UpdatingNotification';
import WarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  const {
    warning: Warning,
    uninstallCard: Uninstall,
    install: Install,
    installUi: InstallUi,
    cardInfo: CInfo,
    updatingNotification: UNotification,
    cardExtensions: CExtensions,
    launchConfig: LConfig,
    updateApp: UApp,
    cardReadme: CardReadme,
    gitManager: GitManager,
  } = useMemo(() => extensionsData.replaceModals, []);

  const addModal = useMemo(() => extensionsData.addModal, []);

  // TODO: add CardGitManager_Modal to extension api
  return (
    <>
      {Warning ? <Warning /> : <WarningModal />}
      {Uninstall ? <Uninstall /> : <UninstallCard />}
      {Install ? <Install /> : <InstallModal />}
      {InstallUi ? <InstallUi /> : <InstallUIModal />}
      {CInfo ? <CInfo /> : <CardInfoModal />}
      {UNotification ? <UNotification /> : <UpdatingNotification />}
      {CExtensions ? <CExtensions /> : <CardExtensions />}
      {LConfig ? <LConfig /> : <LaunchConfig />}
      {UApp ? <UApp /> : <UpdateApp />}
      {CardReadme ? <CardReadme /> : <CardReadmeModal />}
      {GitManager ? <GitManager /> : <CardGitManager_Modal />}
      {addModal.map((Modal, index) => (
        <Modal key={index} />
      ))}
    </>
  );
});

export default Modals;
