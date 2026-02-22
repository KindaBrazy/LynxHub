import { Switch } from '@heroui/react';
import { useCardsState } from '@lynx/redux/reducers/cards';
import { useVolumeState, volumeActions } from '@lynx/redux/reducers/volume';
import { AppDispatch } from '@lynx/redux/store';
import { lynxTopToast } from '@lynx/utils/hooks';
import browserIpc from '@lynx_shared/ipc/browser';
import storageIpc from '@lynx_shared/ipc/storage';
import { Volume, VolumeCross } from '@solar-icons/react-perf/BoldDuotone';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/**
 * Custom hook encapsulating logic for managing and persisting global audio mute settings.
 * Synchronizes the setting with browser tabs dynamically.
 */
function useAudioControlSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const globalMuted = useVolumeState('globalMuted');
  const tabMuted = useVolumeState('tabMuted');
  const runningCards = useCardsState('runningCard');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize browser tabs to avoid recalculation
  const browserTabs = useMemo(() => runningCards.filter(card => card.type === 'browser'), [runningCards]);

  // Apply global mute to all active browser tabs
  const applyGlobalMuteToAllTabs = useCallback(
    async (muted: boolean) => {
      for (const card of browserTabs) {
        const isTabMuted = tabMuted[card.tabId] ?? false;
        const effectiveMute = isTabMuted || muted;

        try {
          await browserIpc.invoke.setMuted(card.id, effectiveMute);
        } catch (error) {
          console.error(`Failed to apply mute to tab ${card.tabId}:`, error);
        }
      }
    },
    [browserTabs, tabMuted],
  );

  // Debounced save to storage
  const saveToStorage = useCallback(
    async (muted: boolean) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const currentData = await storageIpc.get('browser');
          const currentSettings = currentData.volumeSettings || {
            globalMuted: false,
            tabVolumes: {},
          };

          await storageIpc.update('browser', {
            volumeSettings: {
              ...currentSettings,
              globalMuted: muted,
            },
          });
        } catch (error) {
          console.error('Failed to save volume settings:', error);
          lynxTopToast(dispatch).error('Failed to save volume settings!');
        }
      }, 500);
    },
    [dispatch],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleMuteToggle = useCallback(
    (checked: boolean) => {
      try {
        dispatch(volumeActions.setGlobalMuted(checked));
        saveToStorage(checked);
        applyGlobalMuteToAllTabs(checked);
      } catch (error) {
        console.error('Failed to toggle global mute:', error);
        lynxTopToast(dispatch).error('Failed to toggle global mute');
      }
    },
    [dispatch, saveToStorage, applyGlobalMuteToAllTabs],
  );

  return {
    globalMuted,
    handleMuteToggle,
  };
}

/**
 * Settings component controlling global audio mute behavior. 
 */
export default function AudioControl() {
  const { globalMuted, handleMuteToggle } = useAudioControlSettings();

  const muteTitle = 'Global Mute';
  const muteDescription =
    'Mute all browser audio. Individual tab mute controls remain functional but have no audible effect when global mute is enabled.';

  const muteSearchTexts = useMemo(
    () => [muteTitle, muteDescription, 'audio', 'mute', 'silence', 'sound', 'global', 'all', 'tabs'],
    [],
  );

  return (
    <SettingsFilterItem searchTexts={muteSearchTexts}>
      <div className="flex flex-col gap-2 rounded-lg border-2 border-transparent bg-default-100 px-4 py-2.5">
        <div className="flex flex-col gap-1">
          <SettingsSearchHighlight text={muteTitle} className="text-sm font-medium" />
          <SettingsSearchHighlight text={muteDescription} className="text-tiny text-default-400" />
        </div>
        <div className="mt-1 flex flex-row items-center gap-3">
          {globalMuted ? (
            <VolumeCross aria-hidden="true" className="size-5 shrink-0 text-danger-500" />
          ) : (
            <Volume aria-hidden="true" className="size-5 shrink-0 text-default-500" />
          )}
          <Switch
            size="sm"
            isSelected={globalMuted}
            aria-checked={globalMuted}
            aria-label="Global mute toggle"
            onValueChange={handleMuteToggle}
            classNames={{ wrapper: globalMuted ? 'bg-danger-500' : 'bg-default-300' }}>
            <span className="text-sm">{globalMuted ? 'All audio muted' : 'Audio enabled'}</span>
          </Switch>
        </div>
      </div>
    </SettingsFilterItem>
  );
}
