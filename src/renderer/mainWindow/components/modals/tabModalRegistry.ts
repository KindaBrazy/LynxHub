import {modalActions} from '../../redux/reducers/modals';

/**
 * Registry of modal actions for tab-based modals.
 * Each entry defines the open, close, and remove actions for a specific modal type.
 */
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

/** Union of all available tab modal keys */
export type TabModalKey = keyof typeof tabModalRegistry;
