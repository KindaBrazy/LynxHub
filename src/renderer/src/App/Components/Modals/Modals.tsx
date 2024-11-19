import {memo, useMemo} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import CardExtensions from './CardExtensions/CardExtensions';
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
  } = useMemo(() => extensionsData.replaceModals, []);

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
    </>
  );
});

export default Modals;
