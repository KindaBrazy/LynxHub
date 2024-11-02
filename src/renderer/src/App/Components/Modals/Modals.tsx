import {memo, useState} from 'react';

import {extensionsData} from '../../Extensions/ExtensionLoader';
import CardExtensions from './CardExtensions/CardExtensions';
import CardInfoModal from './CardInfo/CardInfo-Modal';
import InstallModal from './Install/InstallModal';
import InstallUIModal from './InstallUI/InstallUI-Modal';
import LaunchConfig from './LaunchConfig/LaunchConfig';
import UninstallCard from './UninstallCard/UninstallCard';
import UpdateApp from './UpdateApp/UpdateApp';
import UpdatingNotification from './UpdatingCard/UpdatingNotification';
import WarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  const [modals] = useState(extensionsData.replaceModals);

  return (
    <>
      {modals.warning ? <modals.warning /> : <WarningModal />}
      {modals.uninstallCard ? <modals.uninstallCard /> : <UninstallCard />}
      {modals.install ? <modals.install /> : <InstallModal />}
      {modals.installUi ? <modals.installUi /> : <InstallUIModal />}
      {modals.cardInfo ? <modals.cardInfo /> : <CardInfoModal />}
      {modals.updatingNotification ? <modals.updatingNotification /> : <UpdatingNotification />}
      {modals.cardExtensions ? <modals.cardExtensions /> : <CardExtensions />}
      {modals.launchConfig ? <modals.launchConfig /> : <LaunchConfig />}
      {modals.updateApp ? <modals.updateApp /> : <UpdateApp />}
    </>
  );
});

export default Modals;
