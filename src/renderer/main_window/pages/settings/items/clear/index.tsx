import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@heroui/react';
import {Database} from '@solar-icons/react-perf/BoldDuotone';
import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';

import {BroomDuo_Icon, RefreshDuo_Icon, Trash_Icon} from '../../../../../shared/assets/icons';
import SettingsSection from '../../../../components/ContentSection';
import {lynxTopToast} from '../../../../hooks/utils';
import rendererIpc from '../../../../ipc';
import {AppDispatch} from '../../../../redux/store';
import SettingsSearchHighlight from '../../SettingsSearchHighlight';

export const SettingsClearId = 'settings_rmv_data_elem';

type CacheStats = {
  entryCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastCleanup: number;
  lastCleanupFormatted: string;
};

/** Clear app settings and cache */
export default function SettingsClear() {
  const [isClearSettingsOpen, setIsClearSettingsOpen] = useState<boolean>(false);
  const [isClearCacheOpen, setIsClearCacheOpen] = useState<boolean>(false);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  // Load cache stats on mount
  useEffect(() => {
    loadCacheStats();
  }, []);

  const loadCacheStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await rendererIpc.imageCache.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      lynxTopToast(dispatch).error('Failed to load cache statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const clearImageCache = async () => {
    try {
      setIsClearing(true);
      const result = await rendererIpc.imageCache.clearCache();
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
    <SettingsSection title="Clear" id={SettingsClearId} icon={<Trash_Icon className="size-5" />} itemsCenter>
      <Popover
        size="sm"
        shadow="sm"
        isOpen={isClearSettingsOpen}
        onOpenChange={setIsClearSettingsOpen}
        classNames={{base: 'before:bg-foreground-100'}}
        showArrow>
        <PopoverTrigger>
          <Button variant="flat" color="danger" startContent={<RefreshDuo_Icon />} fullWidth>
            <SettingsSearchHighlight text="Reset Settings (Restart Required)" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 gap-y-2 bg-foreground-100">
          <span className="font-bold w-full text-sm">
            <SettingsSearchHighlight text="Reset Settings" />
          </span>
          <span>
            <SettingsSearchHighlight text="Are you sure you want to reset all app settings and restart?" />
          </span>
          <ButtonGroup className="flex flex-row w-full mt-2" fullWidth>
            <Button size="sm" color="danger" startContent={<RefreshDuo_Icon />} onPress={rendererIpc.storage.clear}>
              Reset & Restart
            </Button>
            <Button size="sm" className="cursor-default" onPress={() => setIsClearSettingsOpen(false)}>
              Cancel
            </Button>
          </ButtonGroup>
        </PopoverContent>
      </Popover>

      {/* Image Cache Section */}
      <Card className="w-full border-1 border-foreground-100">
        <CardBody className="gap-3">
          <div className="flex items-center gap-2">
            <Database className="size-5 text-warning" />
            <span className="font-semibold">
              <SettingsSearchHighlight text="Image Cache" />
            </span>
          </div>

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
                    startContent={<BroomDuo_Icon />}
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
                    <Button size="sm" color="warning" onPress={clearImageCache} startContent={<BroomDuo_Icon />}>
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
        </CardBody>
      </Card>

      <span className="text-sm text-foreground-500">
        <SettingsSearchHighlight
          text={
            'Image cache stores remote images locally for faster loading. ' +
            'Cache is automatically cleaned every 7 days.'
          }
        />
      </span>
    </SettingsSection>
  );
}
