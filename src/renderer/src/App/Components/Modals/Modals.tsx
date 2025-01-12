import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import CardExtensions from './CardExtensions/CardExtensions';
import CardGitManager_Modal from './CardGitManager/CardGitManager_Modal';
import CardInfoModalNew from './CardInfo/CardInfo-Modal';
import CardReadmeModal from './CardReadme_Modal';
import InstallModal from './InstallUI/Install-Modal';
import LaunchConfig from './LaunchConfig/LaunchConfig';
import UninstallCard from './UninstallCard/UninstallCard';
import UpdateApp from './UpdateApp/UpdateApp';
import UpdatingNotification from './UpdatingCard/UpdatingNotification';
import WarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  const {
    warning: Warning,
    uninstallCard: Uninstall,
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

  // TODO: remove install modal from api
  return (
    <>
      {Warning ? <Warning /> : <WarningModal />}
      {Uninstall ? <Uninstall /> : <UninstallCard />}
      {InstallUi ? <InstallUi /> : <InstallModal />}
      {CInfo ? <CInfo /> : <CardInfoModalNew />}
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
