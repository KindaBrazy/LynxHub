import {
  Avatar,
  Button,
  Card,
  Chip,
  Description,
  Link,
  ProgressBar,
  Spinner,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import {
  pluginsActions,
  useIsInstallingPlugin,
  useIsUninstallingPlugin,
  usePluginsState,
} from '@lynx/redux/reducers/plugins';
import {AppDispatch} from '@lynx/redux/store';
import {showRestartModal} from '@lynx/utils';
import {Linux_Icon, MacOS_Icon, Windows_Icon} from '@lynx_assets/icons';
import {PluginInstalledItem, PluginItem} from '@lynx_common/types/plugins';
import {extractGitUrl, getCacheUrl, getFallbackString} from '@lynx_common/utils';
import {getPluginIconUrl} from '@lynx_common/utils/plugins';
import gitIpc from '@lynx_shared/ipc/git';
import pluginsIpc from '@lynx_shared/ipc/plugins';
import AddBreadcrumb_Renderer from '@lynx_shared/sentry/Breadcrumbs';
import {QuestionCircle} from '@solar-icons/react-perf/Bold';
import {SettingsMinimalistic, ShieldWarning, TrashBin2} from '@solar-icons/react-perf/BoldDuotone';
import {ArrowRight, CheckRead} from '@solar-icons/react-perf/LineDuotone';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {SimpleGitProgressEvent} from 'simple-git';

import {topToast} from '../../../layouts/ToastProviders';
import {UpdateButton} from '../Elements';
import ModuleConfigModal from '../ModuleConfigModal';

/** Props for the PluginListItem component. */
interface PluginListItemProps {
  /** The plugin item details to display. */
  item: PluginItem;
  /** The list of currently installed plugins used to check the installation state. */
  installed: PluginInstalledItem[];
  /** Layout mode setting for layout customization. */
  layoutMode?: 'default' | 'compact';
}

/**
 * Renders an individual card representing a plugin (extension or module).
 * Handles standard (card) and compact (list) representations with smooth sizing.
 */
export function PluginListItem({item, installed, layoutMode = 'default'}: PluginListItemProps) {
  const dispatch = useDispatch<AppDispatch>();

  const selectedPlugin = usePluginsState('selectedPlugin');
  const skipped = usePluginsState('unloadedList');
  const syncList = usePluginsState('syncList');

  const isInstalling = useIsInstallingPlugin(item.metadata.id);
  const isUnInstalling = useIsUninstallingPlugin(item.metadata.id);

  const configModal = useOverlayState();

  const isSelected = useMemo(
    () => selectedPlugin?.metadata.id === item.metadata.id,
    [selectedPlugin, item.metadata.id],
  );

  const {isExtension, foundInstalled, foundUnloaded, win32, darwin, linux, isCompatible} = useMemo(() => {
    const isExt = item.metadata.type === 'extension';
    const compatible = item.isCompatible;

    const installedPlugin = installed.find(i => i.id === item.metadata.id);
    const unloadedPlugin = skipped.find(u => installedPlugin?.id === u.id);

    const hasLinux = item.versions.some(v => v.platforms.includes('linux'));
    const hasWin32 = item.versions.some(v => v.platforms.includes('win32'));
    const hasDarwin = item.versions.some(v => v.platforms.includes('darwin'));

    return {
      isExtension: isExt,
      foundInstalled: installedPlugin,
      foundUnloaded: unloadedPlugin,
      linux: hasLinux,
      win32: hasWin32,
      darwin: hasDarwin,
      isCompatible: compatible,
    };
  }, [item, installed, skipped]);

  const currentVersion = useMemo(() => {
    const targetInstallVersion = item.versions.find(versionItem => versionItem.isCompatible);

    if (foundInstalled) {
      return foundInstalled.version;
    }
    if (targetInstallVersion) {
      return targetInstallVersion.version;
    }

    return 'N/A';
  }, [item.versions, foundInstalled]);

  const {targetUpdate, targetVersion, isUpgrade} = useMemo(() => {
    const updateTarget = syncList.find(update => update.id === item.metadata.id);
    const upgradeState = updateTarget?.type === 'upgrade';
    const tgtVersion = updateTarget?.version;

    return {
      targetUpdate: updateTarget,
      isUpgrade: upgradeState,
      targetVersion: tgtVersion,
    };
  }, [syncList, item.metadata.id]);

  const handleUninstall = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      pluginsIpc.uninstall(item.metadata.id).then(result => {
        if (result) {
          topToast.success(`${item.metadata.title} uninstalled successfully`);
          showRestartModal(dispatch, 'To complete the uninstallation, please restart the app.');
          dispatch(pluginsActions.removeInstalled(item.metadata.id));
        }
      });
    },
    [item, dispatch],
  );

  const handleSelect = useCallback(() => {
    AddBreadcrumb_Renderer(`Plugin Select: id:${item.metadata.id}`);
    dispatch(pluginsActions.setSelectedPlugin(item));
  }, [dispatch, item]);

  // Render Compact Layout
  if (layoutMode === 'compact') {
    return (
      <Card
        className={
          `relative border border-surface/50 transition-all! duration-300!` +
          ` hover:bg-surface/70 dark:hover:bg-black/70 ${isCompatible ? 'cursor-pointer' : ''}` +
          ` ${isSelected && (isExtension ? 'border-accent!' : 'border-LynxPurple!')}` +
          ` px-3 py-2 min-h-14 flex flex-row items-center justify-between gap-x-2`
        }
        key={`${item.metadata.id}_plugin_compact_item`}
        onClick={isCompatible ? handleSelect : undefined}>
        {!isCompatible && (
          <div
            className={
              'absolute inset-0 z-20 flex flex-row items-center justify-between px-3' +
              ' bg-surface-tertiary/75 rounded-xl'
            }>
            <span className="text-xs font-semibold text-warning/90">Incompatible</span>
            {foundInstalled && (
              <Button size="sm" variant="danger-soft" onClick={handleUninstall} className="size-6 min-w-0 p-0">
                <TrashBin2 className="size-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Left Side: Avatar, Title and Author */}
        <div className="flex items-center gap-x-2.5 overflow-hidden min-w-0 flex-1">
          <Avatar className="size-8 min-w-8 shrink-0">
            <Avatar.Image alt={item.metadata.title} src={getCacheUrl(getPluginIconUrl(item.url))} />
            <Avatar.Fallback className="text-xs">{getFallbackString(item.metadata.title)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col min-w-0 overflow-hidden leading-tight">
            <div className="flex items-center gap-x-1.5">
              <Link
                onClick={e => {
                  e.stopPropagation();
                  window.open(item.url);
                }}
                className={`no-underline hover:underline text-sm font-semibold truncate ${
                  isExtension ? 'text-accent' : 'text-LynxPurple'
                }`}>
                {item.metadata.title}
              </Link>
              {foundInstalled && <CheckRead className="text-success size-3.5 shrink-0" />}
            </div>
            <span className="text-[10px] text-muted truncate">
              By <span className="font-semibold">{extractGitUrl(item.url).owner}</span>
            </span>
          </div>
        </div>

        {/* Right Side: Platforms, Version Info and Inline Actions */}
        <div className="flex items-center gap-x-2 shrink-0">
          {/* OS Platform Indicators */}
          <div className="flex items-center gap-x-0.5 max-sm:hidden">
            {linux && <Linux_Icon className="size-3 text-surface-foreground/60" />}
            {win32 && <Windows_Icon className="size-3 text-surface-foreground/60" />}
            {darwin && <MacOS_Icon className="size-3 text-surface-foreground/60" />}
          </div>

          {/* Compact Version Badge */}
          {currentVersion !== 'N/A' && (
            <span
              className={
                'text-[10px] bg-surface/50 px-1.5 py-0.5 rounded border border-surface/80' +
                ' text-muted font-medium flex items-center gap-x-1'
              }>
              <span>{currentVersion}</span>
              {targetUpdate && (
                <>
                  <ArrowRight className="size-2" />
                  <span className={`font-bold ${isUpgrade ? 'text-success' : 'text-warning'}`}>{targetVersion}</span>
                </>
              )}
            </span>
          )}

          {/* Warnings/Unloaded Indicators */}
          {foundUnloaded && (
            <Tooltip delay={300}>
              <Tooltip.Trigger>
                <div className="text-warning cursor-help shrink-0">
                  <ShieldWarning className="size-4" />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                <p className="text-xs">{foundUnloaded.message}</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {/* Module Config Trigger */}
          {foundInstalled && !isExtension && (
            <>
              <ModuleConfigModal isOpen={configModal.isOpen} onClose={configModal.close} />
              <Button
                onClick={e => {
                  e.stopPropagation();
                  configModal.open();
                }}
                size="sm"
                variant="secondary"
                className="size-7 min-w-0 p-0 rounded-lg hover:bg-surface-secondary"
                isIconOnly>
                <SettingsMinimalistic className="size-3.5" />
              </Button>
            </>
          )}

          {/* Update Action Button */}
          <div className="scale-90 origin-right">
            <UpdateButton item={item} isIconOnly />
          </div>

          {/* Spinning Actions */}
          {isInstalling && <Spinner size="sm" className="size-4 shrink-0" />}
          {isUnInstalling && <Spinner size="sm" color="warning" className="size-4 shrink-0" />}
        </div>

        <InstallProgress pluginUrl={item.url} isInstalling={isInstalling} />
      </Card>
    );
  }

  // Render Default Layout
  return (
    <Card
      className={
        `relative border border-surface/50 transition-all! duration-300!` +
        ` hover:bg-surface/70 dark:hover:bg-black/70 ${isCompatible ? 'cursor-pointer' : ''}` +
        ` ${isSelected && (isExtension ? 'border-accent!' : 'border-LynxPurple!')}`
      }
      key={`${item.metadata.id}_plugin_list_item`}
      onClick={isCompatible ? handleSelect : undefined}>
      {!isCompatible && (
        <div
          className={
            'absolute inset-0 z-20 flex flex-col items-center justify-center gap-y-1 ' + 'bg-surface-tertiary/50'
          }>
          <Tooltip delay={300}>
            <Tooltip.Trigger>
              <QuestionCircle
                className={
                  'size-10 rounded-full bg-surface p-1 text-warning/80 transition-colors' +
                  ' duration-200 hover:text-warning'
                }
              />
            </Tooltip.Trigger>
            <Tooltip.Content className="whitespace-pre" showArrow>
              <Tooltip.Arrow />
              <p className="text-wrap">{item.incompatibleReason}</p>
            </Tooltip.Content>
          </Tooltip>
          <span className="rounded-lg bg-surface px-2 py-1 text-sm">Incompatible</span>
          {foundInstalled && (
            <div className="absolute right-2 top-2 rounded-lg bg-surface p-1">
              <Button size="sm" variant="danger-soft" onClick={handleUninstall} isIconOnly>
                <TrashBin2 className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Card.Header>
        <div className="inline-flex items-center gap-2">
          <Avatar>
            <Avatar.Image alt={item.metadata.title} src={getCacheUrl(getPluginIconUrl(item.url))} />
            <Avatar.Fallback>{getFallbackString(item.metadata.title)}</Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              onPress={() => window.open(item.url)}
              className={`no-underline hover:underline ${isExtension ? 'text-accent' : 'text-LynxPurple'}`}>
              {item.metadata.title}
            </Link>
            <Description>
              By <span className="font-bold text-muted">{extractGitUrl(item.url).owner}</span>
            </Description>
            <div className="flex flex-wrap gap-x-1 items-center">
              <Description>
                {currentVersion !== 'N/A' && (
                  <span className="flex flex-row items-center justify-center gap-x-0.5 w-fit mt-0.5 tracking-tight">
                    <span>{currentVersion}</span>
                    {targetUpdate && (
                      <>
                        <ArrowRight className="size-2.5" />
                        <span className={`${isUpgrade ? 'text-success' : 'text-warning'}`}>{targetVersion}</span>
                      </>
                    )}
                  </span>
                )}
              </Description>
              {foundUnloaded && (
                <Tooltip delay={300}>
                  <Tooltip.Trigger>
                    <Chip size="sm" variant="soft" color="warning" className="px-1.5">
                      <ShieldWarning />
                      Unloaded
                    </Chip>
                  </Tooltip.Trigger>
                  <Tooltip.Content showArrow>
                    <Tooltip.Arrow />
                    <p>{foundUnloaded.message}</p>
                  </Tooltip.Content>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {foundInstalled && <CheckRead className="text-success size-5 absolute top-3 right-3" />}
      </Card.Header>

      <Card.Content>
        <Description className="line-clamp-3 max-[63rem]:line-clamp-2">{item.metadata.description}</Description>
      </Card.Content>

      <Card.Footer className="flex flex-row max-[63rem]:flex-col items-center justify-between gap-x-2">
        <div className="flex flex-row items-center gap-x-1">
          {linux && <Linux_Icon className="size-4 text-surface-foreground/70" />}
          {win32 && <Windows_Icon className="size-4 text-surface-foreground/70" />}
          {darwin && <MacOS_Icon className="size-4 text-surface-foreground/70" />}

          {foundInstalled && (
            <>
              {!isExtension && (
                <>
                  <ModuleConfigModal isOpen={configModal.isOpen} onClose={configModal.close} />
                  <Tooltip delay={500}>
                    <Tooltip.Trigger>
                      <Button size="sm" variant="secondary" className="ml-1 px-2" onPress={configModal.open} isIconOnly>
                        <SettingsMinimalistic className="size-4" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content showArrow>
                      <Tooltip.Arrow />
                      <p>Configure Tools</p>
                    </Tooltip.Content>
                  </Tooltip>
                </>
              )}
            </>
          )}
        </div>

        <UpdateButton item={item} isIconOnly />

        {isInstalling && (
          <div className="flex items-center gap-x-1">
            <Spinner size="sm" />
            <span className="text-sm">Installing...</span>
          </div>
        )}

        {isUnInstalling && (
          <div className="flex items-center gap-x-1">
            <Spinner size="sm" color="warning" />
            <span className="text-sm">Uninstalling...</span>
          </div>
        )}

        <InstallProgress pluginUrl={item.url} isInstalling={isInstalling} />
      </Card.Footer>
    </Card>
  );
}

/** Props for the InstallProgress component. */
interface InstallProgressProps {
  /** Indicates whether the plugin is actively being installed. */
  isInstalling: boolean;
  /** The remote Git repository URL of the plugin. */
  pluginUrl: string;
}

/**
 * Renders a progress bar that listens to download progression via simple-git IPC.
 * It appears at the bottom of the card only when the plugin is being installed.
 */
function InstallProgress({isInstalling, pluginUrl}: InstallProgressProps) {
  const [installProgress, setInstallProgress] = useState<number>(0);

  useEffect(() => {
    if (!isInstalling) return;

    let isMounted = true;

    const removeListener = gitIpc.onProgress((url, state, result) => {
      if (url === pluginUrl && isMounted) {
        switch (state) {
          case 'Progress':
            setInstallProgress((result as SimpleGitProgressEvent).progress);
            break;
          case 'Failed':
          case 'Completed':
            setInstallProgress(0);
            break;
        }
      }
    });

    return () => {
      isMounted = false;
      removeListener();
    };
  }, [pluginUrl, isInstalling]);

  if (!isInstalling) return null;

  return (
    <ProgressBar
      color="success"
      value={installProgress}
      aria-label="Installing progress"
      className="absolute -bottom-0.5 inset-x-0">
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
