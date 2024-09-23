import InstallUIModal from '@renderer/App/Components/Modals/InstallUI/InstallUIModal';
import {memo} from 'react';

import CardExtensions from './CardExtensions/CardExtensions';
import CardInfoModal from './CardInfo/CardInfo-Modal';
import InstallModal from './Install/InstallModal';
import LaunchConfig from './LaunchConfig/LaunchConfig';
import useUninstallCard from './UninstallCard/UninstallCard';
import UpdateApp from './UpdateApp/UpdateApp';
import UpdatingNotification from './UpdatingCard/UpdatingNotification';
import useWarningModal from './Warning/WarningModal';

const Modals = memo(() => {
  useWarningModal();
  useUninstallCard();

  return (
    <>
      <InstallModal />
      <InstallUIModal />
      <CardInfoModal />
      <UpdatingNotification />
      <CardExtensions />
      <LaunchConfig />
      <UpdateApp />
    </>
  );
});

export default Modals;
