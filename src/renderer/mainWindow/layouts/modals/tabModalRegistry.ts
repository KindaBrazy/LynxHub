import {modalActions} from '@lynx/redux/reducers/modals';

export const tabModalRegistry = {
  readme: {
    open: modalActions.openReadme,
    close: modalActions.closeReadme,
    remove: modalActions.removeReadme,
  },
  cardInfo: {
    open: modalActions.openCardInfo,
    close: modalActions.closeCardInfo,
    remove: modalActions.removeCardInfo,
  },
  installUI: {
    open: modalActions.openInstallUICard,
    close: modalActions.closeInstallUICard,
    remove: modalActions.removeInstallUICard,
  },
  cardLaunchConfig: {
    open: modalActions.openCardLaunchConfig,
    close: modalActions.closeCardLaunchConfig,
    remove: modalActions.removeCardLaunchConfig,
  },
  cardExtensions: {
    open: modalActions.openCardExtensions,
    close: modalActions.closeCardExtensions,
    remove: modalActions.removeCardExtensions,
  },
  cardUninstall: {
    open: modalActions.openUninstallCard,
    close: modalActions.closeUninstallCard,
    remove: modalActions.removeUninstallCard,
  },
  cardUnassign: {
    open: modalActions.openUnassignCard,
    close: modalActions.closeUnassignCard,
    remove: modalActions.removeUnassignCard,
  },
  gitManager: {
    open: modalActions.openGitManager,
    close: modalActions.closeGitManager,
    remove: modalActions.removeGitManager,
  },
} as const;

export type TabModalKey = keyof typeof tabModalRegistry;
