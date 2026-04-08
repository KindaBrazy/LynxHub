import {Button, ButtonGroup, Chip, Popover, PopoverContent, PopoverTrigger, Spinner} from '@heroui/react';
import {AppDispatch} from '@lynx/redux/store';
import {lynxTopToast} from '@lynx/utils/hooks';
import utilsIpc from '@lynx_shared/ipc/utils';
import {Broom} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export type CacheStats = {
  entryCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastCleanup: number;
  lastCleanupFormatted: string;
};

export default function ImageCache() {
  const [isClearCacheOpen, setIsClearCacheOpen] = useState<boolean>(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const loadCacheStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const stats = await utilsIpc.getImageCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      lynxTopToast(dispatch).error('Failed to load cache statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, [dispatch]);

  // Load cache stats on mount
  useEffect(() => {
    loadCacheStats();
  }, [loadCacheStats]);

  const handleClearImageCache = async () => {
    try {
      setIsClearing(true);
      const result = await utilsIpc.clearImageCache();
      if (result.success) {
        lynxTopToast(dispatch).success(`Cleared ${result.clearedEntries} cached images`);
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      lynxTopToast(dispatch).error('Failed to clear image cache');
    } finally {
      setIsClearing(false);
      setIsClearCacheOpen(false);
    }
  };
  return (
    <>
      {isLoadingStats ? (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : cacheStats ? (
        <>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-foreground-500">
                <SettingsSearchHighlight text="Cached Items:" />
              </span>
              <Chip size="sm" variant="flat" color="primary">
                {cacheStats.entryCount}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-500">
                <SettingsSearchHighlight text="Cache Size:" />
              </span>
              <Chip size="sm" variant="flat" color="secondary">
                {cacheStats.totalSizeFormatted}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-500">
                <SettingsSearchHighlight text="Last Cleanup:" />
              </span>
              <span className="text-xs text-foreground-400">
                {new Date(cacheStats.lastCleanup).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Popover
            size="sm"
            shadow="sm"
            isOpen={isClearCacheOpen}
            onOpenChange={setIsClearCacheOpen}
            classNames={{base: 'before:bg-foreground-100'}}
            showArrow>
            <PopoverTrigger>
              <Button
                variant="flat"
                color="warning"
                isLoading={isClearing}
                startContent={<Broom />}
                isDisabled={cacheStats.entryCount === 0 || isClearing}
                fullWidth>
                <SettingsSearchHighlight text="Clear Image Cache" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
              <span className="font-bold w-full text-sm">
                <SettingsSearchHighlight text="Clear Image Cache" />
              </span>
              <span>
                <SettingsSearchHighlight
                  text={`Clear ${cacheStats.entryCount} cached images (${cacheStats.totalSizeFormatted})?`}
                />
              </span>
              <ButtonGroup className="flex flex-row w-full mt-2" fullWidth>
                <Button size="sm" color="warning" startContent={<Broom />} onPress={handleClearImageCache}>
                  Clear
                </Button>
                <Button size="sm" className="cursor-default" onPress={() => setIsClearCacheOpen(false)}>
                  Cancel
                </Button>
              </ButtonGroup>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <span className="text-sm text-foreground-500">
          <SettingsSearchHighlight text="Failed to load cache information" />
        </span>
      )}
    </>
  );
}
