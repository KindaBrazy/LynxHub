import {
  useAppTitleEvents,
  useBrowserEvents,
  useCheckCardsUpdate,
  useCheckPluginsUpdate,
  useContextEvents,
  useHotkeyEvents,
  useIpcEvents,
  useListenForUpdateError,
  useNewTabEvents,
  useOnlineEvents,
  usePatreon,
  useShowToast,
  useStorageData,
} from './AppEvents_Hooks';

/** Listening for various app events and modify redux states */
export default function useAppEvents() {
  useCheckCardsUpdate();
  useCheckPluginsUpdate();
  useOnlineEvents();
  useStorageData();
  usePatreon();
  useIpcEvents();
  useAppTitleEvents();
  useHotkeyEvents();
  useNewTabEvents();
  useBrowserEvents();
  useContextEvents();
  useShowToast();
  useListenForUpdateError();
}
