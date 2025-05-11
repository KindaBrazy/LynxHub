import {
  useAppTitleEvents,
  useBrowserEvents,
  useCheckCardsUpdate,
  useCheckExtensionsUpdate,
  useCheckModulesUpdate,
  useContextEvents,
  useHotkeyEvents,
  useIpcEvents,
  useNewTabEvents,
  useOnlineEvents,
  usePatreon,
  useStorageData,
} from './AppEvents_Hooks';

/** Listening for various app events and modify redux states */
export default function useAppEvents() {
  useCheckCardsUpdate();
  useCheckModulesUpdate();
  useCheckExtensionsUpdate();
  useOnlineEvents();
  useStorageData();
  usePatreon();
  useIpcEvents();
  useAppTitleEvents();
  useHotkeyEvents();
  useNewTabEvents();
  useBrowserEvents();
  useContextEvents();
}
