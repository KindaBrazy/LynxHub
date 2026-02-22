import { Button, Radio, RadioGroup } from '@heroui/react';
import { AppDispatch } from '@lynx/redux/store';
import { lynxTopToast } from '@lynx/utils/hooks';
import downloadManagerIpc from '@lynx_shared/ipc/downloadManager';
import { MoveToFolder } from '@solar-icons/react-perf/BoldDuotone';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import SettingsFilterItem from '../../SettingsFilterItem';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

/**
 * Custom hook encapsulating state and IPC interactions for browser download settings.
 * Includes fetching, modifying behavior, and resolving file paths.
 */
function useDownloadSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const [downloadLocation, setDownloadLocation] = useState<string>('');
  const [downloadBehavior, setDownloadBehavior] = useState<'ask' | 'default'>('default');

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingBehavior, setIsLoadingBehavior] = useState(false);

  const [locationError, setLocationError] = useState<string>('');
  const [behaviorError, setBehaviorError] = useState<string>('');

  // Load current settings on mount
  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const [locationResult, behaviorResult] = await Promise.all([
          downloadManagerIpc.invoke.getDownloadLocation(),
          downloadManagerIpc.invoke.getDownloadBehavior()
        ]);

        if (!isMounted) return;

        if (locationResult.success && locationResult.path) {
          setDownloadLocation(locationResult.path);
          setLocationError('');
        } else if (locationResult.error) {
          setLocationError(locationResult.error);
          lynxTopToast(dispatch).warning(`Failed to load download location: ${locationResult.error}`);
        }

        if (behaviorResult.success && behaviorResult.behavior) {
          setDownloadBehavior(behaviorResult.behavior);
          setBehaviorError('');
        } else if (behaviorResult.error) {
          setBehaviorError(behaviorResult.error);
          lynxTopToast(dispatch).warning(`Failed to load download behavior: ${behaviorResult.error}`);
        }
      } catch (error) {
        console.error('Failed to load download settings:', error);
        if (isMounted) lynxTopToast(dispatch).warning('Failed to load download settings!');
      }
    };

    loadSettings();
    return () => { isMounted = false; };
  }, [dispatch]);

  const handleChangeLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError('');
    try {
      const result = await downloadManagerIpc.invoke.openLocationDialog();
      if (result.success && result.path) {
        setDownloadLocation(result.path);
        setLocationError('');
        lynxTopToast(dispatch).success('Download location updated successfully!');
      } else if (result.error && result.error !== 'Cancelled') {
        setLocationError(result.error);
        lynxTopToast(dispatch).error(`Failed to update location: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLocationError(errorMessage);
      lynxTopToast(dispatch).error('Failed to open location dialog!');
    } finally {
      setIsLoadingLocation(false);
    }
  }, [dispatch]);

  const handleBehaviorChange = useCallback(
    async (value: string) => {
      const behavior = value as 'ask' | 'default';
      setIsLoadingBehavior(true);
      setBehaviorError('');
      try {
        const result = await downloadManagerIpc.invoke.setDownloadBehavior(behavior);
        if (result.success) {
          setDownloadBehavior(behavior);
          setBehaviorError('');
          lynxTopToast(dispatch).success('Download behavior updated successfully!');
        } else {
          setBehaviorError(result.error || 'Unknown error');
          lynxTopToast(dispatch).error(`Failed to update behavior: ${result.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setBehaviorError(errorMessage);
        lynxTopToast(dispatch).error('Failed to update download behavior!');
      } finally {
        setIsLoadingBehavior(false);
      }
    },
    [dispatch],
  );

  return {
    downloadLocation,
    downloadBehavior,
    isLoadingLocation,
    isLoadingBehavior,
    locationError,
    behaviorError,
    handleChangeLocation,
    handleBehaviorChange,
  };
}

/**
 * Settings component to configure default download behavior and persistent drop folder mappings.
 */
export default function Downloads() {
  const {
    downloadLocation,
    downloadBehavior,
    isLoadingLocation,
    isLoadingBehavior,
    locationError,
    behaviorError,
    handleChangeLocation,
    handleBehaviorChange,
  } = useDownloadSettings();

  const locationTitle = 'Download Location';
  const locationDescription = 'Choose where downloaded files are saved';
  const behaviorTitle = 'Download Behavior';
  const behaviorDescription = 'Control how downloads are handled';

  const locationSearchTexts = useMemo(
    () => [locationTitle, locationDescription, 'download', 'location', 'folder', 'directory', 'save'],
    []
  );

  const behaviorSearchTexts = useMemo(
    () => [behaviorTitle, behaviorDescription, 'download', 'behavior', 'ask', 'default', 'prompt', 'automatic'],
    []
  );

  return (
    <>
      <SettingsFilterItem searchTexts={locationSearchTexts}>
        <div className="flex flex-col gap-2 bg-default-100 rounded-lg px-4 py-2.5 border-2 border-transparent">
          <div className="flex flex-col gap-1">
            <SettingsSearchHighlight text={locationTitle} className="text-sm font-medium" />
            <SettingsSearchHighlight text={locationDescription} className="text-tiny text-default-400" />
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex flex-row items-center gap-2">
              <div
                className={`flex-1 text-xs font-mono rounded-lg px-2 py-1.5 truncate ${locationError
                    ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                    : 'text-default-500 bg-default-200'
                  }`}>
                {downloadLocation || 'Loading...'}
              </div>
              <Button
                size="sm"
                variant="flat"
                color="secondary"
                isLoading={isLoadingLocation}
                onPress={handleChangeLocation}
                startContent={!isLoadingLocation && <MoveToFolder className="size-4" />}>
                Change Location
              </Button>
            </div>
            {locationError && (
              <p className="text-xs text-danger-600 dark:text-danger-400 px-1">Error: {locationError}</p>
            )}
          </div>
        </div>
      </SettingsFilterItem>

      <SettingsFilterItem searchTexts={behaviorSearchTexts}>
        <div className="flex flex-col gap-2 bg-default-100 rounded-lg px-4 py-2.5 border-2 border-transparent">
          <div className="flex flex-col gap-1">
            <SettingsSearchHighlight text={behaviorTitle} className="text-sm font-medium" />
            <SettingsSearchHighlight text={behaviorDescription} className="text-tiny text-default-400" />
          </div>
          <div className="flex flex-col gap-2">
            <RadioGroup
              value={downloadBehavior}
              orientation="horizontal"
              isDisabled={isLoadingBehavior}
              classNames={{ wrapper: 'gap-4' }}
              onValueChange={handleBehaviorChange}>
              <Radio value="default" classNames={{ label: 'text-sm' }}>
                <SettingsSearchHighlight text="Use default location" />
              </Radio>
              <Radio value="ask" classNames={{ label: 'text-sm' }}>
                <SettingsSearchHighlight text="Always ask where to save" />
              </Radio>
            </RadioGroup>
            {behaviorError && (
              <p className="text-xs text-danger-600 dark:text-danger-400 px-1">Error: {behaviorError}</p>
            )}
          </div>
        </div>
      </SettingsFilterItem>
    </>
  );
}
