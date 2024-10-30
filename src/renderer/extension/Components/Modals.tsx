import {ModalsComponent} from '../../../cross/ExtensionTypes';

const Modals: ModalsComponent = {};

export function UpdateApp() {
  return null;
}

export function LaunchConfig() {
  return null;
}

export function CardExtensions() {
  return null;
}

export function UpdatingNotification() {
  return null;
}

export function CardInfoModal() {
  return null;
}

export function InstallUIModal() {
  return null;
}

export function InstallModal() {
  return null;
}

export function UninstallCard() {
  return null;
}

export function WarningModal() {
  return null;
}

// !Important → Remove any unused Component from the below object

Modals.UpdateApp = UpdateApp;
Modals.LaunchConfig = LaunchConfig;
Modals.CardExtensions = CardExtensions;
Modals.UpdatingNotification = UpdatingNotification;
Modals.CardInfoModal = CardInfoModal;
Modals.InstallUIModal = InstallUIModal;
Modals.UninstallCard = UninstallCard;
Modals.InstallModal = InstallModal;
Modals.WarningModal = WarningModal;

export default Modals;
