import {memo} from 'react';

import {useExtensions} from '../../Extensions/ExtensionsContext';
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
  const {modals} = useExtensions();

  return (
    <>
      {modals?.WarningModal ? <modals.WarningModal /> : <WarningModal />}
      {modals?.UninstallCard ? <modals.UninstallCard /> : <UninstallCard />}
      {modals?.InstallModal ? <modals.InstallModal /> : <InstallModal />}
      {modals?.InstallUIModal ? <modals.InstallUIModal /> : <InstallUIModal />}
      {modals?.CardInfoModal ? <modals.CardInfoModal /> : <CardInfoModal />}
      {modals?.UpdatingNotification ? <modals.UpdatingNotification /> : <UpdatingNotification />}
      {modals?.CardExtensions ? <modals.CardExtensions /> : <CardExtensions />}
      {modals?.LaunchConfig ? <modals.LaunchConfig /> : <LaunchConfig />}
      {modals?.UpdateApp ? <modals.UpdateApp /> : <UpdateApp />}
    </>
  );
});

export default Modals;
