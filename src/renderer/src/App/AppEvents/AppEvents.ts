import {
  useCheckCardsUpdate,
  useCheckModulesUpdate,
  useIpcEvents,
  useOnlineEvents,
  usePatreon,
  useStorageData,
} from './AppEvents_Hooks';

/** Listening for various app events and modify redux states */
export default function useAppEvents() {
  useCheckCardsUpdate();
  useCheckModulesUpdate();
  useOnlineEvents();
  useStorageData();
  usePatreon();
  useIpcEvents();
}
