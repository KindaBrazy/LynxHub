import {Button, ButtonGroup, Chip, Popover, Spinner} from '@heroui-v3/react';
import {topToast} from '@lynx/layouts/ToastProviders';
import utilsIpc from '@lynx_shared/ipc/utils';
import {Broom} from '@solar-icons/react-perf/BoldDuotone';
import {useCallback, useEffect, useState} from 'react';

import DescriptionGrid from '../../../../components/DescriptionGrid';
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

  const loadCacheStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const stats = await utilsIpc.getImageCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      topToast.danger('Failed to load cache statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Load cache stats on mount
  useEffect(() => {
    loadCacheStats();
  }, [loadCacheStats]);

  const handleClearImageCache = async () => {
    try {
      setIsClearing(true);
      const result = await utilsIpc.clearImageCache();
      if (result.success) {
        topToast.success(`Cleared ${result.clearedEntries} cached images`);
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      topToast.danger('Failed to clear image cache');
    } finally {
      setIsClearing(false);
      setIsClearCacheOpen(false);
    }
  };
  return (
    <>
      {isLoadingStats ? (
        <div className="flex items-center justify-center py-4">
          <Spinner />
        </div>
      ) : cacheStats ? (
        <>
          <DescriptionGrid
            items={[
              {
                key: 'cached_items',
                label: <SettingsSearchHighlight text="Cached Items:" />,
                content: (
                  <Chip size="sm" color="accent" variant="soft">
                    {cacheStats.entryCount}
                  </Chip>
                ),
              },
              {
                key: 'cached_size',
                label: <SettingsSearchHighlight text="Cache Size:" />,
                content: (
                  <Chip size="sm" variant="soft" color="warning">
                    {cacheStats.totalSizeFormatted}
                  </Chip>
                ),
              },
              {
                key: 'last_cleanup',
                label: <SettingsSearchHighlight text="Last Cleanup:" />,
                content: (
                  <span className="text-xs text-foreground-400">
                    {new Date(cacheStats.lastCleanup).toLocaleDateString()}
                  </span>
                ),
              },
            ]}
            columns={3}
          />

          {cacheStats.entryCount === 0 || isClearing ? (
            <Button variant="danger-soft" isPending={isClearing} fullWidth isDisabled>
              <Broom />
              <SettingsSearchHighlight text="Clear Image Cache" />
            </Button>
          ) : (
            <Popover isOpen={isClearCacheOpen} onOpenChange={setIsClearCacheOpen}>
              <Popover.Trigger>
                <Button variant="danger-soft" isPending={isClearing} fullWidth>
                  <Broom />
                  <SettingsSearchHighlight text="Clear Image Cache" />
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <Popover.Arrow />
                <Popover.Dialog className="w-90">
                  <Popover.Heading>
                    <SettingsSearchHighlight text="Clear Image Cache" />
                  </Popover.Heading>
                  <p className="mt-1 text-sm text-muted">
                    Clear {cacheStats.entryCount} cached images ({cacheStats.totalSizeFormatted})?
                  </p>
                  <ButtonGroup className="mt-2" fullWidth>
                    <Button size="sm" variant="danger-soft" onPress={handleClearImageCache}>
                      <Broom />
                      Clear
                    </Button>
                    <Button size="sm" variant="secondary" onPress={() => setIsClearCacheOpen(false)}>
                      Cancel
                    </Button>
                  </ButtonGroup>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          )}
        </>
      ) : (
        <span className="text-sm text-foreground-500">
          <SettingsSearchHighlight text="Failed to load cache information" />
        </span>
      )}
    </>
  );
}
