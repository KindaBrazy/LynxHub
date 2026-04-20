import {Button, Chip, User} from '@heroui/react';
import {usePluginsState} from '@lynx/redux/reducers/plugins';
import {useUserState} from '@lynx/redux/reducers/user';
import {PluginInstalledItem} from '@lynx_common/types/plugins';
import {extractGitUrl, getCacheUrl} from '@lynx_common/utils';
import {getPluginIconUrl} from '@lynx_common/utils/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {
  BoxMinimalistic,
  CalendarMinimalistic,
  HomeAngle2,
  SquareTopDown,
  User as UserIcon,
  WidgetAdd,
} from '@solar-icons/react-perf/BoldDuotone';
import {ArrowRight} from '@solar-icons/react-perf/LineDuotone';
import {useCallback, useMemo} from 'react';

import PluginActionButtons from './ActionButtons';

/**
 * Props for the {@link PluginPreviewHeader} component.
 */
interface PluginPreviewHeaderProps {
  /** The installed plugin entry if the selected plugin is currently installed, or undefined. */
  installedPlugin: PluginInstalledItem | undefined;
}

/**
 * Header section of the plugin preview panel.
 * Displays plugin metadata (title, version, date, type, owner, homepage link)
 * and exposes action buttons for install/uninstall/update operations.
 */
export default function PluginPreviewHeader({installedPlugin}: PluginPreviewHeaderProps) {
  const selectedPlugin = usePluginsState('selectedPlugin');
  const syncList = usePluginsState('syncList');

  // updateChannel is subscribed but only used to trigger recomputation when the user's
  // subscription tier changes (which may affect available versions).
  useUserState('updateChannel');

  const {resolvedVersion, releaseDate, isUpgradeAvailable, targetVersion, isInstalled} = useMemo(() => {
    const firstCompatibleVersion = selectedPlugin?.versions.find(v => v.isCompatible);

    const isInstalled = !!installedPlugin;

    const resolvedVersion = installedPlugin?.version || firstCompatibleVersion?.version || 'N/A';
    const syncTarget = syncList.find(item => item.id === selectedPlugin?.metadata.id);
    const isUpgradeAvailable = syncTarget?.type === 'upgrade';
    const targetVersion = syncTarget?.version;
    const releaseDate = selectedPlugin?.changes.find(entry => entry.version === resolvedVersion)?.date || 'N/A';

    return {resolvedVersion, releaseDate, isUpgradeAvailable, targetVersion, isInstalled};
  }, [installedPlugin, selectedPlugin, syncList]);

  const handleOpenHomePage = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin homepage: id:${selectedPlugin?.metadata.id}`);
    window.open(selectedPlugin?.url);
  }, [selectedPlugin?.metadata.id, selectedPlugin?.url]);

  const pluginOwner = extractGitUrl(selectedPlugin?.url || '').owner;
  const pluginType = selectedPlugin?.metadata.type;
  const pluginIconUrl = getCacheUrl(getPluginIconUrl(selectedPlugin?.url));

  return (
    <div
      className={
        `w-full flex flex-col sm:gap-y-2 shrink-0 ` + `${isInstalled ? 'min-[77rem]:flex-row' : 'min-[53rem]:flex-row'}`
      }>
      <div className="w-full flex flex-col">
        <User
          avatarProps={{
            src: pluginIconUrl,
            className: 'bg-black/0',
            showFallback: true,
            name: selectedPlugin?.metadata.title,
            radius: 'none',
          }}
          description={
            <div className="flex flex-row gap-x-2 items-center">
              {/* Version chip with optional upgrade/downgrade arrow indicator */}
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<BoxMinimalistic className="size-3.5" />}
                classNames={{content: 'flex flex-row items-center justify-center gap-x-1'}}>
                <span>
                  {resolvedVersion !== 'N/A' && 'v'}
                  {resolvedVersion}
                </span>
                {targetVersion && (
                  <>
                    <ArrowRight className="size-3" />
                    <span className={isUpgradeAvailable ? 'text-success' : 'text-warning'}>v{targetVersion}</span>
                  </>
                )}
              </Chip>

              {/* Release date chip */}
              <Chip
                size="sm"
                variant="light"
                className="text-foreground-600"
                startContent={<CalendarMinimalistic className="size-3.5" />}>
                {releaseDate}
              </Chip>

              {/* Plugin type indicator (extension vs module) */}
              <div
                className={`flex flex-row gap-x-1 items-center ${
                  pluginType === 'extension' ? 'text-primary-500' : 'text-secondary'
                }`}>
                <WidgetAdd />
                <span>{pluginType === 'extension' ? 'Extension' : 'Module'}</span>
              </div>
            </div>
          }
          className="self-start"
          name={<span className="font-semibold text-foreground text-xl">{selectedPlugin?.metadata.title}</span>}
        />

        {/* Owner & homepage link row */}
        <div className="flex flex-row items-center ml-12">
          <Chip variant="light" startContent={<UserIcon />}>
            {pluginOwner}
          </Chip>
          <Button
            size="sm"
            variant="light"
            className="text-small"
            onPress={handleOpenHomePage}
            startContent={<HomeAngle2 />}
            aria-label="Open plugin home page"
            endContent={<SquareTopDown className="size-3" />}>
            Home Page
          </Button>
        </div>
      </div>

      <PluginActionButtons isInstalled={isInstalled} currentVersion={resolvedVersion} />
    </div>
  );
}
